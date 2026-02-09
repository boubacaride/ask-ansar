import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

interface SeerahCardProps {
  onPress: () => void;
  darkMode: boolean;
}

export function SeerahCard({ onPress, darkMode }: SeerahCardProps) {
  const colors = {
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    badge: darkMode ? 'rgba(201, 162, 39, 0.2)' : 'rgba(201, 162, 39, 0.15)',
    icon: darkMode ? 'rgba(0, 137, 123, 0.15)' : 'rgba(0, 137, 123, 0.1)',
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#00897b', '#00695c', '#004d40']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.decorativePattern}>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
          <View style={styles.patternCircle3} />
        </View>

        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: colors.badge }]}>
            <Text style={styles.badgeText}>السيرة النبوية</Text>
          </View>

          <Text style={styles.arabicTitle}>الرحيق المختوم</Text>
          <Text style={styles.frenchTitle}>Le Nectar Cacheté</Text>

          <Text style={styles.subtitle}>
            Biographie du Prophète Muhammad ﷺ
          </Text>

          <View style={styles.authorContainer}>
            <FontAwesome5 name="pen-fancy" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.authorText}>
              Cheikh Safi-ur-Rahman Al-Mubarakpuri
            </Text>
          </View>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.icon }]}>
                <FontAwesome5 name="headphones" size={16} color="#fff" />
              </View>
              <Text style={styles.featureText}>Audio</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.icon }]}>
                <FontAwesome5 name="book-reader" size={16} color="#fff" />
              </View>
              <Text style={styles.featureText}>Lecture</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.icon }]}>
                <FontAwesome5 name="bookmark" size={16} color="#fff" />
              </View>
              <Text style={styles.featureText}>Signets</Text>
            </View>
          </View>

          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Commencer la lecture</Text>
            <FontAwesome5 name="arrow-right" size={16} color="#00897b" />
          </View>
        </View>

        <View style={styles.cornerDecoration}>
          <FontAwesome5 name="mosque" size={40} color="rgba(255,255,255,0.1)" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    padding: 20,
    minHeight: 280,
    position: 'relative',
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    right: -30,
  },
  patternCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: -20,
    left: -20,
  },
  patternCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    top: '50%',
    right: '10%',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    color: '#c9a227',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  arabicTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textAlign: 'left',
  },
  frenchTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    lineHeight: 22,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  authorText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00897b',
  },
  cornerDecoration: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});
