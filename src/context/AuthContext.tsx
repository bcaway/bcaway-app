import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';

/**
 * Validates that an email address ends with @bergen.org (case-insensitive).
 */
export function isBergenEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@bergen\.org$/.test(clean);
}

/**
 * Validates that an email address ends with @bcaway.app (case-insensitive).
 */
export function isBcawayEmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@bcaway\.app$/.test(clean);
}

/**
 * Checks if an email is an authorized BCAway account domain (@bergen.org or @bcaway.app).
 */
export function isAuthorizedEmail(email: string): boolean {
  return isBergenEmail(email) || isBcawayEmail(email);
}

/**
 * Extracts and sets the Supabase session from an incoming confirmation link URL.
 */
async function handleAuthUrl(url: string) {
  try {
    const parsed = Linking.parse(url);
    if (parsed.queryParams?.code) {
      await supabase.auth.exchangeCodeForSession(String(parsed.queryParams.code));
      return;
    }

    if (url.includes('#') || url.includes('access_token')) {
      const hash = url.split('#')[1] || url.split('?')[1] || '';
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    }
  } catch (err) {
    console.warn('Error processing auth URL:', err);
  }
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  sendMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
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
            // Ensure persisted session has a valid authorized email (@bergen.org or @bcaway.app)
            const email = data.session.user?.email || '';
            if (isAuthorizedEmail(email)) {
              setSession(data.session);
              setUser(data.session.user);
            } else {
              // Unauthorized domain user somehow persisted; sign out
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

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;

        if (newSession) {
          const email = newSession.user?.email || '';
          if (isAuthorizedEmail(email)) {
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

    // Listen for incoming deep link confirmation URLs
    const linkingSub = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) {
        handleAuthUrl(initialUrl);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      linkingSub.remove();
    };
  }, []);

  const sendMagicLink = useCallback(async (email: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();

    // @bcaway.app accounts MUST sign in using passwords, not magic links
    if (isBcawayEmail(cleanEmail)) {
      return {
        error: new Error('@bcaway.app accounts must sign in using their administrator-assigned password.'),
      };
    }

    // Client-side domain check for students
    if (!isBergenEmail(cleanEmail)) {
      return {
        error: new Error('Only @bergen.org email addresses are authorized for student sign-in.'),
      };
    }

    try {
      const redirectUrl = Linking.createURL('/');

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
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

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      const cleanEmail = email.trim().toLowerCase();

      // Only @bcaway.app email addresses are permitted to use password sign-in
      if (!isBcawayEmail(cleanEmail)) {
        return {
          error: new Error('Password sign-in is only permitted for @bcaway.app accounts.'),
        };
      }

      if (!password) {
        return {
          error: new Error('Please enter your password.'),
        };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
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
        sendMagicLink,
        signInWithPassword,
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
