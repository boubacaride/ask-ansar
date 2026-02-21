import { Tabs } from 'expo-router';
import { MessageCircle, BookOpen, Settings } from 'lucide-react-native';
import { useSettings } from '@/store/settingsStore';
import { translate } from '@/utils/i18n';

export default function TabLayout() {
  const { language, darkMode } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
          backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
        },
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#666666',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: translate('chat', language),
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sources"
        options={{
          title: translate('sources', language),
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: translate('settings', language),
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}