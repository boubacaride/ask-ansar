import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Linking } from 'react-native';
import { ChevronDown, ChevronUp, Book, ExternalLink } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

const SURAHS = [
  { number: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة' },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة' },
  { number: 3, name: 'Al-Imran', arabicName: 'آل عمران' },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء' },
  { number: 5, name: 'Al-Ma\'idah', arabicName: 'المائدة' },
  { number: 6, name: 'Al-An\'am', arabicName: 'الأنعام' },
  { number: 7, name: 'Al-A\'raf', arabicName: 'الأعراف' },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال' },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة' },
  { number: 10, name: 'Yunus', arabicName: 'يونس' },
  { number: 11, name: 'Hud', arabicName: 'هود' },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف' },
  { number: 13, name: 'Ar-Ra\'d', arabicName: 'الرعد' },
  { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم' },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر' },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل' },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء' },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف' },
  { number: 19, name: 'Maryam', arabicName: 'مريم' },
  { number: 20, name: 'Ta-Ha', arabicName: 'طه' },
  { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء' },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج' },
  { number: 23, name: 'Al-Mu\'minun', arabicName: 'المؤمنون' },
  { number: 24, name: 'An-Nur', arabicName: 'النور' },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان' },
  { number: 26, name: 'Ash-Shu\'ara', arabicName: 'الشعراء' },
  { number: 27, name: 'An-Naml', arabicName: 'النمل' },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص' },
  { number: 29, name: 'Al-Ankabut', arabicName: 'العنكبوت' },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم' },
  { number: 31, name: 'Luqman', arabicName: 'لقمان' },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة' },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب' },
  { number: 34, name: 'Saba', arabicName: 'سبأ' },
  { number: 35, name: 'Fatir', arabicName: 'فاطر' },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس' },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات' },
  { number: 38, name: 'Sad', arabicName: 'ص' },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر' },
  { number: 40, name: 'Ghafir', arabicName: 'غافر' },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت' },
  { number: 42, name: 'Ash-Shura', arabicName: 'الشورى' },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف' },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان' },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية' },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف' },
  { number: 47, name: 'Muhammad', arabicName: 'محمد' },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح' },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات' },
  { number: 50, name: 'Qaf', arabicName: 'ق' },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات' },
  { number: 52, name: 'At-Tur', arabicName: 'الطور' },
  { number: 53, name: 'An-Najm', arabicName: 'النجم' },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر' },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن' },
  { number: 56, name: 'Al-Waqi\'ah', arabicName: 'الواقعة' },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد' },
  { number: 58, name: 'Al-Mujadilah', arabicName: 'المجادلة' },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر' },
  { number: 60, name: 'Al-Mumtahanah', arabicName: 'الممتحنة' },
  { number: 61, name: 'As-Saff', arabicName: 'الصف' },
  { number: 62, name: 'Al-Jumu\'ah', arabicName: 'الجمعة' },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون' },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن' },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق' },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم' },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك' },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم' },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة' },
  { number: 70, name: 'Al-Ma\'arij', arabicName: 'المعارج' },
  { number: 71, name: 'Nuh', arabicName: 'نوح' },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن' },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل' },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر' },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة' },
  { number: 76, name: 'Al-Insan', arabicName: 'الإنسان' },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات' },
  { number: 78, name: 'An-Naba', arabicName: 'النبأ' },
  { number: 79, name: 'An-Nazi\'at', arabicName: 'النازعات' },
  { number: 80, name: 'Abasa', arabicName: 'عبس' },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير' },
  { number: 82, name: 'Al-Infitar', arabicName: 'الإنفطار' },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين' },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الإنشقاق' },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج' },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق' },
  { number: 87, name: 'Al-A\'la', arabicName: 'الأعلى' },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية' },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر' },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد' },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس' },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل' },
  { number: 93, name: 'Ad-Duha', arabicName: 'الضحى' },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح' },
  { number: 95, name: 'At-Tin', arabicName: 'التين' },
  { number: 96, name: 'Al-Alaq', arabicName: 'العلق' },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر' },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة' },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة' },
  { number: 100, name: 'Al-Adiyat', arabicName: 'العاديات' },
  { number: 101, name: 'Al-Qari\'ah', arabicName: 'القارعة' },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر' },
  { number: 103, name: 'Al-Asr', arabicName: 'العصر' },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة' },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل' },
  { number: 106, name: 'Quraish', arabicName: 'قريش' },
  { number: 107, name: 'Al-Ma\'un', arabicName: 'الماعون' },
  { number: 108, name: 'Al-Kauthar', arabicName: 'الكوثر' },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون' },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر' },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد' },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص' },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق' },
  { number: 114, name: 'An-Nas', arabicName: 'الناس' }
];

