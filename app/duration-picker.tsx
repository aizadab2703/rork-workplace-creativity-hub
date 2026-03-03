import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Clock, Calendar, Sparkles, Timer, Zap, Hourglass, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { DurationOption } from '@/types';
import { triggerHaptic } from '@/utils/helpers';

const DURATION_OPTIONS: {
  value: DurationOption;
  title: string;
  subtitle: string;
  icon: typeof Clock;
  section: 'test' | 'standard';
  accent: string;
}[] = [
  { value: 5, title: '5 Minutes', subtitle: 'Quick test run', icon: Zap, section: 'test', accent: Colors.terracottaLight },
  { value: 15, title: '15 Minutes', subtitle: 'A short preview', icon: Timer, section: 'test', accent: Colors.terracotta },
  { value: 60, title: '1 Hour', subtitle: 'Try it out today', icon: Hourglass, section: 'test', accent: Colors.roseGold },
  { value: 1440, title: '1 Day', subtitle: 'A little surprise tomorrow', icon: Clock, section: 'standard', accent: Colors.honey },
  { value: 10080, title: '1 Week', subtitle: 'A week of gratitude', icon: Calendar, section: 'standard', accent: Colors.honeyDark },
  { value: 43200, title: '30 Days', subtitle: 'The full experience', icon: Sparkles, section: 'standard', accent: Colors.gold },
];

export default function DurationPickerScreen() {
  const { createJar, updateJarDuration, getActiveJar } = useGratitude();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditMode = edit === 'true';
  const activeJar = getActiveJar();

  const [selected, setSelected] = useState<DurationOption | null>(
    isEditMode && activeJar ? (activeJar.durationMinutes as DurationOption) : null
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(DURATION_OPTIONS.map(() => new Animated.Value(0))).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const selectedScale = useRef(new Animated.Value(1)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      70,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 55,
          friction: 9,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [fadeAnim, cardAnims, headerSlide]);

  useEffect(() => {
    if (selected !== null) {
      Animated.spring(buttonAnim, {
        toValue: 1,
        tension: 55,
        friction: 9,
        useNativeDriver: true,
      }).start();
    }
  }, [selected, buttonAnim]);

  const handleSelect = (value: DurationOption) => {
    triggerHaptic('light');
    setSelected(value);
    Animated.sequence([
      Animated.timing(selectedScale, {
        toValue: 0.97,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(selectedScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleConfirm = () => {
    if (!selected) return;
    triggerHaptic('success');

    if (isEditMode && activeJar) {
      console.log('[DurationPicker] Updating jar duration to:', selected);
      updateJarDuration(activeJar.id, selected);
    } else {
      console.log('[DurationPicker] Creating jar with duration:', selected);
      createJar(selected);
    }
    router.replace('/');
  };

  const testOptions = DURATION_OPTIONS.filter(o => o.section === 'test');
  const standardOptions = DURATION_OPTIONS.filter(o => o.section === 'standard');

  const renderCard = (option: typeof DURATION_OPTIONS[number], index: number, globalIndex: number) => {
    const isSelected = selected === option.value;
    const Icon = option.icon;
    return (
      <Animated.View
        key={option.value}
        style={{
          opacity: cardAnims[globalIndex],
          transform: [
            {
              translateY: (cardAnims[globalIndex] ?? new Animated.Value(0)).interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            ...(isSelected ? [{ scale: selectedScale }] : []),
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.card, isSelected && styles.cardSelected]}
          onPress={() => handleSelect(option.value)}
          activeOpacity={0.7}
          testID={`duration-${option.value}`}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.iconContainer,
                isSelected && { backgroundColor: option.accent },
              ]}
            >
              <Icon
                color={isSelected ? Colors.white : option.accent}
                size={18}
              />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                {option.title}
              </Text>
              <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
            </View>
          </View>
          {isSelected && (
            <View style={[styles.selectedCheck, { backgroundColor: option.accent }]}>
              <Check color={Colors.white} size={13} strokeWidth={3} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.cream }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.header, { transform: [{ translateY: headerSlide }] }]}>
            <Text style={styles.title}>
              {isEditMode ? 'Change your\ntimeline' : 'How long do you\nwant to wait?'}
            </Text>
            <Text style={styles.subtitle}>
              {isEditMode ? 'Pick a new duration for your jar' : 'Choose when your jar will open'}
            </Text>
          </Animated.View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>QUICK TEST</Text>
              </View>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.cards}>
              {testOptions.map((option, index) => renderCard(option, index, DURATION_OPTIONS.indexOf(option)))}
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBadgeStandard}>
                <Text style={styles.sectionBadgeTextStandard}>STANDARD</Text>
              </View>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.cards}>
              {standardOptions.map((option, index) => renderCard(option, index + testOptions.length, DURATION_OPTIONS.indexOf(option)))}
            </View>
          </View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonAnim,
                transform: [
                  {
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [15, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.confirmButton, !selected && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!selected}
              activeOpacity={0.8}
              testID="start-jar-button"
            >
              <Text style={styles.confirmText}>
                {isEditMode ? 'Update timeline' : 'Start my jar'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    lineHeight: 38,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionBadge: {
    backgroundColor: Colors.roseSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.terracotta,
    letterSpacing: 1,
  },
  sectionBadgeStandard: {
    backgroundColor: 'rgba(232, 180, 80, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeTextStandard: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.honeyDark,
    letterSpacing: 1,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(184, 115, 51, 0.06)',
  },
  cards: {
    gap: 8,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: Colors.honey,
    backgroundColor: 'rgba(255, 250, 243, 0.98)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(184, 115, 51, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  selectedCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 22,
    paddingBottom: 20,
  },
  confirmButton: {
    borderRadius: 16,
    backgroundColor: Colors.terracotta,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.35,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600' as const,
  },
});
