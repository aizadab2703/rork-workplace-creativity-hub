import { useEffect, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { User, Jar, Note, DurationOption } from '@/types';
import { supabase } from '@/utils/supabase';

export const [GratitudeProvider, useGratitude] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [jars, setJars] = useState<Jar[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    console.log('[GratitudeProvider] Initializing auth listener...');
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      console.log('[GratitudeProvider] Initial session:', !!s);
      if (s?.user) {
        setUser({
          id: s.user.id,
          email: s.user.email ?? '',
          name: s.user.email?.split('@')[0] ?? 'User',
          provider: 'email',
          createdAt: s.user.created_at,
        });
      }
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      console.log('[GratitudeProvider] Auth state changed:', _event, !!s);
      if (s?.user) {
        setUser({
          id: s.user.id,
          email: s.user.email ?? '',
          name: s.user.email?.split('@')[0] ?? 'User',
          provider: 'email',
          createdAt: s.user.created_at,
        });
      } else {
        setUser(null);
      }
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const jarsQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['jars', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('[GratitudeProvider] Fetching jars for user:', user.id);
      const { data, error } = await supabase
        .from('jars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.log('[GratitudeProvider] Jars fetch error:', error.message);
        return [];
      }
      return (data ?? []).map((j: Record<string, unknown>) => ({
        id: j.id as string,
        userId: j.user_id as string,
        startDate: j.start_date as string,
        unlockDate: j.unlock_date as string,
        durationMinutes: j.duration_minutes as number,
        isUnlocked: j.is_unlocked as boolean,
        createdAt: j.created_at as string,
      })) as Jar[];
    },
    enabled: !!user,
  });

  const notesQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log('[GratitudeProvider] Fetching notes for user:', user.id);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) {
        console.log('[GratitudeProvider] Notes fetch error:', error.message);
        return [];
      }
      return (data ?? []).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        jarId: n.jar_id as string,
        userId: n.user_id as string,
        text: n.text as string,
        createdAt: n.created_at as string,
      })) as Note[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (jarsQuery.data) {
      setJars(jarsQuery.data);
    }
  }, [jarsQuery.data]);

  useEffect(() => {
    if (notesQuery.data) {
      setNotes(notesQuery.data);
    }
  }, [notesQuery.data]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    console.log('[GratitudeProvider] Signing in:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('[GratitudeProvider] Sign in error:', error.message);
      return { error: error.message };
    }
    queryClient.invalidateQueries({ queryKey: ['jars'] });
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    return {};
  }, [queryClient]);

  const signUp = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    console.log('[GratitudeProvider] Signing up:', email);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.log('[GratitudeProvider] Sign up error:', error.message);
      return { error: error.message };
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    console.log('[GratitudeProvider] Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setJars([]);
    setNotes([]);
    queryClient.clear();
  }, [queryClient]);

  const { mutate: createJarMutate } = useMutation({
    mutationFn: async (durationMinutes: DurationOption) => {
      if (!user) throw new Error('No user');
      const now = new Date();
      const unlockDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
      const { data, error } = await supabase
        .from('jars')
        .insert({
          user_id: user.id,
          start_date: now.toISOString(),
          unlock_date: unlockDate.toISOString(),
          duration_minutes: durationMinutes,
          is_unlocked: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jars', user?.id] });
    },
  });

  const createJar = useCallback((durationMinutes: DurationOption) => {
    if (!user) return null;
    console.log('[GratitudeProvider] Creating jar with duration:', durationMinutes);
    const now = new Date();
    const unlockDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
    const optimisticJar: Jar = {
      id: 'temp-' + Date.now(),
      userId: user.id,
      startDate: now.toISOString(),
      unlockDate: unlockDate.toISOString(),
      durationMinutes,
      isUnlocked: false,
      createdAt: now.toISOString(),
    };
    setJars(prev => [...prev, optimisticJar]);
    createJarMutate(durationMinutes);
    return optimisticJar;
  }, [user, createJarMutate]);

  const { mutate: addNoteMutate } = useMutation({
    mutationFn: async ({ text, jarId }: { text: string; jarId: string }) => {
      if (!user) throw new Error('No user');
      const { data, error } = await supabase
        .from('notes')
        .insert({
          jar_id: jarId,
          user_id: user.id,
          text,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', user?.id] });
    },
  });

  const getActiveJar = useCallback((): Jar | null => {
    return jars.find(j => !j.isUnlocked) ?? null;
  }, [jars]);

  const addNote = useCallback((text: string) => {
    if (!user) return null;
    const active = jars.find(j => !j.isUnlocked) ?? null;
    if (!active) return null;
    console.log('[GratitudeProvider] Adding note to jar:', active.id);
    const optimisticNote: Note = {
      id: 'temp-' + Date.now(),
      jarId: active.id,
      userId: user.id,
      text,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, optimisticNote]);
    addNoteMutate({ text, jarId: active.id });
    return optimisticNote;
  }, [user, jars, addNoteMutate]);

  const { mutate: unlockJarMutate } = useMutation({
    mutationFn: async (jarId: string) => {
      const { error } = await supabase
        .from('jars')
        .update({ is_unlocked: true })
        .eq('id', jarId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jars', user?.id] });
    },
  });

  const unlockJar = useCallback((jarId: string) => {
    console.log('[GratitudeProvider] Unlocking jar:', jarId);
    setJars(prev => prev.map(j => j.id === jarId ? { ...j, isUnlocked: true } : j));
    unlockJarMutate(jarId);
  }, [unlockJarMutate]);

  const { mutate: updateJarDurationMutate } = useMutation({
    mutationFn: async ({ jarId, newDurationMinutes, startDate }: { jarId: string; newDurationMinutes: DurationOption; startDate: string }) => {
      const newUnlockDate = new Date(new Date(startDate).getTime() + newDurationMinutes * 60 * 1000);
      const { error } = await supabase
        .from('jars')
        .update({
          duration_minutes: newDurationMinutes,
          unlock_date: newUnlockDate.toISOString(),
        })
        .eq('id', jarId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jars', user?.id] });
    },
  });

  const updateJarDuration = useCallback((jarId: string, newDurationMinutes: DurationOption) => {
    console.log('[GratitudeProvider] Updating jar duration:', jarId, 'to', newDurationMinutes);
    setJars(prev => prev.map(j => {
      if (j.id !== jarId) return j;
      const newUnlockDate = new Date(new Date(j.startDate).getTime() + newDurationMinutes * 60 * 1000);
      updateJarDurationMutate({ jarId, newDurationMinutes, startDate: j.startDate });
      return { ...j, durationMinutes: newDurationMinutes, unlockDate: newUnlockDate.toISOString() };
    }));
  }, [updateJarDurationMutate]);

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
    isLoading: jarsQuery.isLoading || notesQuery.isLoading,
    signIn,
    signUp,
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