interface QuranDropdownProps {
  onSelect: (surahNumber: number) => void;
  darkMode?: boolean;
}

interface Surah {
  number: number;
  name: string;
  arabicName: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function QuranDropdown({ onSelect, darkMode }: QuranDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(
    SURAHS && SURAHS.length > 0 ? SURAHS[0] : null
  );
  const animation = useSharedValue(0);

  const handlePress = useCallback(() => {
    setIsOpen(!isOpen);
    animation.value = withSpring(isOpen ? 0 : 1, {
      damping: 15,
      stiffness: 100,
    });
  }, [isOpen]);

  const handleSurahSelect = useCallback((surah: typeof SURAHS[0]) => {
    setSelectedSurah(surah);
    onSelect(surah.number);
    setIsOpen(false);
    animation.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, [onSelect]);

  const handleTafsirPress = useCallback((surahNumber: number) => {
    const tafsirUrl = `https://quran.com/${surahNumber}:1/tafsirs/en-tafisr-ibn-kathir`;
    Linking.openURL(tafsirUrl).catch(err => {
      console.error('Error opening Tafsir link:', err);
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

  if (!SURAHS || SURAHS.length === 0) {
    return (
      <View style={[styles.container, darkMode && styles.containerDark]}>
        <View style={[styles.header, darkMode && styles.headerDark]}>
          <Text style={[styles.surahName, darkMode && styles.textLight]}>
            No surahs available
          </Text>
        </View>
      </View>
    );
  }

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
            <Text style={[styles.surahName, darkMode && styles.textLight]}>
              Qur'an & Tafsir
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
          {SURAHS.map((surah) => (
            <View key={surah.number} style={styles.surahContainer}>
              <View style={[styles.buttonGroup, darkMode && styles.buttonGroupDark]}>
                <Pressable
                  style={[
                    styles.surahButton,
                    darkMode && styles.surahButtonDark,
                    selectedSurah?.number === surah.number && styles.selectedSurah,
                    selectedSurah?.number === surah.number && darkMode && styles.selectedSurahDark,
                  ]}
                  onPress={() => handleSurahSelect(surah)}
                >
                  <Text style={[styles.surahNumber, darkMode && styles.textLight]}>
                    {surah.number}.
                  </Text>
                  <View style={styles.surahInfo}>
                    <Text style={[styles.surahName, darkMode && styles.textLight]}>
                      {surah.name}
                    </Text>
                    <Text style={[styles.arabicName, darkMode && styles.textLightSecondary]}>
                      {surah.arabicName}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  style={[
                    styles.tafsirButton,
                    darkMode && styles.tafsirButtonDark,
                  ]}
                  onPress={() => handleTafsirPress(surah.number)}
                >
                  <Text style={[styles.tafsirText, darkMode && styles.tafsirTextDark]}>
                    Tafsirs
                  </Text>
                  <ExternalLink size={14} color={darkMode ? '#90CAF9' : '#1976D2'} />
                </Pressable>
              </View>
            </View>
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
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerDark: {
    backgroundColor: '#2d2d2d',
  },
  headerOpen: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedText: {
    gap: 2,
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
  surahContainer: {
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  buttonGroupDark: {
    backgroundColor: '#2d2d2d',
  },
  surahButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 6,
  },
  surahButtonDark: {
    backgroundColor: '#1a1a1a',
  },
  selectedSurah: {
    backgroundColor: '#e3f2fd',
  },
  selectedSurahDark: {
    backgroundColor: '#1e3a5f',
  },
  surahNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  surahInfo: {
    gap: 2,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  arabicName: {
    fontSize: 14,
    color: '#666',
  },
  textLight: {
    color: '#fff',
  },
  textLightSecondary: {
    color: '#90CAF9',
  },
  tafsirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
  },
  tafsirButtonDark: {
    backgroundColor: '#1e3a5f',
  },
  tafsirText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976D2',
  },
  tafsirTextDark: {
    color: '#90CAF9',
  },
});