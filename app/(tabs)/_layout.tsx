import { Tabs } from 'expo-router';
import { Home, Archive, Settings } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';
import Colors from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.terracotta,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.cream,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
          ...(Platform.OS === 'web' ? { borderTopWidth: 1, borderTopColor: 'rgba(170, 120, 70, 0.06)' } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color, size }) => <Archive color={color} size={size - 2} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size - 2} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}
