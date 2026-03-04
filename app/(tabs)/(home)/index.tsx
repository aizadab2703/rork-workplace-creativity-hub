import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Plus, Lock, Pencil, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { getCountdownText, isJarUnlockable, triggerHaptic } from '@/utils/helpers';
import JarVisualization from '@/components/JarVisualization';
import AmbientParticles from '@/components/AmbientParticles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { getActiveJar, getNotesForJar, user, isReady } = useGratitude();

  useEffect(() => {
    if (isReady && !user) {
      console.log('[Home] No user found, redirecting to onboarding');
      router.replace('/onboarding');
    }
  }, [isReady, user]);

  const activeJar = getActiveJar();
  const jarNotes = activeJar ? getNotesForJar(activeJar.id) : [];
  const isUnlockable = activeJar ? isJarUnlockable(activeJar.unlockDate) : false;

  const [countdown, setCountdown] = useState<string>('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.97)).current;
  const [showLockedMessage, setShowLockedMessage] = useState<boolean>(false);
  const lockedFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const greetFade = useRef(new Animated.Value(0)).current;
  const greetSlide = useRef(new Animated.Value(20)).current;
  const jarEntrance = useRef(new Animated.Value(0.85)).current;
  const jarFadeIn = useRef(new Animated.Value(0)).current;
  const fabEntrance = useRef(new Animated.Value(0)).current;
  const readyPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(greetFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(greetSlide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(jarEntrance, {
            toValue: 1,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(jarFadeIn, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(500),
        Animated.spring(fabEntrance, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [greetFade, greetSlide, jarEntrance, jarFadeIn, fabEntrance]);

  useEffect(() => {
    if (!activeJar) return;
    const update = () => {
      setCountdown(getCountdownText(activeJar.unlockDate, activeJar.durationMinutes));
    };
    update();
    const updateInterval = activeJar.durationMinutes <= 60 ? 1000 : 10000;
    const interval = setInterval(update, updateInterval);
    return () => clearInterval(interval);
  }, [activeJar]);

  useEffect(() => {
    if (activeJar) {
      const progress = getProgressPercent(activeJar.startDate, activeJar.unlockDate);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  }, [activeJar, countdown]);

  useEffect(() => {
    if (isUnlockable) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.97,
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(readyPulse, {
            toValue: 1.03,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(readyPulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isUnlockable, pulseAnim, readyPulse]);

  const handleJarTap = useCallback(() => {
    if (!activeJar) return;

    if (isUnlockable) {
      triggerHaptic('success');
      router.push(`/unlock-reveal?jarId=${activeJar.id}`);
      return;
    }

    triggerHaptic('warning');
    setShowLockedMessage(true);

    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(lockedFade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(lockedFade, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setShowLockedMessage(false));
  }, [activeJar, isUnlockable, shakeAnim, lockedFade]);

  const handleAddNote = useCallback(() => {
    triggerHaptic('light');
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start();
    router.push('/write-note');
  }, [fabScale]);

  const fillPercent = activeJar
    ? Math.min((jarNotes.length / Math.max(Math.ceil(activeJar.durationMinutes / 720) * 2, 5)) * 100, 95)
    : 0;

  if (!isReady) {
    return (
      <LinearGradient
        colors={[Colors.cream, Colors.sand, Colors.parchment]}
        locations={[0, 0.5, 1]}
        style={styles.container}
      />
    );
  }

  if (!activeJar) {
    return (
      <LinearGradient
        colors={[Colors.cream, Colors.sand, Colors.parchment]}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        <AmbientParticles />
        <View style={[styles.emptyContainer, { paddingTop: insets.top + 20 }]}>
          <JarVisualization fillPercent={0} size={180} />
          <Text style={styles.emptyTitle}>No active jar</Text>
          <Text style={styles.emptySubtitle}>Start a new jar to begin your gratitude journey</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/duration-picker')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.terracotta, Colors.terracottaDark]}
              style={styles.startGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.startText}>Start a new jar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={[Colors.cream, Colors.sand, Colors.parchment, Colors.gradientSunrise]}
      locations={[0, 0.35, 0.7, 1]}
      style={styles.container}
    >
      <AmbientParticles />

      <View style={[styles.mainContent, { paddingTop: insets.top + 16 }]}>
        <Animated.View
          style={[
            styles.greetingSection,
            {
              opacity: greetFade,
              transform: [{ translateY: greetSlide }],
            },
          ]}
        >
          <Text style={styles.greeting}>
            {getGreeting()}{user?.name ? `, ${user.name}` : ''}
          </Text>
          <View style={styles.greetingMeta}>
            <View style={styles.notesBadge}>
              <Text style={styles.notesBadgeText}>
                {jarNotes.length} {jarNotes.length === 1 ? 'note' : 'notes'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editTimelineButton}
              onPress={() => {
                triggerHaptic('light');
                router.push('/duration-picker?edit=true');
              }}
              activeOpacity={0.7}
              testID="edit-timeline"
            >
              <Pencil color={Colors.terracotta} size={12} />
              <Text style={styles.editTimelineText}>Edit timeline</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <TouchableOpacity
          onPress={handleJarTap}
          activeOpacity={0.9}
          style={styles.jarTouchable}
          testID="jar-tap"
        >
          <Animated.View
            style={[
              styles.jarWrapper,
              {
                opacity: jarFadeIn,
                transform: [
                  { translateX: shakeAnim },
                  { scale: isUnlockable ? pulseAnim : jarEntrance },
                ],
              },
            ]}
          >
            <JarVisualization fillPercent={fillPercent} size={250} />
          </Animated.View>
        </TouchableOpacity>

        {showLockedMessage && (
          <Animated.View style={[styles.lockedMessage, { opacity: lockedFade }]}>
            <Lock color={Colors.textMuted} size={13} />
            <Text style={styles.lockedText}>Not yet, keep going.</Text>
          </Animated.View>
        )}

        <View style={styles.countdownSection}>
          {isUnlockable ? (
            <Animated.View style={[styles.readyBadge, { transform: [{ scale: readyPulse }] }]}>
              <Sparkles color={Colors.honey} size={20} />
              <Text style={styles.readyText}>Ready to open!</Text>
              <Text style={styles.readySubtext}>Tap the jar to reveal your notes</Text>
            </Animated.View>
          ) : (
            <>
              <Text style={styles.countdownLabel}>OPENS IN</Text>
              <Text style={styles.countdownText}>{countdown.replace('Opens in ', '')}</Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progressWidth },
                  ]}
                >
                  <View style={styles.progressShine} />
                </Animated.View>
              </View>
            </>
          )}
        </View>
      </View>

      {!isUnlockable && (
        <Animated.View
          style={[
            styles.fabContainer,
            {
              bottom: 100 + insets.bottom,
              transform: [{ scale: Animated.multiply(fabScale, fabEntrance) }],
              opacity: fabEntrance,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleAddNote}
            activeOpacity={0.85}
            testID="add-note-fab"
          >
            <LinearGradient
              colors={[Colors.terracotta, Colors.terracottaDark]}
              style={styles.fab}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus color={Colors.white} size={28} strokeWidth={2.5} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getProgressPercent(startDate: string, unlockDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(unlockDate).getTime();
  const now = new Date().getTime();
  const progress = ((now - start) / (end - start)) * 100;
  return Math.min(Math.max(progress, 2), 100);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  greetingSection: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.3,
  },
  greetingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  notesBadge: {
    backgroundColor: 'rgba(212, 162, 78, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  notesBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.honeyDark,
  },
  editTimelineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.roseSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  editTimelineText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.terracotta,
  },
  jarTouchable: {
    marginTop: 10,
  },
  jarWrapper: {
    alignItems: 'center',
  },
  lockedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  lockedText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
  },
  countdownSection: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.textLight,
    letterSpacing: 2,
    marginBottom: 6,
  },
  countdownText: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 18,
  },
  progressBar: {
    width: '75%',
    height: 8,
    backgroundColor: 'rgba(194, 120, 92, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.terracotta,
    overflow: 'hidden',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  readyBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(212, 162, 78, 0.1)',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.honey,
    gap: 6,
  },
  readyText: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.honeyDark,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  readySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 16,
    width: '100%',
    shadowColor: Colors.terracottaDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  startGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  fabContainer: {
    position: 'absolute',
    right: 24,
    zIndex: 100,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.terracottaDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
});
