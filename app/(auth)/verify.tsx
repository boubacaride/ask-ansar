import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function Verify() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, sendOtp } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // 60-second cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await verifyOtp({ email: email!, token: code });
      // onAuthStateChange fires -> auth guard redirects to /(tabs) automatically
    } catch (err) {
      setError('Invalid or expired code. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setResending(true);
      setError(null);
      await sendOtp({ email: email! });
      setResent(true);
      setCooldown(60);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to resend code: ${msg}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        entering={Platform.OS !== 'web' ? FadeInDown.delay(200) : undefined}
        style={styles.header}
      >
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#0053C1" />
        </Pressable>
        <Text style={styles.title}>Verify Email</Text>
      </Animated.View>

      <Animated.View
        entering={Platform.OS !== 'web' ? FadeInDown.delay(400) : undefined}
        style={styles.content}
      >
        <View style={styles.iconContainer}>
          <Mail size={48} color="#0053C1" />
        </View>

        <Text style={styles.description}>
          We sent a 6-digit verification code to
        </Text>
        <Text style={styles.email}>{email}</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        {resent && (
          <Text style={styles.success}>New code sent!</Text>
        )}

        <TextInput
          style={styles.codeInput}
          placeholder="000000"
          placeholderTextColor="#ccc"
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          autoFocus
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || code.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </Pressable>

        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>Didn't receive the code?</Text>
          {cooldown > 0 ? (
            <Text style={styles.cooldownText}>
              Resend in {cooldown}s
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color="#0053C1" />
              ) : (
                <Text style={styles.resendLink}>Resend Code</Text>
              )}
            </Pressable>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 83, 193, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0053C1',
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    textAlign: 'center',
  },
  success: {
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    textAlign: 'center',
  },
  codeInput: {
    width: '100%',
    maxWidth: 280,
    height: 64,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
    color: '#0053C1',
  },
  button: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    backgroundColor: '#0053C1',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    gap: 8,
  },
  resendLabel: {
    color: '#666',
    fontSize: 14,
  },
  resendLink: {
    color: '#0053C1',
    fontWeight: '600',
    fontSize: 14,
  },
  cooldownText: {
    color: '#999',
    fontSize: 14,
  },
});
