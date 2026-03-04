import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { X, Send, Feather } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { triggerHaptic } from '@/utils/helpers';

const MAX_CHARS = 200;

export default function WriteNoteScreen() {
  const { addNote } = useGratitude();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const paperAnim = useRef(new Animated.Value(0)).current;
  const paperY = useRef(new Animated.Value(0)).current;
  const paperScale = useRef(new Animated.Value(1)).current;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const featherRotate = useRef(new Animated.Value(0)).current;
  const inputSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(inputSlide, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(featherRotate, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(featherRotate, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, inputSlide, featherRotate]);

  const handleSubmit = () => {
    if (!text.trim() || isSubmitting) return;
    triggerHaptic('success');
    setIsSubmitting(true);
    Keyboard.dismiss();

    console.log('[WriteNote] Submitting note:', text.trim().substring(0, 30) + '...');

    Animated.sequence([
      Animated.parallel([
        Animated.timing(paperY, {
          toValue: -350,
          duration: 700,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(paperScale, {
          toValue: 0.2,
          duration: 700,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(paperAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      addNote(text.trim());
      setTimeout(() => {
        router.back();
      }, 200);
    });
  };

  const remaining = MAX_CHARS - text.length;
  const isOverLimit = remaining < 0;
  const progress = text.length / MAX_CHARS;

  const featherAngle = featherRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <LinearGradient
        colors={[Colors.cream, Colors.sand]}
        locations={[0, 1]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, paddingTop: Platform.OS === 'ios' ? insets.top + 12 : 40 }]}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.closeButton}
                testID="close-note"
              >
                <X color={Colors.textSecondary} size={18} />
              </TouchableOpacity>
              <Animated.View style={{ transform: [{ rotate: featherAngle }] }}>
                <Feather color={Colors.honey} size={20} />
              </Animated.View>
              <View style={styles.charCounter}>
                <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
                  {remaining}
                </Text>
                <View style={styles.charProgressTrack}>
                  <View
                    style={[
                      styles.charProgressFill,
                      {
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor: progress > 0.9 ? Colors.danger : Colors.honey,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            <Animated.View
              style={[
                styles.inputSection,
                {
                  transform: [
                    { translateY: Animated.add(paperY, inputSlide) },
                    { scale: paperScale },
                  ],
                  opacity: paperAnim.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [1, 0.5, 0],
                  }),
                },
              ]}
            >
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="What are you grateful for today?"
                  placeholderTextColor={Colors.textLight}
                  value={text}
                  onChangeText={setText}
                  multiline
                  maxLength={MAX_CHARS}
                  autoFocus
                  textAlignVertical="top"
                  testID="note-input"
                />
              </View>
            </Animated.View>

            <View style={styles.bottomSection}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!text.trim() || isOverLimit || isSubmitting) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!text.trim() || isOverLimit || isSubmitting}
                activeOpacity={0.8}
                testID="add-to-jar-button"
              >
                <LinearGradient
                  colors={(!text.trim() || isOverLimit || isSubmitting)
                    ? [Colors.textLight, Colors.textLight]
                    : [Colors.terracotta, Colors.terracottaDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  <Send color={Colors.white} size={16} />
                  <Text style={styles.submitText}>Add to jar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  charCounter: {
    alignItems: 'flex-end',
    gap: 4,
  },
  charCount: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  charCountOver: {
    color: Colors.danger,
  },
  charProgressTrack: {
    width: 48,
    height: 3,
    backgroundColor: 'rgba(170, 120, 70, 0.06)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  charProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  inputSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  inputCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  input: {
    fontSize: 18,
    color: Colors.textPrimary,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bottomSection: {
    paddingTop: 16,
  },
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  submitGradient: {
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
  },
  submitText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
