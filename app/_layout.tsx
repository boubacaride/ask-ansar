import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import * as SplashScreen from 'expo-splash-screen';
import { useChatStore } from '@/store/chatStore';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Initialize framework
  useFrameworkReady();
  const clearMessages = useChatStore(state => state.clearMessages);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Bold': Inter_700Bold,
    'NotoNaskhArabic-Regular': NotoNaskhArabic_400Regular,
    'NotoNaskhArabic-Bold': NotoNaskhArabic_700Bold,
  });

  useEffect(() => {
    // Clear messages when the app starts
    clearMessages();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Ensure proper initialization on web platform
  useEffect(() => {
    if (Platform.OS === 'web') {
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}