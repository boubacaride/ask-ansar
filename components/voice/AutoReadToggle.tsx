import { Pressable, View, StyleSheet } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useSettings } from '@/store/settingsStore';
import { FR } from '@/ui/strings.fr';

interface AutoReadToggleProps {
  darkMode: boolean;
}

/**
 * Small toggle button for the chat header that enables/disables auto-read
 * (automatic TTS playback of new bot responses).
 */
export function AutoReadToggle({ darkMode }: AutoReadToggleProps) {
  const autoReadEnabled = useSettings((s) => s.autoReadEnabled);
  const toggleAutoRead = useSettings((s) => s.toggleAutoRead);

  const iconColor = autoReadEnabled
    ? darkMode
      ? '#4A9EFF'
      : '#1565C0'
    : darkMode
      ? '#6B7280'
      : '#9CA3AF';

  return (
    <Pressable
      style={styles.touchTarget}
      onPress={toggleAutoRead}
      accessibilityRole="button"
      accessibilityLabel={autoReadEnabled ? FR.autoReadOn : FR.autoReadOff}
      accessibilityState={{ selected: autoReadEnabled }}
      hitSlop={4}
    >
      <View style={[styles.container, darkMode && styles.containerDark]}>
        {autoReadEnabled ? (
          <Volume2 size={20} color={iconColor} />
        ) : (
          <VolumeX size={20} color={iconColor} />
        )}
        {autoReadEnabled && <View style={[styles.activeDot, darkMode && styles.activeDotDark]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchTarget: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerDark: {
    // placeholder for future dark-mode container styling
  },
  activeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1565C0',
  },
  activeDotDark: {
    backgroundColor: '#4A9EFF',
  },
});
