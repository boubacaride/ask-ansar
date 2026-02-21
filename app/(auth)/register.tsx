import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
  });

  const handleGetStarted = async () => {
    setError(null);

    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Please enter your name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await sendOtp({ email: form.email.trim(), fullName: form.fullName.trim() });
      router.push({
        pathname: '/(auth)/verify',
        params: { email: form.email.trim() },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={Platform.OS !== 'web' ? FadeInDown.delay(200) : undefined}
          style={styles.header}
        >
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#0053C1" />
          </Pressable>
          <Text style={styles.title}>Get Started</Text>
        </Animated.View>

        <Animated.View
          entering={Platform.OS !== 'web' ? FadeInDown.delay(400) : undefined}
          style={styles.form}
        >
          <Text style={styles.subtitle}>
            Enter your name and email to get started. We'll send you a verification code.
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={form.fullName}
              onChangeText={(text) => setForm({ ...form, fullName: text })}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <Animated.View
            entering={Platform.OS !== 'web' ? FadeInDown.delay(600) : undefined}
            style={styles.buttonContainer}
          >
            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleGetStarted}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Verification Code</Text>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0053C1',
    marginLeft: 16,
  },
  form: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#f5f5f5',
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    height: 56,
    backgroundColor: '#0053C1',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
