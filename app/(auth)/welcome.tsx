import { View, Text, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['rgba(25, 118, 210, 0.1)', 'rgba(25, 118, 210, 0.05)', '#fff']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80' }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400)}
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
          entering={FadeInDown.delay(600)}
          style={styles.buttonContainer}
        >
          <Link href="/register" asChild>
            <Animated.View style={[styles.button, styles.primaryButton]}>
              <LinearGradient
                colors={['#1976D2', '#1565C0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  Create Account
                </Text>
              </LinearGradient>
            </Animated.View>
          </Link>

          <Link href="/login" asChild>
            <Animated.View style={[styles.button, styles.secondaryButton]}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Log In
              </Text>
            </Animated.View>
          </Link>
        </Animated.View>
      </View>
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
    height: height * 0.7,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  imageContainer: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: width * 0.85 / 2,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  greeting: {
    fontSize: 24,
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'normal',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1976D2',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#1976D2',
  },
});