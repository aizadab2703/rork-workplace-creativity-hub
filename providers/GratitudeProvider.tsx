import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, Jar, Note, DurationOption } from '@/types';
import { generateId } from '@/utils/helpers';

const STORAGE_KEYS = {
  USER: 'gratitude_user',
  JARS: 'gratitude_jars',
  NOTES: 'gratitude_notes',
};

export const [GratitudeProvider, useGratitude] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [jars, setJars] = useState<Jar[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  const dataQuery = useQuery({
    queryKey: ['gratitude-data'],
    queryFn: async () => {
      console.log('[GratitudeProvider] Loading data from storage...');
      const [userData, jarsData, notesData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.JARS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTES),
      ]);
      return {
        user: userData ? JSON.parse(userData) as User : null,
        jars: jarsData ? JSON.parse(jarsData) as Jar[] : [],
        notes: notesData ? JSON.parse(notesData) as Note[] : [],
      };
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setUser(dataQuery.data.user);
      setJars(dataQuery.data.jars);
      setNotes(dataQuery.data.notes);
      setIsReady(true);
      console.log('[GratitudeProvider] Data loaded:', {
        hasUser: !!dataQuery.data.user,
        jarsCount: dataQuery.data.jars.length,
        notesCount: dataQuery.data.notes.length,
      });
    }
  }, [dataQuery.data]);

  const saveUserMutation = useMutation({
    mutationFn: async (newUser: User) => {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      return newUser;
    },
    onSuccess: (newUser) => {
      setUser(newUser);
    },
  });

  const saveJarsMutation = useMutation({
    mutationFn: async (updatedJars: Jar[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.JARS, JSON.stringify(updatedJars));
      return updatedJars;
    },
    onSuccess: (updatedJars) => {
      setJars(updatedJars);
    },
  });

  const saveNotesMutation = useMutation({
    mutationFn: async (updatedNotes: Note[]) => {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
      return updatedNotes;
    },
    onSuccess: (updatedNotes) => {
      setNotes(updatedNotes);
    },
  });

  const signIn = useCallback((provider: 'apple' | 'google', name: string, email: string) => {
    const newUser: User = {
      id: generateId(),
      email,
      name,
      provider,
      createdAt: new Date().toISOString(),
    };
    console.log('[GratitudeProvider] Signing in user:', newUser.email);
    saveUserMutation.mutate(newUser);
  }, [saveUserMutation]);

  const signOut = useCallback(async () => {
    console.log('[GratitudeProvider] Signing out...');
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.JARS),
      AsyncStorage.removeItem(STORAGE_KEYS.NOTES),
    ]);
    setUser(null);
    setJars([]);
    setNotes([]);
    queryClient.invalidateQueries({ queryKey: ['gratitude-data'] });
  }, [queryClient]);

  const createJar = useCallback((durationMinutes: DurationOption) => {
    if (!user) return null;
    const now = new Date();
    const unlockDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const newJar: Jar = {
      id: generateId(),
      userId: user.id,
      startDate: now.toISOString(),
      unlockDate: unlockDate.toISOString(),
      durationMinutes,
      isUnlocked: false,
      createdAt: now.toISOString(),
    };
    console.log('[GratitudeProvider] Creating jar:', newJar.id, 'durationMinutes:', durationMinutes);
    const updated = [...jars, newJar];
    saveJarsMutation.mutate(updated);
    return newJar;
  }, [user, jars, saveJarsMutation]);

  const addNote = useCallback((text: string) => {
    if (!user) return null;
    const activeJar = getActiveJar();
    if (!activeJar) return null;
    const newNote: Note = {
      id: generateId(),
      jarId: activeJar.id,
      userId: user.id,
      text,
      createdAt: new Date().toISOString(),
    };
    console.log('[GratitudeProvider] Adding note to jar:', activeJar.id);
    const updated = [...notes, newNote];
    saveNotesMutation.mutate(updated);
    return newNote;
  }, [user, jars, notes, saveNotesMutation]);

  const unlockJar = useCallback((jarId: string) => {
    console.log('[GratitudeProvider] Unlocking jar:', jarId);
    const updated = jars.map(j =>
      j.id === jarId ? { ...j, isUnlocked: true } : j
    );
    saveJarsMutation.mutate(updated);
  }, [jars, saveJarsMutation]);

  const updateJarDuration = useCallback((jarId: string, newDurationMinutes: DurationOption) => {
    console.log('[GratitudeProvider] Updating jar duration:', jarId, 'to', newDurationMinutes, 'minutes');
    const updated = jars.map(j => {
      if (j.id !== jarId) return j;
      const newUnlockDate = new Date(new Date(j.startDate).getTime() + newDurationMinutes * 60 * 1000);
      return { ...j, durationMinutes: newDurationMinutes, unlockDate: newUnlockDate.toISOString() };
    });
    saveJarsMutation.mutate(updated);
  }, [jars, saveJarsMutation]);

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
    user,
    jars,
    notes,
    isReady,
    isLoading: dataQuery.isLoading,
    signIn,
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
