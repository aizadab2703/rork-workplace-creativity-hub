import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function ArchiveLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.cream },
        headerTintColor: Colors.textPrimary,
        headerShadowVisible: false,
      }}
    />
  );
}
