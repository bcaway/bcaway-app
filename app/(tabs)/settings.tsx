import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, SafeAreaView, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../src/components/ui/GlassCard';

export default function SettingsScreen() {
  const [morningAlerts, setMorningAlerts] = useState(false);

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Morning Alerts</Text>
                <Text style={styles.rowDescription}>Receive a notification at 7:30 AM with a summary of absent teachers.</Text>
              </View>
              <Switch
                value={morningAlerts}
                onValueChange={setMorningAlerts}
                trackColor={{ false: '#E5E7EB', true: '#2563EB' }}
                thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : morningAlerts ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT BCAWAY</Text>
          <GlassCard style={styles.card}>
            <View style={[styles.row, styles.borderBottom]}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
            <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => openLink('https://bcaway.com')}>
              <Text style={styles.rowLabel}>Website</Text>
              <View style={styles.rowAccessory}>
                <Text style={styles.linkText}>bcaway.com</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => openLink('https://github.com/bcaway')}>
              <Text style={styles.rowLabel}>GitHub</Text>
              <View style={styles.rowAccessory}>
                <Ionicons name="logo-github" size={18} color="#6B7280" style={{ marginRight: 4 }} />
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            <View style={styles.row}>
              <Text style={styles.rowDescription}>Made for BCA Students.</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCHEDULE INFO</Text>
          <GlassCard style={styles.card}>
            <View style={[styles.row, styles.borderBottom]}>
              <Text style={styles.rowLabel}>Schedule Source</Text>
              <Text style={styles.rowValue}>BCAway GitHub</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>School Year</Text>
              <Text style={styles.rowValue}>2026-2027</Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  rowContent: {
    flex: 1,
    paddingRight: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: '#111827',
  },
  rowValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  rowDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  rowAccessory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#2563EB',
    marginRight: 4,
  },
});
