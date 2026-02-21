import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useSettings } from '@/store/settingsStore';

export function useColorScheme() {
  const { darkMode } = useSettings();
  const systemColorScheme = useNativeColorScheme();
  
  return darkMode ? 'dark' : systemColorScheme;
}