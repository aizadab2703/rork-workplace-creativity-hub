import { useEffect, useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { supabaseClient } from '@/lib/supabase-client';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isReady: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
    isReady: false,
  });

  useEffect(() => {
    console.log('[Auth] Initializing auth listener...');
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Initial session:', session ? 'found' : 'none');
      setAuthState({
        session,
        user: session?.user ?? null,
        isLoading: false,
        isReady: true,
      });
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        console.log('[Auth] Auth state changed:', _event);
        setAuthState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          isReady: true,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('[Auth] Signing up:', email);
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('[Auth] Signing in:', email);
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
  });

  const signOut = useCallback(async () => {
    console.log('[Auth] Signing out...');
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error('[Auth] Sign out error:', error);
  }, []);

  return {
    session: authState.session,
    user: authState.user,
    isLoading: authState.isLoading,
    isReady: authState.isReady,
    isAuthenticated: !!authState.session,
    signUp: signUpMutation.mutateAsync,
    signIn: signInMutation.mutateAsync,
    signOut,
    signUpError: signUpMutation.error,
    signInError: signInMutation.error,
    isSigningUp: signUpMutation.isPending,
    isSigningIn: signInMutation.isPending,
  };
});
