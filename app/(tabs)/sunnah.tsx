import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  TextInput,
  Modal,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { SeerahCard } from '@/components/SeerahCard';
import DuaHandsIcon from '@/components/DuaHandsIcon';
import SujoodIcon from '@/components/SujoodIcon';
import { SeerahMapCard } from '@/components/SeerahMapCard';
import { SeerahReader } from '@/components/SeerahReader';
import { HadithSearch } from '@/components/HadithSearch';


const HADITH_Catégories = [
  { id: 'faith', name: 'Foi (Iman)', icon: 'heart', color: '#e91e63' },
  { id: 'prayer', name: 'Prière (Salah)', icon: 'pray', color: '#9c27b0' },
  { id: 'fasting', name: 'Jeûne (Sawm)', icon: 'moon', color: '#673ab7' },
  { id: 'zakat', name: 'Aumône (Zakat)', icon: 'hand-holding-heart', color: '#3f51b5' },
  { id: 'hajj', name: 'Pèlerinage (Hajj)', icon: 'kaaba', color: '#c9a227' },
  { id: 'manners', name: 'Bonnes manières (Adab)', icon: 'user-friends', color: '#00897b' },
  { id: 'family', name: 'Relations familiales', icon: 'home', color: '#ff5722' },
  { id: 'business', name: 'Éthique des affaires', icon: 'balance-scale', color: '#607d8b' },
  { id: 'duas', name: "Dou'as et Dhikr", icon: 'praying-hands', color: '#00796b' },
];

