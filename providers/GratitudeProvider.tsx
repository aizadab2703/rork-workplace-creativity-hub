import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Jar, Note, DurationOption } from '@/types';
import { generateId } from '@/utils/helpers';
import { useAuth } from '@/providers/AuthProvider';

const STORAGE_KEYS = {
  JARS: 'gratitude_jars',
  NOTES: 'gratitude_notes',
};

export const [GratitudeProvider, useGratitude] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { user: authUser, isAuthenticated, signOut: authSignOut } = useAuth();

  const [jars, setJars] = useState<Jar[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  const userId = authUser?.id ?? null;
  const userEmail = authUser?.email ?? '';
  const userName = authUser?.user_metadata?.name ?? userEmail.split('@')[0] ?? 'User';

  const dataQuery = useQuery({
    queryKey: ['gratitude-data', userId],
    queryFn: async () => {
      console.log('[GratitudeProvider] Loading data from storage...');
      const [jarsData, notesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.JARS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTES),
      ]);
      const allJars = jarsData ? JSON.parse(jarsData) as Jar[] : [];
      const allNotes = notesData ? JSON.parse(notesData) as Note[] : [];
      const userJars = userId ? allJars.filter(j => j.userId === userId) : [];
      const userNotes = userId ? allNotes.filter(n => n.userId === userId) : [];
      return { jars: userJars, notes: userNotes };
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (dataQuery.data) {
      setJars(dataQuery.data.jars);
      setNotes(dataQuery.data.notes);
      setIsReady(true);
      console.log('[GratitudeProvider] Data loaded:', {
        jarsCount: dataQuery.data.jars.length,
        notesCount: dataQuery.data.notes.length,
      });
    }
  }, [dataQuery.data]);

  useEffect(() => {
    if (!userId) {
      setIsReady(true);
    }
  }, [userId]);

  const { mutate: saveJars } = useMutation({
    mutationFn: async (updatedJars: Jar[]) => {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.JARS);
      const allJars = existing ? JSON.parse(existing) as Jar[] : [];
      const otherJars = allJars.filter(j => j.userId !== userId);
      const merged = [...otherJars, ...updatedJars];
      await AsyncStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(merged));
      return updatedJars;
    },
    onSuccess: (updatedJars) => {
      setJars(updatedJars);
    },
  });

  const { mutate: saveNotes } = useMutation({
    mutationFn: async (updatedNotes: Note[]) => {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      const allNotes = existing ? JSON.parse(existing) as Note[] : [];
      const otherNotes = allNotes.filter(n => n.userId !== userId);
      const merged = [...otherNotes, ...updatedNotes];
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(merged));
      return updatedNotes;
    },
    onSuccess: (updatedNotes) => {
      setNotes(updatedNotes);
    },
  });

  const signOut = useCallback(async () => {
    console.log('[GratitudeProvider] Signing out...');
    await authSignOut();
    setJars([]);
    setNotes([]);
    queryClient.invalidateQueries({ queryKey: ['gratitude-data'] });
  }, [authSignOut, queryClient]);

  const createJar = useCallback((durationMinutes: DurationOption) => {
    if (!userId) return null;
    const now = new Date();
    const unlockDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const newJar: Jar = {
      id: generateId(),
      userId,
      startDate: now.toISOString(),
      unlockDate: unlockDate.toISOString(),
      durationMinutes,
      isUnlocked: false,
      createdAt: now.toISOString(),
    };
    console.log('[GratitudeProvider] Creating jar:', newJar.id, 'durationMinutes:', durationMinutes);
    const updated = [...jars, newJar];
    saveJars(updated);
    return newJar;
  }, [userId, jars, saveJars]);

  const addNote = useCallback((text: string) => {
    if (!userId) return null;
    const activeJar = getActiveJar();
    if (!activeJar) return null;
    const newNote: Note = {
      id: generateId(),
      jarId: activeJar.id,
      userId,
      text,
      createdAt: new Date().toISOString(),
    };
    console.log('[GratitudeProvider] Adding note to jar:', activeJar.id);
    const updated = [...notes, newNote];
    saveNotes(updated);
    return newNote;
  }, [userId, jars, notes, saveNotes]);

  const unlockJar = useCallback((jarId: string) => {
    console.log('[GratitudeProvider] Unlocking jar:', jarId);
    const updated = jars.map(j =>
      j.id === jarId ? { ...j, isUnlocked: true } : j
    );
    saveJars(updated);
  }, [jars, saveJars]);

  const updateJarDuration = useCallback((jarId: string, newDurationMinutes: DurationOption) => {
    console.log('[GratitudeProvider] Updating jar duration:', jarId, 'to', newDurationMinutes, 'minutes');
    const updated = jars.map(j => {
      if (j.id !== jarId) return j;
      const newUnlockDate = new Date(new Date(j.startDate).getTime() + newDurationMinutes * 60 * 1000);
      return { ...j, durationMinutes: newDurationMinutes, unlockDate: newUnlockDate.toISOString() };
    });
    saveJars(updated);
  }, [jars, saveJars]);

  const getActiveJar = useCallback((): Jar | null => {
    return jars.find(j => !j.isUnlocked) ?? null;
  }, [jars]);

  const getNotesForJar = useCallback((jarId: string): Note[] => {
    return notes.filter(n => n.jarId === jarId).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [notes]);

  const getArchivedJars = useCallback((): Jar[] => {
    return jars.filter(j => j.isUnlocked).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [jars]);

  return {
    user: authUser ? {
      id: userId ?? '',
      email: userEmail,
      name: userName,
      provider: 'email' as const,
      createdAt: authUser.created_at ?? '',
    } : null,
    jars,
    notes,
    isReady,
    isLoading: dataQuery.isLoading,
    isAuthenticated,
    signOut,
    createJar,
    addNote,
    unlockJar,
    updateJarDuration,
    getActiveJar,
    getNotesForJar,
    getArchivedJars,
  };
});
