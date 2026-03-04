import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { Archive, BookOpen, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { getJarMonthYear, getDurationLabel } from '@/utils/helpers';
import { Jar } from '@/types';

export default function ArchiveScreen() {
  const { getArchivedJars, getNotesForJar } = useGratitude();
  const archivedJars = getArchivedJars();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderJarCard = ({ item, index }: { item: Jar; index: number }) => {
    const notesCount = getNotesForJar(item.id).length;
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={styles.jarCard}
          onPress={() => router.push(`/archive/${item.id}`)}
          activeOpacity={0.7}
          testID={`archive-jar-${item.id}`}
        >
          <View style={styles.cardLeft}>
            <View style={styles.jarIcon}>
              <BookOpen color={Colors.terracotta} size={18} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardMonth}>{getJarMonthYear(item.startDate)}</Text>
              <Text style={styles.cardDuration}>{getDurationLabel(item.durationMinutes)}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.noteCountBadge}>
              <Text style={styles.notesNumber}>{notesCount}</Text>
              <Text style={styles.notesLabel}>
                {notesCount === 1 ? 'note' : 'notes'}
              </Text>
            </View>
            <ChevronRight color={Colors.textLight} size={18} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Archive',
          headerTitleStyle: {
            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
            fontWeight: '700',
            color: Colors.textPrimary,
          },
          headerStyle: {
            backgroundColor: Colors.cream,
          },
        }}
      />
      <LinearGradient
        colors={[Colors.cream, Colors.sand]}
        style={styles.container}
      >
        {archivedJars.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Archive color={Colors.textLight} size={36} />
            </View>
            <Text style={styles.emptyTitle}>No archived jars yet</Text>
            <Text style={styles.emptySubtitle}>
              Once you open a jar, it will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={archivedJars}
            renderItem={renderJarCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  jarCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.walnut,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  jarIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    gap: 3,
  },
  cardMonth: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  cardDuration: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteCountBadge: {
    alignItems: 'center',
  },
  notesNumber: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.terracotta,
  },
  notesLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(194, 120, 92, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
