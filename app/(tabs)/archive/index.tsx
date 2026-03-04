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
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderJarCard = ({ item }: { item: Jar }) => {
    const notesCount = getNotesForJar(item.id).length;
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [15, 0],
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
              <BookOpen color={Colors.honey} size={17} />
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
            <ChevronRight color={Colors.textLight} size={16} />
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
            fontSize: 18,
          },
          headerStyle: {
            backgroundColor: Colors.cream,
          },
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        {archivedJars.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Archive color={Colors.textLight} size={30} />
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  listContent: {
    padding: 20,
    gap: 10,
  },
  jarCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  jarIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 160, 74, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    gap: 3,
  },
  cardMonth: {
    fontSize: 15,
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
    gap: 12,
  },
  noteCountBadge: {
    alignItems: 'center',
  },
  notesNumber: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.honey,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
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
    gap: 10,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(170, 120, 70, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
});
