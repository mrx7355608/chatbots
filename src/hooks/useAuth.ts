import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { User } from "@/types";

interface AuthState {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
    return data as User | null;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let profile: User | null = null;
      if (session?.user) {
        profile = await fetchProfile(session.user.id);
      }
      setState({
        user: session?.user ?? null,
        profile,
        session,
        loading: false,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      let profile: User | null = null;
      if (session?.user) {
        profile = await fetchProfile(session.user.id);
      }
      setState({
        user: session?.user ?? null,
        profile,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Pick<User, "full_name">>) => {
    if (!state.user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", state.user.id);
    if (error) throw error;
    const profile = await fetchProfile(state.user.id);
    setState((prev) => ({ ...prev, profile }));
  };

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
}
