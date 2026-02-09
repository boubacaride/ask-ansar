import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleSignIn = async () => {
    setError(null);
    
    // Basic validation
    if (!form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      await signIn({
        email: form.email,
        password: form.password,
      });
      router.replace('/(tabs)');
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
          entering={FadeInDown.delay(200)}
          style={styles.header}
        >
          <Pressable onPress={() => router.back()}>
            <ArrowLeft
              size={24}
              color="#0053C1"
            />
          </Pressable>
          <Text style={styles.title}>Welcome Back</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400)}
          style={styles.form}
        >
          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry
            />
          </View>

          <Link href="/forgot-password" style={styles.forgotPassword}>
            Forgot Password?
          </Link>

          <Animated.View
            entering={FadeInDown.delay(600)}
            style={styles.buttonContainer}
          >
            <Pressable
              style={{...styles.button, ...(loading && styles.buttonDisabled)}}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/register" style={styles.footerLink}>
                Sign Up
              </Link>
            </View>
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
  forgotPassword: {
    color: '#0053C1',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 24,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    marginRight: 4,
  },
  footerLink: {
    color: '#0053C1',
    fontWeight: '600',
  },
});