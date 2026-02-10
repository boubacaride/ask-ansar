import { View, Text, StyleSheet, Image, Platform, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Welcome() {
  const { width, height } = useWindowDimensions();
  // On mobile web, cap the image size so it doesn't overflow
  const imageSize = Math.min(width * 0.65, height * 0.35, 320);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background overlay */}
      <View style={[styles.gradient, { height: height * 0.7 }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Animated.View
            entering={Platform.OS !== 'web' ? FadeInDown.delay(200) : undefined}
            style={[
              styles.imageContainer,
              {
                width: imageSize,
                height: imageSize,
                borderRadius: imageSize / 2,
              },
            ]}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
          </Animated.View>

          <Animated.View
            entering={Platform.OS !== 'web' ? FadeInDown.delay(400) : undefined}
            style={styles.textContainer}
          >
            <Text style={styles.greeting}>
              السَّلامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكاتُهُ
            </Text>
            <Text style={styles.welcomeText}>
              Thank you for using the Ask Ansar app
            </Text>
            <Text style={styles.title}>Welcome to Ask Ansar</Text>
            <Text style={styles.subtitle}>
              Your trusted companion for Islamic knowledge and guidance
            </Text>
          </Animated.View>

          <Animated.View
            entering={Platform.OS !== 'web' ? FadeInDown.delay(600) : undefined}
            style={styles.buttonContainer}
          >
            <Link href="/register" asChild>
              <Pressable style={{...styles.button, ...styles.primaryButton}}>
                <Text style={{...styles.buttonText, ...styles.primaryButtonText}}>
                  Create Account
                </Text>
              </Pressable>
            </Link>

            <Link href="/login" asChild>
              <Pressable style={{...styles.button, ...styles.secondaryButton}}>
                <Text style={{...styles.buttonText, ...styles.secondaryButtonText}}>
                  Log In
                </Text>
              </Pressable>
            </Link>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 83, 193, 0.05)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Platform.OS === 'web' ? 16 : 24,
  },
  imageContainer: {
    overflow: 'hidden',
    marginTop: Platform.OS === 'web' ? 12 : 20,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 83, 193, 0.1)',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: Platform.OS === 'web' ? 16 : 30,
  },
  greeting: {
    fontSize: Platform.OS === 'web' ? 20 : 24,
    color: '#0053C1',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Arial',
      android: undefined,
      web: 'Arial, sans-serif',
    }),
  },
  welcomeText: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 26 : 32,
    fontWeight: 'bold',
    color: '#0053C1',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 14 : 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: Platform.OS === 'web' ? 16 : 24,
  },
  button: {
    width: '100%',
    height: Platform.OS === 'web' ? 48 : 56,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#0053C1',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0053C1',
    marginBottom: 0,
  },
  buttonText: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#0053C1',
  },
});
