import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { useVoiceStore } from '@/store/voiceStore';
import { useTTS } from '@/hooks/useTTS';
import { FR } from '@/ui/strings.fr';
import { SoundWaveAnimation } from './SoundWaveAnimation';

interface SpeakerButtonProps {
  messageId: string;
  messageText: string;
  darkMode: boolean;
}

/**
 * Small action button that plays/stops TTS for a single bot message.
 * Self-subscribes to voiceStore so MessageBubble's memo is unaffected.
 */
export function SpeakerButton({ messageId, messageText, darkMode }: SpeakerButtonProps) {
  const playingMessageId = useVoiceStore((state) => state.playingMessageId);
  const isThisPlaying = playingMessageId === messageId;
  const { speak, stop } = useTTS();

  const iconColor = darkMode ? '#4A9EFF' : '#0053C1';

  const handlePress = async () => {
    if (isThisPlaying) {
      await stop();
    } else {
      await speak(messageText, messageId);
    }
  };

  return (
    <Pressable
      style={[styles.actionButton, darkMode && styles.actionButtonDark]}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={isThisPlaying ? FR.stopListening : FR.listen}
    >
      {isThisPlaying ? (
        <>
          <VolumeX size={14} color={iconColor} />
          <SoundWaveAnimation isActive color={iconColor} size={14} />
        </>
      ) : (
        <Volume2 size={14} color={iconColor} />
      )}
      <Text style={[styles.actionButtonText, darkMode && styles.actionButtonTextDark]}>
        {isThisPlaying ? FR.stopListening : FR.listen}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  actionButtonDark: {
    backgroundColor: '#374151',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#0053C1',
    fontWeight: '600',
  },
  actionButtonTextDark: {
    color: '#4A9EFF',
  },
});
