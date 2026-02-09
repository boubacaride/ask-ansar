import { Stack } from 'expo-router';
import { useSettings } from '@/store/settingsStore';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsLayout() {
  const { darkMode } = useSettings();
  const router = useRouter();

  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: darkMode ? '#1E1E1E' : '#fff',
        },
        headerTintColor: darkMode ? '#fff' : '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={{ marginLeft: 16 }}
          >
            <ArrowLeft size={24} color={darkMode ? '#fff' : '#1976D2'} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="language" 
        options={{
          headerShown: true,
          title: 'Language Settings',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="history" 
        options={{
          headerShown: true,
          title: 'Chat History',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="privacy" 
        options={{
          headerShown: true,
          title: 'Privacy Settings',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="help" 
        options={{
          headerShown: true,
          title: 'Help Center',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="guide" 
        options={{
          headerShown: true,
          title: 'User Guide',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="privacy-policy" 
        options={{
          headerShown: true,
          title: 'Privacy Policy',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="terms" 
        options={{
          headerShown: true,
          title: 'Terms of Service',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}