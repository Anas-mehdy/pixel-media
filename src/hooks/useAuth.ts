import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  clientId: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    clientId: null,
    isLoading: true,
  });

  const fetchClientId = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("client_id")
      .eq("id", userId)
      .maybeSingle();
    
    return data?.client_id || null;
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer fetching client_id to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchClientId(session.user.id).then(clientId => {
              setAuthState(prev => ({ ...prev, clientId, isLoading: false }));
            });
          }, 0);
        } else {
          setAuthState(prev => ({ ...prev, clientId: null, isLoading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchClientId(session.user.id).then(clientId => {
          setAuthState(prev => ({ ...prev, clientId, isLoading: false }));
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchClientId]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user: authState.user,
    session: authState.session,
    clientId: authState.clientId,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.session,
    signIn,
    signUp,
    signOut,
  };
}
