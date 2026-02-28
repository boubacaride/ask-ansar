import { View, Text, StyleSheet, ScrollView, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';
import { BookOpen, Heart, Users, Sparkles, MessageCircle, Book, Lightbulb, Ban, HelpCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  darkColor: string;
}

const topics: Topic[] = [
  {
    id: 'croyance',
    title: 'Questions sur la croyance',
    description: 'Foi, Tawhid, et piliers de l\'Iman',
    icon: Heart,
    color: '#ef4444',
    darkColor: '#f87171',
  },
  {
    id: 'pratiques',
    title: 'Questions sur les pratiques religieuses',
    description: 'Prière, jeûne, Zakat, et Hajj',
    icon: BookOpen,
    color: '#3b82f6',
    darkColor: '#60a5fa',
  },
  {
    id: 'famille',
    title: 'Questions sur la famille et la vie sociale',
    description: 'Relations familiales et sociales',
    icon: Users,
    color: '#8b5cf6',
    darkColor: '#a78bfa',
  },
  {
    id: 'au-dela',
    title: 'Questions sur l\'au-delà',
    description: 'Mort, Jugement, Paradis et Enfer',
    icon: Sparkles,
    color: '#f59e0b',
    darkColor: '#fbbf24',
  },
  {
    id: 'prophetes',
    title: 'Questions sur les prophètes et les compagnons',
    description: 'Prophète Muhammad (ﷺ) et Sahaba',
    icon: MessageCircle,
    color: '#10b981',
    darkColor: '#34d399',
  },
  {
    id: 'coran',
    title: 'Questions sur le Coran',
    description: 'Révélation, Tafsir, et mémorisation',
    icon: Book,
    color: '#06b6d4',
    darkColor: '#22d3ee',
  },
  {
    id: 'ethique',
    title: 'Questions sur l\'éthique et le comportement',
    description: 'Akhlaq, patience, et sincérité',
    icon: Lightbulb,
    color: '#ec4899',
    darkColor: '#f472b6',
  },
  {
    id: 'interdictions',
    title: 'Questions sur les interdictions',
    description: 'Haram, péchés, et limites',
    icon: Ban,
    color: '#dc2626',
    darkColor: '#ef4444',
  },
  {
    id: 'undefined',
    title: 'Questions non définies & divergences',
    description: 'Sujets de divergence et Ijtihad',
    icon: HelpCircle,
    color: '#0f766e',
    darkColor: '#14b8a6',
  },
];

export default function TopicsScreen() {
  const router = useRouter();
  const { darkMode } = useSettings();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;

  const handleTopicPress = (topicId: string) => {
    router.push(`/topics/${topicId}`);
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>
            Explorez divers aspects de la connaissance islamique
          </Text>
        </View>

        <View style={styles.topicsGrid}>
          {topics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <AnimatedPressable
                key={topic.id}
                entering={FadeInDown.delay(index * 50)}
                style={({ pressed }) => [
                  styles.topicCard,
                  darkMode && styles.topicCardDark,
                  pressed && styles.topicCardPressed,
                ]}
                onPress={() => handleTopicPress(topic.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: darkMode ? topic.darkColor + '20' : topic.color + '20' }
                  ]}
                >
                  <Icon
                    size={28}
                    color={darkMode ? topic.darkColor : topic.color}
                    strokeWidth={2}
                  />
                </View>
                <Text style={[styles.topicTitle, darkMode && styles.topicTitleDark]}>
                  {topic.title}
                </Text>
                <Text style={[styles.topicDescription, darkMode && styles.topicDescriptionDark]}>
                  {topic.description}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  topicsGrid: {
    gap: 12,
    paddingHorizontal: 16,
  },
  topicCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  topicCardDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0.25,
  },
  topicCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 24,
  },
  topicTitleDark: {
    color: '#f8fafc',
  },
  topicDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  topicDescriptionDark: {
    color: '#94a3b8',
  },
});