import { Stack } from 'expo-router';
import { useSettings } from '@/store/settingsStore';

export default function QuizLayout() {
  const { darkMode } = useSettings();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: darkMode ? '#1a1a2e' : '#ffffff',
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="play" />
      <Stack.Screen name="event-result" />
      <Stack.Screen name="final-result" />
    </Stack>
  );
}
