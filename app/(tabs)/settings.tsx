import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../src/context/AuthContext';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Are you sure you want to sign out of BCAway?')) {
        signOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out of BCAway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: () => signOut(),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.wrapper}>
          <Text style={styles.headerTitle}>About & Links</Text>
          <Text style={styles.headerSub}>Project information, links, and contact</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Section: Account */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>ACCOUNT</Text>
            <View style={styles.cardGroup}>
              <View style={[styles.metaRow, styles.divider]}>
                <Text style={styles.metaLabel}>Student Email</Text>
                <Text style={styles.metaValue} numberOfLines={1}>
                  {user?.email || 'student@bergen.org'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.signOutRow}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={16} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Links & Community */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>ONLINE & COMMUNITY</Text>
            <View style={styles.cardGroup}>
              <TouchableOpacity
                style={[styles.linkRow, styles.divider]}
                onPress={() => openLink('https://bcaway.app')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkLabel}>Website</Text>
                  <Text style={styles.linkTarget}>bcaway.app</Text>
                </View>
                <Ionicons name="open-outline" size={15} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.linkRow, styles.divider]}
                onPress={() => openLink('https://instagram.com/getbcaway')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkLabel}>Instagram</Text>
                  <Text style={styles.linkTarget}>@getbcaway</Text>
                </View>
                <Ionicons name="open-outline" size={15} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('https://github.com/bcaway')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkLabel}>GitHub</Text>
                  <Text style={styles.linkTarget}>github.com/bcaway</Text>
                </View>
                <Ionicons name="logo-github" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Feedback & Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>FEEDBACK & CONTACT</Text>
            <View style={styles.cardGroup}>
              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('mailto:kabsek30@bergen.org')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkLabel}>Contact Developer</Text>
                  <Text style={styles.linkTarget}>kabsek30@bergen.org</Text>
                </View>
                <Ionicons name="mail-outline" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>LEGAL & TERMS</Text>
            <View style={styles.cardGroup}>
              <TouchableOpacity
                style={[styles.linkRow, styles.divider]}
                onPress={() => openLink('https://bcaway.app/privacy')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkLabel}>Privacy Policy</Text>
                  <Text style={styles.linkTarget}>bcaway.app/privacy</Text>
                </View>
                <Ionicons name="open-outline" size={15} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('https://bcaway.app/terms')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkLabel}>Terms & Disclaimers</Text>
                  <Text style={styles.linkTarget}>bcaway.app/terms</Text>
                </View>
                <Ionicons name="open-outline" size={15} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: App Information */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>APP INFORMATION</Text>
            <View style={styles.cardGroup}>
              <View style={[styles.metaRow, styles.divider]}>
                <Text style={styles.metaLabel}>Developer</Text>
                <Text style={styles.metaValue}>Kabir Sekhon</Text>
              </View>

              <View style={[styles.metaRow, styles.divider]}>
                <Text style={styles.metaLabel}>License</Text>
                <Text style={styles.metaValue}>AGPL v3.0</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Version</Text>
                <Text style={styles.metaValue}>1.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  wrapper: {
    width: '100%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  cardGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    width: '100%',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  linkLeft: {
    flex: 1,
    paddingRight: 12,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  linkTarget: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});
