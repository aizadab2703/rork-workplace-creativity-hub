import { Platform } from 'react-native';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getCountdownText(unlockDate: string, durationMinutes: number): string {
  const now = new Date().getTime();
  const unlock = new Date(unlockDate).getTime();
  const diff = unlock - now;

  if (diff <= 0) return 'Ready to open!';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (durationMinutes <= 60) {
    if (minutes > 0) return `Opens in ${minutes}m ${seconds}s`;
    return `Opens in ${seconds}s`;
  }

  if (durationMinutes <= 1440) {
    if (hours > 0) return `Opens in ${hours}h ${minutes}m`;
    return `Opens in ${minutes}m`;
  }

  if (durationMinutes <= 10080) {
    if (days > 0) return `Opens in ${days}d ${hours}h`;
    if (hours > 0) return `Opens in ${hours}h ${minutes}m`;
    return `Opens in ${minutes}m`;
  }

  if (days > 1) return `Opens in ${days} days`;
  if (days === 1) return 'Opens tomorrow';
  if (hours > 0) return `Opens in ${hours} hours`;
  return `Opens in ${minutes} minutes`;
}

export function isJarUnlockable(unlockDate: string): boolean {
  return new Date().getTime() >= new Date(unlockDate).getTime();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getJarMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function getDurationLabel(minutes: number): string {
  if (minutes === 5) return '5 Minutes';
  if (minutes === 15) return '15 Minutes';
  if (minutes === 60) return '1 Hour';
  if (minutes === 1440) return '1 Day';
  if (minutes === 10080) return '1 Week';
  if (minutes === 43200) return '30 Days';
  if (minutes < 60) return `${minutes} Minutes`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} Hours`;
  return `${Math.round(minutes / 1440)} Days`;
}

export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' = 'light') {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = require('expo-haptics');
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  } catch (e) {
    console.log('Haptics not available');
  }
}
