import { View, Text, StyleSheet, Modal, Pressable, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { X, Mail, Copy } from 'lucide-react-native';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  text: string;
  darkMode: boolean;
}

const PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    letter: 'W',
    getUrl: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    letter: 'f',
    getUrl: (_text: string) => `https://www.facebook.com/sharer/sharer.php`,
    copyFirst: true,
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    color: '#000000',
    letter: 'X',
    getUrl: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 280))}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    color: '#0088CC',
    letter: 'T',
    getUrl: (text: string) => `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    color: '#010101',
    letter: 'T',
    getUrl: (_text: string) => `https://www.tiktok.com`,
    copyFirst: true,
  },
  {
    id: 'email',
    label: 'E-mail',
    color: '#0f766e',
    letter: '',
    isEmail: true,
    getUrl: (text: string) => `mailto:?subject=${encodeURIComponent('Ask Ansar - Réponse')}&body=${encodeURIComponent(text)}`,
  },
  {
    id: 'copy',
    label: 'Copier',
    color: '#64748b',
    letter: '',
    isCopy: true,
    getUrl: (_text: string) => '',
  },
] as const;

export default function ShareModal({ visible, onClose, text, darkMode }: ShareModalProps) {
  const [copiedToast, setCopiedToast] = useState(false);

  const handlePlatformPress = async (platform: typeof PLATFORMS[number]) => {
    if ((platform as any).copyFirst || (platform as any).isCopy) {
      await Clipboard.setStringAsync(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
      if ((platform as any).isCopy) { onClose(); return; }
    }

    try {
      const url = platform.getUrl(text);
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Clipboard.setStringAsync(text);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
      }
    } catch {
      await Clipboard.setStringAsync(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, darkMode && styles.sheetDark]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, darkMode && styles.sheetTitleDark]}>
              Partager via
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={darkMode ? '#94a3b8' : '#64748b'} />
            </Pressable>
          </View>

          {copiedToast && (
            <View style={[styles.toast, darkMode && styles.toastDark]}>
              <Text style={styles.toastText}>Texte copié dans le presse-papiers</Text>
            </View>
          )}

          <View style={styles.grid}>
            {PLATFORMS.map((platform) => (
              <Pressable
                key={platform.id}
                style={styles.platformItem}
                onPress={() => handlePlatformPress(platform)}
              >
                <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                  {(platform as any).isCopy ? (
                    <Copy size={22} color="#ffffff" strokeWidth={2} />
                  ) : platform.isEmail ? (
                    <Mail size={22} color="#ffffff" strokeWidth={2} />
                  ) : (
                    <Text style={styles.platformLetter}>{platform.letter}</Text>
                  )}
                </View>
                <Text style={[styles.platformLabel, darkMode && styles.platformLabelDark]} numberOfLines={1}>
                  {platform.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  sheetDark: {
    backgroundColor: '#1e293b',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  sheetTitleDark: {
    color: '#f1f5f9',
  },
  closeButton: {
    padding: 4,
  },
  toast: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignSelf: 'center',
  },
  toastDark: {
    backgroundColor: '#14b8a6',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  platformItem: {
    alignItems: 'center',
    width: 80,
  },
  platformIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  platformLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
  },
  platformLabelDark: {
    color: '#94a3b8',
  },
});
