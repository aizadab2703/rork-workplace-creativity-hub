import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/helpers';
import JarVisualization from '@/components/JarVisualization';

type AuthMode = 'sign_in' | 'sign_up';

export default function OnboardingScreen() {
  const { signIn, signUp, isSigningIn, isSigningUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const jarScale = useRef(new Animated.Value(0.7)).current;
  const jarY = useRef(new Animated.Value(20)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;

  const isLoading = isSigningIn || isSigningUp;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(jarScale, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(jarY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, jarScale, jarY, formFade, formSlide, taglineFade]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.');
      return;
    }

    triggerHaptic('medium');

    try {
      if (mode === 'sign_up') {
        await signUp({ email: email.trim(), password });
        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. Please verify your email, then sign in.',
          [{ text: 'OK', onPress: () => setMode('sign_in') }]
        );
      } else {
        await signIn({ email: email.trim(), password });
        console.log('[Onboarding] Signed in successfully');
        router.replace('/');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      console.error('[Onboarding] Auth error:', message);
      Alert.alert('Error', message);
    }
  };

  const toggleMode = () => {
    triggerHaptic('light');
    setMode(prev => (prev === 'sign_in' ? 'sign_up' : 'sign_in'));
  };

  return (
    <LinearGradient
      colors={[Colors.cream, Colors.sand, Colors.parchment]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.jarSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: jarScale }, { translateY: jarY }],
              },
            ]}
          >
            <JarVisualization fillPercent={35} size={160} />
          </Animated.View>

          <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
            <Text style={styles.appName}>GratitudeJar</Text>
          </Animated.View>

          <Animated.View style={[styles.taglineSection, { opacity: taglineFade }]}>
            <Text style={styles.subtitle}>
              Capture the good things.{'\n'}Open them when the time comes.
            </Text>
            <View style={styles.decorDivider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: formFade,
                transform: [{ translateY: formSlide }],
              },
            ]}
          >
            <Text style={styles.formTitle}>
              {mode === 'sign_in' ? 'Welcome back' : 'Create account'}
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Mail color={Colors.textMuted} size={18} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                testID="email-input"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <Lock color={Colors.textMuted} size={18} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                testID="password-input"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff color={Colors.textLight} size={18} />
                ) : (
                  <Eye color={Colors.textLight} size={18} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
              testID="submit-button"
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {mode === 'sign_in' ? 'Sign In' : 'Sign Up'}
                  </Text>
                  <ArrowRight color={Colors.white} size={18} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={toggleMode}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                {mode === 'sign_in'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={styles.switchTextBold}>
                  {mode === 'sign_in' ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  jarSection: {
    marginBottom: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  taglineSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  decorDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  dividerLine: {
    width: 28,
    height: 1,
    backgroundColor: Colors.honey,
    opacity: 0.3,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.honey,
    opacity: 0.4,
  },
  formSection: {
    width: '100%',
    gap: 14,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: Colors.terracotta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  switchTextBold: {
    fontWeight: '600' as const,
    color: Colors.terracotta,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
});
