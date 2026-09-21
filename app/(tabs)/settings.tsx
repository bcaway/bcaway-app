import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../src/components/ui/GlassCard';

export default function SettingsScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const openPhoneSettings = () => {
    Linking.openSettings().catch(err => console.error("Couldn't open settings", err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          <GlassCard style={styles.card}>
            <View style={[styles.row, styles.borderBottom]}>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Morning Alerts</Text>
                <Text style={styles.rowDescription}>
                  Sent automatically at 7:30 AM with the day's teacher absences.
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>Always On</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.row} onPress={openPhoneSettings}>
              <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>Phone Settings</Text>
                <Text style={styles.rowDescription}>
                  Manage system notification permissions for BCAway
                </Text>
              </View>
              <View style={styles.rowAccessory}>
                <Ionicons name="open-outline" size={18} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Info and Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFO AND SUPPORT</Text>
          <GlassCard style={styles.card}>
            <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => openLink('https://bcaway.com')}>
              <Text style={styles.rowLabel}>Website</Text>
              <View style={styles.rowAccessory}>
                <Text style={styles.linkText}>bcaway.com</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => openLink('https://instagram.com/bcaway')}>
              <Text style={styles.rowLabel}>Instagram</Text>
              <View style={styles.rowAccessory}>
                <Text style={styles.linkText}>@bcaway</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => openLink('mailto:contact@bcaway.com')}>
              <Text style={styles.rowLabel}>Contact</Text>
              <View style={styles.rowAccessory}>
                <Text style={styles.linkText}>contact@bcaway.com</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, styles.borderBottom]} onPress={() => openLink('https://bcaway.com/privacy')}>
              <Text style={styles.rowLabel}>Privacy Policy</Text>
              <View style={styles.rowAccessory}>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={() => openLink('https://github.com/bcaway')}>
              <Text style={styles.rowLabel}>GitHub</Text>
              <View style={styles.rowAccessory}>
                <Ionicons name="logo-github" size={18} color="#6B7280" style={{ marginRight: 4 }} />
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFO</Text>
          <GlassCard style={styles.card}>
            <View style={[styles.row, styles.borderBottom]}>
              <Text style={styles.rowLabel}>Developer</Text>
              <Text style={styles.rowValue}>Kabir Sekhon</Text>
            </View>
            <View style={[styles.row, styles.borderBottom]}>
              <Text style={styles.rowLabel}>License</Text>
              <Text style={styles.rowValue}>AGPL v3.0</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0</Text>
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
    backgroundColor: '#FAFAFA',
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
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -0.5,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontWeight: '500',
    color: '#111827',
  },
  rowValue: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  rowDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 18,
  },
  statusPill: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  rowAccessory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    color: '#2563EB',
    marginRight: 4,
  },
});
