import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabaseClient";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import type { User } from "@/types";

interface AuthState {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<ReturnType<typeof supabase.auth.signUp>["data"]>;
  signIn: (email: string, password: string) => Promise<ReturnType<typeof supabase.auth.signInWithPassword>["data"]>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "full_name">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string, email: string, fullName?: string) => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) return data as User;

      const { data: created, error } = await supabase
        .from("users")
        .insert({ id: userId, email, full_name: fullName ?? null })
        .select()
        .single();

      if (error) throw error;
      return created as User;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      let profile: User | null = null;
      if (session?.user) {
        profile = await fetchProfile(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name
        );
      }
      if (mounted) {
        setState({ user: session?.user ?? null, profile, session, loading: false });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // On token refresh, just update the session/user without re-querying the profile
      if (event === "TOKEN_REFRESHED") {
        setState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          session,
        }));
        return;
      }

      // On sign out, clear everything
      if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, session: null, loading: false });
        return;
      }

      // On sign in / initial session, fetch profile
      let profile: User | null = null;
      if (session?.user) {
        profile = await fetchProfile(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name
        );
      }
      if (mounted) {
        setState({ user: session?.user ?? null, profile, session, loading: false });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    const profile = await fetchProfile(state.user.id, state.user.email!);
    setState((prev) => ({ ...prev, profile }));
  };

  return (
    <AuthContext value={{
      ...state,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateProfile,
    }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
