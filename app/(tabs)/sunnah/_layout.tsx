import { Stack } from 'expo-router';

export default function SunnahLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="djibril" />
      <Stack.Screen name="prophets-video" />
      <Stack.Screen name="salah-guide" />
      <Stack.Screen name="hadith-collections" />
      <Stack.Screen name="bibliotheque" />
      <Stack.Screen name="[categoryId]" />
      <Stack.Screen name="duas/index" />
      <Stack.Screen name="duas/[duaCategoryId]" />
      <Stack.Screen name="duas/categories" />
      <Stack.Screen name="duas/duascom-category" />
      <Stack.Screen name="duas/duascom-detail" />
      <Stack.Screen name="duas/duascom-webview" />
    </Stack>
  );
}
