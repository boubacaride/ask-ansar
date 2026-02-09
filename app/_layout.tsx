import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import * as SplashScreen from 'expo-splash-screen';
import { useChatStore } from '@/store/chatStore';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const clearMessages = useChatStore(state => state.clearMessages);
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Bold': Inter_700Bold,
    'NotoNaskhArabic-Regular': NotoNaskhArabic_400Regular,
    'NotoNaskhArabic-Bold': NotoNaskhArabic_700Bold,
  });

  useEffect(() => {
    clearMessages();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isNavigationReady) {
      setIsNavigationReady(true);

      if (!session && !inAuthGroup) {
        router.replace('/(auth)/welcome');
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, loading, fontsLoaded, segments, isNavigationReady]);

  // Ensure proper initialization on web platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Add meta tags for PWA and social sharing
      const head = document.head;
      
      // Update favicon
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/png';
      favicon.href = 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png';
      if (!document.querySelector('link[rel="icon"]')) head.appendChild(favicon);
      
      // Add apple touch icon
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') || document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png';
      if (!document.querySelector('link[rel="apple-touch-icon"]')) head.appendChild(appleTouchIcon);
      
      // Add Open Graph meta tags
      const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      ogImage.content = 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png';
      if (!document.querySelector('meta[property="og:image"]')) head.appendChild(ogImage);
      
      // Add Twitter meta tags
      const twitterImage = document.querySelector('meta[name="twitter:image"]') || document.createElement('meta');
      twitterImage.name = 'twitter:image';
      twitterImage.content = 'https://ansarv1.s3.us-east-2.amazonaws.com/images/Icon-76%402x.png';
      if (!document.querySelector('meta[name="twitter:image"]')) head.appendChild(twitterImage);
      
      // Force a re-render after initial mount to ensure proper router initialization
      const timeout = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Return null while fonts are loading
  if (!fontsLoaded && !fontError) {
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