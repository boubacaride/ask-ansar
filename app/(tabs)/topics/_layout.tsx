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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Sujets Islamiques',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="croyance"
        options={{
          title: 'Questions sur la croyance',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="pratiques"
        options={{
          title: 'Questions sur les pratiques religieuses',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="famille"
        options={{
          title: 'Questions sur la famille',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="au-dela"
        options={{
          title: 'Questions sur l\'au-delà',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="prophetes"
        options={{
          title: 'Questions sur les prophètes',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="coran"
        options={{
          title: 'Questions sur le Coran',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="ethique"
        options={{
          title: 'Questions sur l\'éthique',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="interdictions"
        options={{
          title: 'Questions sur les interdictions',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="undefined"
        options={{
          title: 'Questions non définies & divergences',
          headerBackTitle: 'Retour',
        }}
      />
      <Stack.Screen
        name="[topic]"
        options={({ route }) => ({
          title: route.params?.topic || 'Topic',
          headerBackTitle: 'Retour',
        })}
      />
    </Stack>
  );
}