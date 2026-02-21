import { Stack } from 'expo-router';
import { useSettings } from '@/store/settingsStore';

export default function TopicsLayout() {
  const { darkMode } = useSettings();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: darkMode ? '#1e293b' : '#fff',
        },
        headerTintColor: darkMode ? '#fff' : '#1e293b',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="[topic]"
        options={({ route }) => ({
          title: route.params?.topic || 'Topic',
          headerBackTitle: 'Back',
        })}
      />
    </Stack>
  );
}