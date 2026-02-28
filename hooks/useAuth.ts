import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Required for OAuth on iOS/Android to dismiss the auth browser automatically
WebBrowser.maybeCompleteAuthSession();

// Helper: extract tokens from a URL hash fragment and set the Supabase session.
// Matches either deep-link callback (auth/callback#...) or direct hash tokens (#access_token=...).
async function handleOAuthCallbackUrl(url: string) {
  if (!url) return false;
  const hashPart = url.split('#')[1];
  if (!hashPart) return false;
  const params = new URLSearchParams(hashPart);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) {
      console.error('[Auth] Failed to set session from callback URL:', error.message);
      return false;
    }
    return true;
  }
  return false;
}

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

  // Handle OAuth callback deep links (native + web fallback)
  useEffect(() => {
    // Check if app was opened with an auth callback URL
    Linking.getInitialURL().then((url) => {
      if (url) handleOAuthCallbackUrl(url);
    });

    // Listen for subsequent deep link events (native OAuth return)
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url) handleOAuthCallbackUrl(event.url);
    });

    // On web, also check the current page URL for OAuth tokens
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      if (currentUrl.includes('#access_token=')) {
        handleOAuthCallbackUrl(currentUrl).then((handled) => {
          if (handled) {
            // Clean the URL hash so tokens aren't visible in browser
            window.history.replaceState(null, '', window.location.pathname);
          }
        });
      }
    }

    return () => subscription.remove();
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
    // On web, use the current page origin so Google redirects back to the same site
    const redirectTo = Platform.OS === 'web'
      ? window.location.origin
      : Linking.createURL('auth/callback');

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
      const handled = await handleOAuthCallbackUrl(result.url);
      if (!handled) {
        console.warn('[Auth] OAuth returned success but no tokens found in URL:', result.url);
      }
    } else {
      console.warn('[Auth] OAuth browser result:', result.type);
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
