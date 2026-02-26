import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Platform,
  Pressable,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

export default function Welcome() {
  const { width, height } = useWindowDimensions();
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageSize = Math.min(width * 0.65, height * 0.35, 320);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (err) {
      if (err instanceof Error && !err.message.includes('cancel')) {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              source={{
                uri: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80',
              }}
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
            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>
                Get Started
              </Text>
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#444" />
              ) : (
                <>
                  <Image
                    source={{
                      uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
                    }}
                    style={styles.googleIcon}
                  />
                  <Text style={[styles.buttonText, styles.googleButtonText]}>
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>
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
  error: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: Platform.OS === 'web' ? 48 : 56,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#0053C1',
    marginBottom: 0,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  googleButtonText: {
    color: '#444',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    color: '#999',
    paddingHorizontal: 16,
    fontSize: 14,
  },
});
