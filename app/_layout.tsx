import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/useAuth';

// Import icon fonts for web registration
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const clearMessages = useChatStore(state => state.clearMessages);
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [iconFontsLoaded, setIconFontsLoaded] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Bold': Inter_700Bold,
    'NotoNaskhArabic-Regular': NotoNaskhArabic_400Regular,
    'NotoNaskhArabic-Bold': NotoNaskhArabic_700Bold,
  });

  // Load vector icon fonts using their built-in loadFont() for proper web @font-face registration
  useEffect(() => {
    async function loadIconFonts() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          ...FontAwesome5.font,
          ...MaterialCommunityIcons.font,
          ...MaterialIcons.font,
        });
      } catch (e) {
        console.warn('Icon font loading error:', e);
      } finally {
        setIconFontsLoaded(true);
      }
    }
    loadIconFonts();
  }, []);

  useEffect(() => {
    clearMessages();
  }, []);

  const allFontsReady = (fontsLoaded || fontError) && iconFontsLoaded;

  useEffect(() => {
    if (allFontsReady) {
      SplashScreen.hideAsync();
    }
  }, [allFontsReady]);

  useEffect(() => {
    if (loading || !allFontsReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isNavigationReady) {
      setIsNavigationReady(true);

      if (!session && !inAuthGroup) {
        router.replace('/(auth)/welcome');
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, loading, allFontsReady, segments, isNavigationReady]);

  // Ensure proper initialization on web platform — mobile fixes + PWA meta tags
  useEffect(() => {
    if (Platform.OS === 'web') {
      const head = document.head;

      // ─── 1. Fix viewport meta for mobile browsers ───
      const existingViewport = document.querySelector('meta[name="viewport"]');
      if (existingViewport) {
        existingViewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }

      // ─── 2. Inject critical mobile CSS fixes ───
      if (!document.getElementById('mobile-web-fixes')) {
        const mobileCSS = document.createElement('style');
        mobileCSS.id = 'mobile-web-fixes';
        mobileCSS.textContent = `
          /* Fix mobile browser height (address bar issue) */
          html, body {
            height: 100% !important;
            height: 100dvh !important;
            overflow: hidden !important;
            overscroll-behavior: none !important;
            -webkit-overflow-scrolling: touch;
            position: fixed !important;
            width: 100% !important;
            top: 0;
            left: 0;
          }
          #root {
            height: 100% !important;
            height: 100dvh !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          /* Prevent text size adjust on orientation change */
          html {
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
          }
          /* Fix input zoom on iOS (font-size < 16px triggers zoom) */
          input, textarea, select {
            font-size: 16px !important;
          }
          /* Disable tap highlight on mobile */
          * {
            -webkit-tap-highlight-color: transparent;
          }
          /* Smooth scrolling for scroll containers */
          [data-testid="flatlist"], [role="list"] {
            -webkit-overflow-scrolling: touch !important;
          }
          /* Fix for iOS rubber-band scrolling on body */
          body {
            touch-action: none;
          }
          /* Allow touch scrolling inside scroll containers */
          [style*="overflow: auto"], [style*="overflow-y: auto"],
          [style*="overflow: scroll"], [style*="overflow-y: scroll"] {
            touch-action: pan-y !important;
            -webkit-overflow-scrolling: touch !important;
          }
        `;
        head.appendChild(mobileCSS);
      }

      // ─── 3. PWA meta tags for mobile ───
      const addMeta = (name: string, content: string, attr = 'name') => {
        const selector = attr === 'name' ? `meta[name="${name}"]` : `meta[property="${name}"]`;
        if (!document.querySelector(selector)) {
          const meta = document.createElement('meta');
          meta.setAttribute(attr, name);
          meta.content = content;
          head.appendChild(meta);
        }
      };

      const addLink = (rel: string, href: string) => {
        if (!document.querySelector(`link[rel="${rel}"]`)) {
          const link = document.createElement('link');
          link.rel = rel;
          link.href = href;
          head.appendChild(link);
        }
      };

      // Theme color for mobile browser chrome
      addMeta('theme-color', '#0053C1');
      addMeta('apple-mobile-web-app-capable', 'yes');
      addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
      addMeta('apple-mobile-web-app-title', 'Ask Ansar');
      addMeta('mobile-web-app-capable', 'yes');
      addMeta('format-detection', 'telephone=no');

      // Social sharing meta tags
      addMeta('og:image', 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png', 'property');
      addMeta('og:title', 'Ask Ansar', 'property');
      addMeta('og:description', 'Your trusted companion for Islamic knowledge', 'property');
      addMeta('twitter:image', 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png');
      addMeta('twitter:card', 'summary');

      // Favicon & Apple touch icon
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.type = 'image/png';
        favicon.href = 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png';
      }
      addLink('apple-touch-icon', 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png');

      // ─── 4. Force re-render for proper router initialization ───
      const timeout = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Return null while fonts are loading
  if (!allFontsReady) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}