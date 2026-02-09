import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Linking } from 'react-native';
import { ChevronDown, ChevronUp, Book } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

const HADITH_COLLECTIONS = [
  { id: '1', name: 'Sahih al-Bukhari', arabicName: 'صحيح البخاري', url: 'https://sunnah.com/bukhari' },
  { id: '2', name: 'Sahih Muslim', arabicName: 'صحيح مسلم', url: 'https://sunnah.com/muslim' },
  { id: '3', name: 'Sunan an-Nasa\'i', arabicName: 'سنن النسائي', url: 'https://sunnah.com/nasai' },
  { id: '4', name: 'Sunan Abi Dawud', arabicName: 'سنن أبي داود', url: 'https://sunnah.com/abudawud' },
  { id: '5', name: 'Jami\' at-Tirmidhi', arabicName: 'جامع الترمذي', url: 'https://sunnah.com/tirmidhi' },
  { id: '6', name: 'Sunan Ibn Majah', arabicName: 'سنن ابن ماجه', url: 'https://sunnah.com/ibnmajah' },
  { id: '7', name: 'Muwatta Malik', arabicName: 'موطأ مالك', url: 'https://sunnah.com/malik' },
  { id: '8', name: 'Musnad Ahmad', arabicName: 'مسند أحمد', url: 'https://sunnah.com/ahmad' },
  { id: '9', name: 'Sunan ad-Darimi', arabicName: 'سنن الدارمي', url: 'https://sunnah.com/darimi' },
  { id: '10', name: 'An-Nawawi\'s 40 Hadith', arabicName: 'الأربعون النووية', url: 'https://sunnah.com/nawawi40' },
  { id: '11', name: 'Riyad as-Salihin', arabicName: 'رياض الصالحين', url: 'https://sunnah.com/riyadussalihin' },
  { id: '12', name: 'Al-Adab Al-Mufrad', arabicName: 'الأدب المفرد', url: 'https://sunnah.com/adab' },
  { id: '13', name: 'Ash-Shama\'il Al-Muhammadiyah', arabicName: 'الشمائل المحمدية', url: 'https://sunnah.com/shamail' },
  { id: '14', name: 'Mishkat al-Masabih', arabicName: 'مشكاة المصابيح', url: 'https://sunnah.com/mishkat' },
  { id: '15', name: 'Bulugh al-Maram', arabicName: 'بلوغ المرام', url: 'https://sunnah.com/bulugh' },
  { id: '16', name: 'Collections of Forty', arabicName: 'الأربعينات', url: 'https://sunnah.com/forty' },
  { id: '17', name: 'Hisn al-Muslim', arabicName: 'حصن المسلم', url: 'https://sunnah.com/hisn' }
];

interface HadithDropdownProps {
  darkMode?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HadithDropdown({ darkMode }: HadithDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useSharedValue(0);

  const handlePress = useCallback(() => {
    setIsOpen(!isOpen);
    animation.value = withSpring(isOpen ? 0 : 1, {
      damping: 15,
      stiffness: 100,
    });
  }, [isOpen]);

  const handleCollectionPress = useCallback((url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Error opening URL:', err);
    });
  }, []);

  const dropdownStyle = useAnimatedStyle(() => ({
    maxHeight: withTiming(isOpen ? 400 : 0, { duration: 300 }),
    opacity: withTiming(isOpen ? 1 : 0, { duration: 200 }),
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(animation.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <AnimatedPressable
        style={[
          styles.header,
          darkMode && styles.headerDark,
          isOpen && styles.headerOpen,
        ]}
        onPress={handlePress}
      >
        <View style={styles.selectedInfo}>
          <Book size={24} color={darkMode ? '#90CAF9' : '#1976D2'} />
          <View style={styles.selectedText}>
            <Text style={[styles.title, darkMode && styles.textLight]}>
              Hadith Collections
            </Text>
          </View>
        </View>
        <Animated.View style={rotateStyle}>
          {isOpen ? (
            <ChevronUp size={24} color={darkMode ? '#fff' : '#000'} />
          ) : (
            <ChevronDown size={24} color={darkMode ? '#fff' : '#000'} />
          )}
        </Animated.View>
      </AnimatedPressable>

      <Animated.View style={[styles.dropdown, darkMode && styles.dropdownDark, dropdownStyle]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {HADITH_COLLECTIONS.map((collection) => (
            <Pressable
              key={collection.id}
              style={[styles.collectionButton, darkMode && styles.collectionButtonDark]}
              onPress={() => handleCollectionPress(collection.url)}
            >
              <View style={styles.collectionInfo}>
                <Text style={[styles.collectionName, darkMode && styles.textLight]}>
                  {collection.name}
                </Text>
                <Text style={[styles.arabicName, darkMode && styles.textLightSecondary]}>
                  {collection.arabicName}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  headerDark: {
    backgroundColor: '#1e293b',
  },
  headerOpen: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedText: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  dropdown: {
    backgroundColor: '#fff',
  },
  dropdownDark: {
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  collectionButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    transform: [{ scale: 1 }],
  },
  collectionButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  collectionInfo: {
    gap: 4,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  arabicName: {
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'NotoNaskhArabic-Regular',
    textAlign: Platform.OS === 'web' ? 'right' : 'left',
  },
  textLight: {
    color: '#f8fafc',
  },
  textLightSecondary: {
    color: '#94a3b8',
  },
});