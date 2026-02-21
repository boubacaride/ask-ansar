import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Required for OAuth on iOS/Android to dismiss the auth browser automatically
WebBrowser.maybeCompleteAuthSession();

interface SendOtpParams {
  email: string;
  fullName?: string;
}

interface VerifyOtpParams {
  email: string;
  token: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Send 6-digit OTP to email. Creates user on first call.
  const sendOtp = async ({ email, fullName }: SendOtpParams) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    if (error) throw error;
  };

  // Verify the 6-digit code
  const verifyOtp = async ({ email, token }: VerifyOtpParams) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
  };

  // Google Sign-In via Supabase OAuth + expo-web-browser
  const signInWithGoogle = async () => {
    const redirectTo = Linking.createURL('auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success') {
      const url = result.url;
      // Extract fragment params (Supabase returns tokens in URL fragment)
      const hashPart = url.split('#')[1];
      if (hashPart) {
        const params = new URLSearchParams(hashPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
        }
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    session,
    user,
    loading,
    sendOtp,
    verifyOtp,
    signInWithGoogle,
    signOut,
  };
}
