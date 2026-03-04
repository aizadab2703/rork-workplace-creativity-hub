import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  Platform,
  Share,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Gift, Share2, RotateCcw, Heart, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { formatDateShort, getDurationLabel, triggerHaptic } from '@/utils/helpers';
import GoldenParticles from '@/components/GoldenParticles';
import JarVisualization from '@/components/JarVisualization';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function UnlockRevealScreen() {
  const { jarId } = useLocalSearchParams<{ jarId: string }>();
  const { getNotesForJar, unlockJar, jars } = useGratitude();
  const [phase, setPhase] = useState<'shake' | 'open' | 'notes'>('shake');
  const [showParticles, setShowParticles] = useState<boolean>(false);
  const [revealedNotes, setRevealedNotes] = useState<number>(0);

  const jar = jars.find((j) => j.id === jarId);
  const jarNotes = jarId ? getNotesForJar(jarId) : [];

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lidAnim = useRef(new Animated.Value(0)).current;
  const jarScale = useRef(new Animated.Value(1)).current;
  const noteAnims = useRef(jarNotes.map(() => new Animated.Value(0))).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const bgGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!jarId || !jar) return;

    console.log('[UnlockReveal] Starting reveal for jar:', jarId);

    Animated.timing(bgGlow, {
      toValue: 0.5,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      triggerHaptic('success');
      setPhase('open');
      setShowParticles(true);

      Animated.timing(bgGlow, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      Animated.parallel([
        Animated.timing(lidAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(jarScale, {
            toValue: 1.15,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(jarScale, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setTimeout(() => {
          setPhase('notes');
          Animated.timing(headerFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
          revealNotesSequentially();
        }, 900);
      });
    });
  }, [jarId]);

  const revealNotesSequentially = useCallback(() => {
    const animations = noteAnims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * 350),
        Animated.spring(anim, {
          toValue: 1,
          tension: 45,
          friction: 8,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(animations).start();
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedNotes(count);
      if (count >= jarNotes.length) clearInterval(interval);
    }, 350);
  }, [noteAnims, jarNotes.length]);

  const shakeTranslate = shakeAnim.interpolate({
    inputRange: [0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, -10, 10, -10, 10, -7, 7, -5, 5, -3, 2, 0],
  });

  const handleShare = async () => {
    if (!jar) return;
    triggerHaptic('light');
    const preview = jarNotes
      .slice(0, 3)
      .map((n) => `"${n.text}"`)
      .join('\n');
    const message = `My GratitudeJar (${getDurationLabel(jar.durationMinutes)})\n${jarNotes.length} notes of gratitude\n\n${preview}\n\nTry GratitudeJar!`;
    try {
      await Share.share({ message });
    } catch (e) {
      console.log('[UnlockReveal] Share error:', e);
    }
  };

  const handleNewJar = () => {
    triggerHaptic('medium');
    router.replace('/duration-picker');
  };

  if (!jar) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Jar not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.cream, Colors.sand, Colors.parchment, Colors.gradientSunrise]}
        locations={[0, 0.25, 0.55, 1]}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.bgGlowOverlay,
            { opacity: bgGlow },
          ]}
        />

        {showParticles && <GoldenParticles />}

        {phase === 'shake' && (
          <View style={styles.shakeContainer}>
            <Animated.View
              style={{
                transform: [{ translateX: shakeTranslate }, { scale: jarScale }],
              }}
            >
              <JarVisualization fillPercent={100} size={260} />
            </Animated.View>
            <Text style={styles.shakeText}>Opening your jar...</Text>
            <View style={styles.shimmerDots}>
              {[0, 1, 2].map(i => (
                <Animated.View
                  key={i}
                  style={[
                    styles.shimmerDot,
                    {
                      opacity: shakeAnim.interpolate({
                        inputRange: [i * 0.3, i * 0.3 + 0.15, i * 0.3 + 0.3],
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {phase === 'open' && (
          <View style={styles.openContainer}>
            <Animated.View
              style={{
                transform: [{ scale: jarScale }],
              }}
            >
              <JarVisualization fillPercent={100} size={260} isUnlocked />
            </Animated.View>
          </View>
        )}

        {phase === 'notes' && (
          <ScrollView
            style={styles.notesScroll}
            contentContainerStyle={styles.notesContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.notesHeader, { opacity: headerFade }]}>
              <View style={styles.headerIcon}>
                <Sparkles color={Colors.honey} size={24} />
              </View>
              <Text style={styles.notesTitle}>
                {jarNotes.length} {jarNotes.length === 1 ? 'note' : 'notes'} of gratitude
              </Text>
              <Text style={styles.notesDuration}>
                {getDurationLabel(jar.durationMinutes)} jar
              </Text>
              <View style={styles.headerDivider}>
                <View style={styles.headerDividerLine} />
                <Heart color={Colors.roseGold} size={14} fill={Colors.roseGold} />
                <View style={styles.headerDividerLine} />
              </View>
            </Animated.View>

            {jarNotes.map((note, index) => (
              <Animated.View
                key={note.id}
                style={[
                  styles.noteCard,
                  {
                    opacity: noteAnims[index] ?? new Animated.Value(1),
                    transform: [
                      {
                        translateY: (noteAnims[index] ?? new Animated.Value(0)).interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                      {
                        scale: (noteAnims[index] ?? new Animated.Value(1)).interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.92, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.noteCardInner}>
                  <View style={styles.noteDateRow}>
                    <View style={styles.noteDateDot} />
                    <Text style={styles.noteDate}>
                      {formatDateShort(note.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.noteText}>{note.text}</Text>
                </View>
              </Animated.View>
            ))}

            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.8}
                testID="share-recap"
              >
                <Share2 color={Colors.terracotta} size={17} />
                <Text style={styles.shareText}>Share recap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.newJarButton}
                onPress={handleNewJar}
                activeOpacity={0.8}
                testID="new-jar-button"
              >
                <LinearGradient
                  colors={[Colors.terracotta, Colors.terracottaDark]}
                  style={styles.newJarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <RotateCcw color={Colors.white} size={17} />
                  <Text style={styles.newJarText}>Start a new jar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(232, 196, 118, 0.08)',
  },
  shakeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shakeText: {
    marginTop: 36,
    fontSize: 21,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic' as const,
  },
  shimmerDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  shimmerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.honey,
  },
  openContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesScroll: {
    flex: 1,
  },
  notesContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 60,
  },
  notesHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 162, 78, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  notesDuration: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 6,
  },
  headerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  headerDividerLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(194, 120, 92, 0.2)',
  },
  noteCard: {
    marginBottom: 14,
  },
  noteCardInner: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.walnut,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  noteDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  noteDateDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.terracotta,
  },
  noteDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  noteText: {
    fontSize: 17,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bottomActions: {
    marginTop: 28,
    gap: 14,
    paddingBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.terracotta,
    backgroundColor: Colors.cardBg,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.terracotta,
  },
  newJarButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.terracottaDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  newJarGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  newJarText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700' as const,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
