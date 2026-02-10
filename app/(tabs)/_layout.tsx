import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '@/store/settingsStore';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type FontAwesome5Name = React.ComponentProps<typeof FontAwesome5>['name'];
type MaterialCommunityName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export default function TabLayout() {
  const { darkMode } = useSettings();

  const colors = {
    background: darkMode ? '#0a0a0a' : '#ffffff',
    tabBar: darkMode ? 'rgba(15, 15, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
    tabBarBorder: darkMode ? '#1e1e2d' : '#e5e5e5',
    activeColor: '#1565C0',
    inactiveColor: darkMode ? '#6b7280' : '#9ca3af',
    activeBg: darkMode ? 'rgba(0, 137, 123, 0.15)' : 'rgba(0, 137, 123, 0.1)',
  };

  const renderTabIcon = (
    name: IconName | FontAwesome5Name | MaterialCommunityName,
    type: 'ionicons' | 'fontawesome5' | 'material-community',
    { focused, color, size }: TabIconProps
  ) => {
    const iconSize = focused ? size + 2 : size;

    const IconComponent = () => {
      switch (type) {
        case 'fontawesome5':
          return <FontAwesome5 name={name as FontAwesome5Name} size={iconSize} color={color} />;
        case 'material-community':
          return <MaterialCommunityIcons name={name as MaterialCommunityName} size={iconSize} color={color} />;
        default:
          return <Ionicons name={name as IconName} size={iconSize} color={color} />;
      }
    };

    return (
      <View style={[styles.iconContainer, focused && { backgroundColor: colors.activeBg }]}>
        <IconComponent />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.activeColor,
        tabBarInactiveTintColor: colors.inactiveColor,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.select({ ios: 88, android: 70, web: 60 }),
          paddingBottom: Platform.select({ ios: 28, android: 10, web: 6 }),
          paddingTop: Platform.select({ ios: 10, android: 10, web: 6 }),
          paddingHorizontal: 4,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'web' ? 10 : 11,
          fontWeight: '600',
          marginTop: Platform.OS === 'web' ? 2 : 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discussion',
          tabBarIcon: (props) => renderTabIcon('chatbubbles', 'ionicons', props),
        }}
      />

      <Tabs.Screen
        name="quran"
        options={{
          title: 'Coran',
          tabBarIcon: (props) => renderTabIcon('book', 'ionicons', props),
        }}
      />

      <Tabs.Screen
        name="sunnah"
        options={{
          title: 'Sunnah',
          tabBarIcon: (props) => renderTabIcon('book-open', 'fontawesome5', props),
        }}
      />

      <Tabs.Screen
        name="topics"
        options={{
          title: 'Sujets',
          tabBarIcon: (props) => renderTabIcon('grid', 'ionicons', props),
        }}
      />

      <Tabs.Screen
        name="seerah-map"
        options={{
          href: null, // Hidden from tab bar, accessible via navigation
        }}
      />

      <Tabs.Screen
        name="navigation"
        options={{
          title: 'Naviguer',
          tabBarIcon: (props) => renderTabIcon('compass', 'fontawesome5', props),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          tabBarIcon: (props) => renderTabIcon('settings-outline', 'ionicons', props),
        }}
      />

      <Tabs.Screen
        name="sources"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
