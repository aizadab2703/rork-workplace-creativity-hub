import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react-native';
import { useGratitude } from '@/providers/GratitudeProvider';
import Colors from '@/constants/colors';
import { triggerHaptic } from '@/utils/helpers';
import JarVisualization from '@/components/JarVisualization';
import AmbientParticles from '@/components/AmbientParticles';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { signIn, signUp } = useGratitude();
  const [mode, setMode] = useState<'welcome' | 'signin' | 'signup'>('welcome');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const jarScale = useRef(new Animated.Value(0.6)).current;
  const jarY = useRef(new Animated.Value(30)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(40)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;
  const decorFade = useRef(new Animated.Value(0)).current;
  const formFade = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(jarScale, {
          toValue: 1,
          tension: 35,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(jarY, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(decorFade, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(buttonFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonSlide, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [fadeAnim, jarScale, jarY, buttonFade, buttonSlide, taglineFade, taglineSlide, decorFade]);

  const showForm = (formMode: 'signin' | 'signup') => {
    setMode(formMode);
    setError('');
    setEmail('');
    setPassword('');
    formFade.setValue(0);
    formSlide.setValue(30);
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
    ]).start();
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    triggerHaptic('medium');

    try {
      if (mode === 'signup') {
        console.log('[Onboarding] Signing up with email:', email);
        const result = await signUp(email.trim(), password);
        if (result.error) {
          setError(result.error);
          return;
        }
        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. Please verify your email then sign in.',
          [{ text: 'OK', onPress: () => showForm('signin') }]
        );
      } else {
        console.log('[Onboarding] Signing in with email:', email);
        const result = await signIn(email.trim(), password);
        if (result.error) {
          setError(result.error);
          return;
        }
        router.replace('/');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Something went wrong';
      console.log('[Onboarding] Auth error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.cream, Colors.sand, Colors.parchment, Colors.gradientSunrise]}
      locations={[0, 0.3, 0.6, 1]}
      style={styles.container}
    >
      <AmbientParticles />

      <Animated.View style={[styles.decorCircle1, { opacity: decorFade }]} />
      <Animated.View style={[styles.decorCircle2, { opacity: decorFade }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.jarSection,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: mode === 'welcome' ? jarScale : 0.7 as unknown as Animated.Value },
                  { translateY: jarY },
                ],
              },
            ]}
          >
            <JarVisualization fillPercent={35} size={mode === 'welcome' ? 220 : 140} />
          </Animated.View>

          <Animated.View
            style={[
              styles.titleSection,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.appName}>GratitudeJar</Text>
          </Animated.View>

          {mode === 'welcome' && (
            <>
              <Animated.View
                style={[
                  styles.taglineSection,
                  {
                    opacity: taglineFade,
                    transform: [{ translateY: taglineSlide }],
                  },
                ]}
              >
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
                  styles.buttonSection,
                  {
                    opacity: buttonFade,
                    transform: [{ translateY: buttonSlide }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => showForm('signup')}
                  activeOpacity={0.8}
                  testID="get-started-button"
                >
                  <LinearGradient
                    colors={[Colors.terracotta, Colors.terracottaDark]}
                    style={styles.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <UserPlus color="#FFFFFF" size={20} />
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => showForm('signin')}
                  activeOpacity={0.8}
                  testID="sign-in-button"
                >
                  <LogIn color={Colors.textPrimary} size={20} />
                  <Text style={styles.secondaryButtonText}>I have an account</Text>
                </TouchableOpacity>

                <Text style={styles.termsText}>
                  By continuing, you agree to our Terms & Privacy Policy
                </Text>
              </Animated.View>
            </>
          )}

          {(mode === 'signin' || mode === 'signup') && (
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
                {mode === 'signup' ? 'Create account' : 'Welcome back'}
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Mail color={Colors.textMuted} size={18} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={Colors.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="email-input"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Lock color={Colors.textMuted} size={18} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.textLight}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    testID="password-input"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleAuth}
                disabled={isLoading}
                activeOpacity={0.8}
                testID="submit-auth-button"
              >
                <LinearGradient
                  colors={[Colors.terracotta, Colors.terracottaDark]}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitText}>
                        {mode === 'signup' ? 'Create account' : 'Sign in'}
                      </Text>
                      <ArrowRight color="#FFFFFF" size={18} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchMode}
                onPress={() => showForm(mode === 'signin' ? 'signup' : 'signin')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchModeText}>
                  {mode === 'signin'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setMode('welcome')}
                activeOpacity={0.7}
              >
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
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
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(212, 162, 78, 0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(194, 120, 92, 0.06)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  jarSection: {
    marginBottom: 16,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  taglineSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 25,
    letterSpacing: 0.2,
  },
  decorDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: Colors.terracottaLight,
    opacity: 0.4,
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.terracottaLight,
    opacity: 0.5,
  },
  buttonSection: {
    width: '100%',
    gap: 14,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.terracottaDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(92, 61, 46, 0.08)',
    shadowColor: Colors.walnut,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  formSection: {
    width: '100%',
    marginTop: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(196, 75, 75, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(196, 75, 75, 0.15)',
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.terracottaDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600' as const,
  },
  switchMode: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    color: Colors.terracotta,
    fontWeight: '500' as const,
  },
  backButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
