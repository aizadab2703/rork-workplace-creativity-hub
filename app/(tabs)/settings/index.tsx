import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { User, Bell, LogOut, Shield, Heart, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGratitude } from '@/providers/GratitudeProvider';
import { triggerHaptic } from '@/utils/helpers';

export default function SettingsScreen() {
  const { user, signOut, jars, notes } = useGratitude();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be cleared from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('medium');
            signOut();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
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
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: Colors.roseSoft }]}>
                    <User color={Colors.terracotta} size={17} />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>{user?.name || 'User'}</Text>
                    <Text style={styles.rowSubtext}>{user?.email || ''}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 162, 78, 0.1)' }]}>
                    <Shield color={Colors.honey} size={17} />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Signed in with</Text>
                    <Text style={styles.rowSubtext}>
                      {user?.provider === 'apple' ? 'Apple' : 'Google'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 162, 78, 0.1)' }]}>
                    <Bell color={Colors.honey} size={17} />
                  </View>
                  <Text style={styles.rowLabel}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#D4D0CC', true: Colors.terracottaLight }}
                  thumbColor={notificationsEnabled ? Colors.terracotta : '#F5F3F0'}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Sparkles color={Colors.honey} size={18} />
                <Text style={styles.statNumber}>{jars.length}</Text>
                <Text style={styles.statLabel}>Jars</Text>
              </View>
              <View style={styles.statCard}>
                <Heart color={Colors.roseGold} size={18} />
                <Text style={styles.statNumber}>{notes.length}</Text>
                <Text style={styles.statLabel}>Notes</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
            testID="sign-out-button"
          >
            <LogOut color={Colors.danger} size={17} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Heart color={Colors.roseGold} size={13} fill={Colors.roseGold} />
            <Text style={styles.footerText}>Made with love</Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textLight,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  rowSubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(194, 120, 92, 0.06)',
    marginHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(196, 75, 75, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(196, 75, 75, 0.1)',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.danger,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 'auto' as const,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
