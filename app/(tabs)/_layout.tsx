import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import {
  TodayTabIcon,
  AbsencesTabIcon,
  SettingsTabIcon,
} from '../../src/components/halloween/TabBarIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D021A',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 84 : 58,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 24 : 6,
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: -0.2,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size, focused }) => (
            <TodayTabIcon color={color} size={size + 2} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="absences"
        options={{
          title: 'Absences',
          tabBarIcon: ({ color, size, focused }) => (
            <AbsencesTabIcon color={color} size={size + 2} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <SettingsTabIcon color={color} size={size + 2} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
