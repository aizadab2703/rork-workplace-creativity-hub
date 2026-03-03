import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { formatDateShort, getDurationLabel, getJarMonthYear } from '@/utils/helpers';

export default function ArchivedJarScreen() {
  const { jarId } = useLocalSearchParams<{ jarId: string }>();
  const { jars, getNotesForJar } = useGratitude();
  const jar = jars.find((j) => j.id === jarId);
  const jarNotes = jarId ? getNotesForJar(jarId) : [];

  if (!jar) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Jar not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: getJarMonthYear(jar.startDate),
          headerTitleStyle: {
            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
            fontWeight: '600',
            color: Colors.textPrimary,
          },
          headerStyle: {
            backgroundColor: Colors.cream,
          },
        }}
      />
      <View style={[styles.container, { backgroundColor: Colors.cream }]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.durationBadge}>
              <Text style={styles.duration}>{getDurationLabel(jar.durationMinutes)}</Text>
            </View>
            <Text style={styles.notesCount}>
              {jarNotes.length} {jarNotes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>

          {jarNotes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteDateRow}>
                <View style={styles.noteDateDot} />
                <Text style={styles.noteDate}>{formatDateShort(note.createdAt)}</Text>
              </View>
              <Text style={styles.noteText}>{note.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
    paddingVertical: 10,
    gap: 6,
  },
  durationBadge: {
    backgroundColor: 'rgba(232, 180, 80, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
  },
  duration: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.honeyDark,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  notesCount: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  noteCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
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
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
