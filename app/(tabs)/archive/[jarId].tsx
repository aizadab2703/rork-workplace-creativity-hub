import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Heart } from 'lucide-react-native';
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
            fontSize: 17,
          },
          headerStyle: {
            backgroundColor: Colors.cream,
          },
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.durationBadge}>
              <Text style={styles.duration}>{getDurationLabel(jar.durationMinutes)}</Text>
            </View>
            <View style={styles.headerDivider}>
              <View style={styles.headerDividerLine} />
              <Heart color={Colors.honey} size={10} fill={Colors.honey} />
              <View style={styles.headerDividerLine} />
            </View>
            <Text style={styles.notesCount}>
              {jarNotes.length} {jarNotes.length === 1 ? 'note' : 'notes'}
            </Text>
          </View>

          {jarNotes.map((note, index) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteNumberBadge}>
                <Text style={styles.noteNumber}>{index + 1}</Text>
              </View>
              <View style={styles.noteBody}>
                <View style={styles.noteDateRow}>
                  <View style={styles.noteDateDot} />
                  <Text style={styles.noteDate}>{formatDateShort(note.createdAt)}</Text>
                </View>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
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
    backgroundColor: Colors.cream,
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
    backgroundColor: 'rgba(212, 160, 74, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  duration: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.honeyDark,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
  },
  headerDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  headerDividerLine: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(212, 160, 74, 0.15)',
  },
  notesCount: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  noteCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  noteNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 160, 74, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  noteNumber: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.honeyDark,
  },
  noteBody: {
    flex: 1,
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
    lineHeight: 25,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});
