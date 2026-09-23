import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

/**
 * Validates that an email address ends with @bergen.org (case-insensitive).
 */
export function isBergenEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@bergen\.org$/.test(clean);
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from storage and subscribe to auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching Supabase session:', error.message);
        }
        if (isMounted) {
          if (data.session) {
            // Ensure persisted session has a valid @bergen.org email
            const email = data.session.user?.email || '';
            if (isBergenEmail(email)) {
              setSession(data.session);
              setUser(data.session.user);
            } else {
              // Non-bergen.org user somehow persisted; sign out
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            }
          } else {
            setSession(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error checking session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;

        if (newSession) {
          const email = newSession.user?.email || '';
          if (isBergenEmail(email)) {
            setSession(newSession);
            setUser(newSession.user);
          } else {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const sendOtp = useCallback(async (email: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Client-side domain check
    if (!isBergenEmail(cleanEmail)) {
      return {
        error: new Error('Only @bergen.org email addresses are authorized for BCAway.'),
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }, []);

  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<{ error: Error | null }> => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = token.trim();

      if (!isBergenEmail(cleanEmail)) {
        return {
          error: new Error('Only @bergen.org email addresses are authorized for BCAway.'),
        };
      }

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'email',
        });

        if (error) {
          return { error };
        }

        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }

        return { error: null };
      } catch (err) {
        return {
          error: err instanceof Error ? err : new Error(String(err)),
        };
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error during signOut:', err);
    } finally {
      setSession(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        sendOtp,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
