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
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Share2, RotateCcw, Heart, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { formatDateShort, getDurationLabel, triggerHaptic } from '@/utils/helpers';
import GoldenParticles from '@/components/GoldenParticles';
import JarVisualization from '@/components/JarVisualization';

export default function UnlockRevealScreen() {
  const { jarId } = useLocalSearchParams<{ jarId: string }>();
  const { getNotesForJar, jars } = useGratitude();
  const [phase, setPhase] = useState<'shake' | 'open' | 'notes'>('shake');
  const [showParticles, setShowParticles] = useState<boolean>(false);
  

  const jar = jars.find((j) => j.id === jarId);
  const jarNotes = jarId ? getNotesForJar(jarId) : [];

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lidAnim = useRef(new Animated.Value(0)).current;
  const jarScale = useRef(new Animated.Value(1)).current;
  const noteAnims = useRef(jarNotes.map(() => new Animated.Value(0))).current;
  const headerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!jarId || !jar) return;

    console.log('[UnlockReveal] Starting reveal for jar:', jarId);

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      triggerHaptic('success');
      setPhase('open');
      setShowParticles(true);

      Animated.parallel([
        Animated.timing(lidAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(jarScale, {
            toValue: 1.1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(jarScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setTimeout(() => {
          setPhase('notes');
          Animated.timing(headerFade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
          revealNotesSequentially();
        }, 800);
      });
    });
  }, [jarId]);

  const revealNotesSequentially = useCallback(() => {
    const animations = noteAnims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * 300),
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(animations).start();

  }, [noteAnims, jarNotes.length]);

  const shakeTranslate = shakeAnim.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [0, -8, 8, -8, 8, -6, 6, -4, 4, -2, 0],
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
      <View style={[styles.container, { backgroundColor: Colors.cream }]}>
        {showParticles && <GoldenParticles />}

        {phase === 'shake' && (
          <View style={styles.shakeContainer}>
            <Animated.View
              style={{
                transform: [{ translateX: shakeTranslate }, { scale: jarScale }],
              }}
            >
              <JarVisualization fillPercent={100} size={250} />
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
              <JarVisualization fillPercent={100} size={250} isUnlocked />
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
                <Sparkles color={Colors.honey} size={22} />
              </View>
              <Text style={styles.notesTitle}>
                {jarNotes.length} {jarNotes.length === 1 ? 'note' : 'notes'} of gratitude
              </Text>
              <Text style={styles.notesDuration}>
                {getDurationLabel(jar.durationMinutes)} jar
              </Text>
              <View style={styles.headerDivider}>
                <View style={styles.headerDividerLine} />
                <Heart color={Colors.honey} size={12} fill={Colors.honey} />
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
                          outputRange: [40, 0],
                        }),
                      },
                      {
                        scale: (noteAnims[index] ?? new Animated.Value(1)).interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1],
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
                <Share2 color={Colors.terracotta} size={16} />
                <Text style={styles.shareText}>Share recap</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.newJarButton}
                onPress={handleNewJar}
                activeOpacity={0.8}
                testID="new-jar-button"
              >
                <RotateCcw color={Colors.white} size={16} />
                <Text style={styles.newJarText}>Start a new jar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shakeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shakeText: {
    marginTop: 32,
    fontSize: 19,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic' as const,
  },
  shimmerDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  shimmerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
    marginBottom: 28,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(232, 180, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  notesTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  notesDuration: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 6,
  },
  headerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  headerDividerLine: {
    width: 36,
    height: 1,
    backgroundColor: 'rgba(232, 180, 80, 0.2)',
  },
  noteCard: {
    marginBottom: 12,
  },
  noteCardInner: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  noteDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  noteDateDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.honey,
  },
  noteDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  noteText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bottomActions: {
    marginTop: 24,
    gap: 12,
    paddingBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(184, 115, 51, 0.15)',
    backgroundColor: Colors.cardBg,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.terracotta,
  },
  newJarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: Colors.terracotta,
    paddingVertical: 17,
  },
  newJarText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
