import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={[Colors.cream, Colors.sand]}
        style={styles.container}
      >
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
      </LinearGradient>
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
    marginBottom: 24,
    paddingVertical: 12,
    gap: 8,
  },
  durationBadge: {
    backgroundColor: Colors.roseSoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  duration: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.terracotta,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  notesCount: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  noteCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.walnut,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
