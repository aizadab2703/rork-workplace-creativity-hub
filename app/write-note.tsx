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
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { triggerHaptic } from '@/utils/helpers';

const MAX_CHARS = 200;

export default function WriteNoteScreen() {
  const { addNote } = useGratitude();
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
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(inputSlide, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(featherRotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(featherRotate, {
          toValue: 0,
          duration: 3000,
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
    outputRange: ['-4deg', '4deg'],
  });

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <View style={[styles.container, { backgroundColor: Colors.cream }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.closeButton}
                testID="close-note"
              >
                <X color={Colors.textSecondary} size={20} />
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
                <Send color={Colors.white} size={16} />
                <Text style={styles.submitText}>Add to jar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(184, 115, 51, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCounter: {
    alignItems: 'flex-end',
    gap: 4,
  },
  charCount: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  charCountOver: {
    color: Colors.danger,
  },
  charProgressTrack: {
    width: 48,
    height: 2,
    backgroundColor: 'rgba(184, 115, 51, 0.08)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  charProgressFill: {
    height: '100%',
    borderRadius: 1,
  },
  inputSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  inputCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 170,
  },
  input: {
    fontSize: 19,
    color: Colors.textPrimary,
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  bottomSection: {
    paddingTop: 20,
  },
  submitButton: {
    borderRadius: 16,
    backgroundColor: Colors.terracotta,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