export default function SunnahScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'collections' | 'Catégories'>('collections');
  const [seerahReaderVisible, setSeerahReaderVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // Animated values for Hadith & Prophets buttons
  const hadithBorderAnim = useRef(new Animated.Value(0)).current;
  const hadithGlow = useRef(new Animated.Value(0.3)).current;
  const hadithScale = useRef(new Animated.Value(1)).current;
  const prophetsScale = useRef(new Animated.Value(1)).current;
  const hadithStar1 = useRef(new Animated.Value(0.2)).current;
  const hadithStar2 = useRef(new Animated.Value(0.7)).current;
  const hadithStar3 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Rotating gradient border
    const borderLoop = Animated.loop(
      Animated.timing(hadithBorderAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    borderLoop.start();

    // Pulsing glow
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(hadithGlow, { toValue: 0.8, duration: 2000, useNativeDriver: true }),
        Animated.timing(hadithGlow, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    );
    glowLoop.start();

    // Staggered star twinkles
    const star1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hadithStar1, { toValue: 0.9, duration: 1200, useNativeDriver: true }),
        Animated.timing(hadithStar1, { toValue: 0.1, duration: 1200, useNativeDriver: true }),
      ])
    );
    star1Loop.start();

    const star2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hadithStar2, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(hadithStar2, { toValue: 0.15, duration: 1800, useNativeDriver: true }),
      ])
    );
    star2Loop.start();

    const star3Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hadithStar3, { toValue: 0.85, duration: 2200, useNativeDriver: true }),
        Animated.timing(hadithStar3, { toValue: 0.1, duration: 2200, useNativeDriver: true }),
      ])
    );
    star3Loop.start();

    return () => {
      borderLoop.stop();
      glowLoop.stop();
      star1Loop.stop();
      star2Loop.stop();
      star3Loop.stop();
    };
  }, []);

  const hadithBorderRotation = hadithBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#00897b',
    accent: '#c9a227',
    inputBg: darkMode ? '#252538' : '#f5f5f5',
    inputBorder: darkMode ? '#3d3d5c' : '#ced4da',
  };

  const handleOpenInBrowser = (url: string) => {
    Linking.openURL(url);
  };

  const handleCategoryPress = (category: { id: string; name: string; icon: string; color: string }) => {
    if (category.id === 'duas') {
      router.push('/(tabs)/sunnah/duas');
      return;
    }
    router.push({
      pathname: '/(tabs)/sunnah/[categoryId]',
      params: {
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon,
        categoryColor: category.color,
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e', '#0d2137'] : ['#f8f9fa', '#e8f5e9', '#c8e6c9']}
        style={styles.gradient}
      >
        <View style={[styles.header, { borderBottomColor: colors.cardBorder, paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 10 }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(0, 137, 123, 0.1)', width: isSmallScreen ? 42 : 50, height: isSmallScreen ? 42 : 50, borderRadius: isSmallScreen ? 21 : 25 }]}>
              <FontAwesome5 name="book-open" size={isSmallScreen ? 20 : 24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text, fontSize: isSmallScreen ? 20 : 24 }]}>La Sounna</Text>
              <Text style={[styles.headerArabic, { color: colors.accent, fontSize: isSmallScreen ? 16 : 18 }]}>السنة النبوية</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
            onPress={() => setSearchModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Rechercher des hadiths...
            </Text>
            <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'collections' && { backgroundColor: colors.primary },
                { borderColor: colors.primary },
              ]}
              onPress={() => setActiveTab('collections')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'collections' ? '#fff' : colors.primary }]}>
                Collections
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Catégories' && { backgroundColor: colors.primary },
                { borderColor: colors.primary },
              ]}
              onPress={() => setActiveTab('Catégories')}
            >
              <Text style={[styles.tabText, { color: activeTab === 'Catégories' ? '#fff' : colors.primary }]}>
                Catégories
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {activeTab === 'collections' ? (
            <>
              <SeerahCard
                onPress={() => setSeerahReaderVisible(true)}
                darkMode={darkMode}
              />

              <SeerahMapCard
                onPress={() => router.push('/(tabs)/seerah-map')}
                darkMode={darkMode}
              />

              {/* ═══ L'histoire des prophètes — Animated Button ═══ */}
              <View style={styles.hadithBtnContainer}>
                <Animated.View style={[styles.hadithGlowLayer, { opacity: hadithGlow }]} />
                <Animated.View style={{ transform: [{ scale: prophetsScale }] }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push('/(tabs)/sunnah/prophets-video')}
                    onPressIn={() =>
                      Animated.spring(prophetsScale, {
                        toValue: 0.96,
                        useNativeDriver: true,
                        tension: 120,
                        friction: 8,
                      }).start()
                    }
                    onPressOut={() =>
                      Animated.spring(prophetsScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 120,
                        friction: 8,
                      }).start()
                    }
                  >
                    <View style={styles.hadithBtnOuter}>
                      <Animated.View
                        style={[
                          styles.hadithRotatingBg,
                          { transform: [{ rotate: hadithBorderRotation }] },
                        ]}
                      >
                        <LinearGradient
                          colors={['#00897b', '#4db6ac', '#c9a227', '#daa520', '#4db6ac', '#00897b']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </Animated.View>
                      <View style={[styles.hadithBtnInner, { backgroundColor: darkMode ? '#101824' : '#0b2b2b' }]}>
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar1, top: 8, left: 20 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar2, top: 28, right: 24 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar3, bottom: 10, left: 60 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar1, top: 16, right: 70 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar2, bottom: 16, right: 44 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar3, top: 24, left: 100 }]} />
                        <FontAwesome5
                          name="film"
                          size={15}
                          color="#c9a227"
                          style={styles.hadithBtnIcon}
                        />
                        <Text style={styles.hadithBtnText}>
                          L'histoire des prophètes
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="rgba(201, 162, 39, 0.6)" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* ═══ Hadiths du Messager d'Allah (ﷺ) — Animated Button ═══ */}
              <View style={styles.hadithBtnContainer}>
                {/* Pulsing glow behind the button */}
                <Animated.View style={[styles.hadithGlowLayer, { opacity: hadithGlow }]} />

                <Animated.View style={{ transform: [{ scale: hadithScale }] }}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push('/(tabs)/sunnah/hadith-collections')}
                    onPressIn={() =>
                      Animated.spring(hadithScale, {
                        toValue: 0.96,
                        useNativeDriver: true,
                        tension: 120,
                        friction: 8,
                      }).start()
                    }
                    onPressOut={() =>
                      Animated.spring(hadithScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 120,
                        friction: 8,
                      }).start()
                    }
                  >
                    <View style={styles.hadithBtnOuter}>
                      {/* Rotating gradient — teal/gold animated border */}
                      <Animated.View
                        style={[
                          styles.hadithRotatingBg,
                          { transform: [{ rotate: hadithBorderRotation }] },
                        ]}
                      >
                        <LinearGradient
                          colors={['#00897b', '#4db6ac', '#c9a227', '#daa520', '#4db6ac', '#00897b']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </Animated.View>

                      {/* Rich dark inner content */}
                      <View style={[styles.hadithBtnInner, { backgroundColor: darkMode ? '#101824' : '#0b2b2b' }]}>
                        {/* Subtle gold star particles */}
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar1, top: 8, left: 20 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar2, top: 28, right: 24 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar3, bottom: 10, left: 60 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar1, top: 16, right: 70 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar2, bottom: 16, right: 44 }]} />
                        <Animated.View style={[styles.hadithStar, { opacity: hadithStar3, top: 24, left: 100 }]} />

                        <FontAwesome5
                          name="book-open"
                          size={15}
                          color="#c9a227"
                          style={styles.hadithBtnIcon}
                        />
                        <Text style={styles.hadithBtnText}>
                          Hadiths du Messager d'Allah (ﷺ)
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="rgba(201, 162, 39, 0.6)" />
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              </View>

            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse by Topic</Text>
              <View style={styles.CatégoriesGrid}>
                {HADITH_Catégories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => handleCategoryPress(category)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                      {category.id === 'duas' ? (
                        <DuaHandsIcon size={28} color={category.color} />
                      ) : category.id === 'prayer' ? (
                        <SujoodIcon size={28} color={category.color} />
                      ) : (
                        <FontAwesome5 name={category.icon as any} size={24} color={category.color} />
                      )}
                    </View>
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.browseAllButton, { backgroundColor: colors.primary }]}
                onPress={() => Linking.openURL('https://sunnah.com')}
              >
                <Text style={styles.browseAllText}>Browse All Hadith</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </LinearGradient>

      <SeerahReader
        visible={seerahReaderVisible}
        onClose={() => setSeerahReaderVisible(false)}
        darkMode={darkMode}
      />

      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onRequestClose={() => setSearchModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={[styles.searchModalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.searchModalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity
              onPress={() => setSearchModalVisible(false)}
              style={styles.closeSearchButton}
            >
              <Ionicons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.searchModalTitle, { color: colors.text }]}>Recherche de Hadiths</Text>
            <View style={styles.placeholder} />
          </View>

          <HadithSearch darkMode={darkMode} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    // paddingTop is set dynamically via useSafeAreaInsets
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerArabic: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  // ═══ Hadiths du Messager animated button styles ═══
  hadithBtnContainer: {
    alignItems: 'center',
    marginVertical: 22,
    position: 'relative',
  },
  hadithGlowLayer: {
    position: 'absolute',
    top: 2,
    left: 35,
    right: 35,
    bottom: 2,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 137, 123, 0.25)',
    shadowColor: '#00897b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  hadithBtnOuter: {
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  hadithRotatingBg: {
    position: 'absolute',
    width: 700,
    height: 700,
    top: -322,
    left: -170,
  },
  hadithBtnInner: {
    margin: 2.5,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  hadithStar: {
    position: 'absolute',
    width: 1.5,
    height: 1.5,
    backgroundColor: 'rgba(201, 162, 39, 0.7)',
    borderRadius: 1,
  },
  hadithBtnIcon: {
    textShadowColor: 'rgba(201, 162, 39, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  hadithBtnText: {
    color: '#e8d5a3',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(201, 162, 39, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  collectionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  primaryCard: {
    borderWidth: 2,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  collectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionTitleContainer: {
    flex: 1,
  },
  collectionName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  collectionArabic: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  collectionCompiler: {
    fontSize: 13,
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  collectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hadithCount: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hadithCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  CatégoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    minWidth: 140,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
  },
  browseAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchModalContainer: {
    flex: 1,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeSearchButton: {
    padding: 8,
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
});
