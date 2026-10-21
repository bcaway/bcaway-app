import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme, ThemeMode } from '../../src/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { mode, setMode, colors } = useTheme();

  const userEmail = user?.email || 'student@bergen.org';

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
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

  const handleSelectTheme = (newMode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingLeft: Math.max(insets.left, 20),
            paddingRight: Math.max(insets.right, 20),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Header Title with Logged In As line */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
            <Text style={[styles.loggedInText, { color: colors.textSecondary }]}>
              Logged In As:{' '}
              <Text style={[styles.loggedInEmail, { color: colors.textPrimary }]}>{userEmail}</Text>
            </Text>
          </View>

          {/* Unnamed Section: Starred Faculty (placed directly above Theme) */}
          <View style={styles.section}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/starred-teachers' as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="star" size={18} color={colors.star} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Starred Faculty</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Theme (Expo Settings inspired with row items, icons & right checkmark) */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Theme</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Automatic */}
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleSelectTheme('system')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="contrast" size={19} color={colors.textPrimary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Automatic</Text>
                </View>
                <Ionicons
                  name={mode === 'system' ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={mode === 'system' ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>

              {/* Light */}
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleSelectTheme('light')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="sunny-outline" size={19} color={colors.textPrimary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Light</Text>
                </View>
                <Ionicons
                  name={mode === 'light' ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={mode === 'light' ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>

              {/* Dark */}
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleSelectTheme('dark')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="moon-outline" size={19} color={colors.textPrimary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Dark</Text>
                </View>
                <Ionicons
                  name={mode === 'dark' ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={mode === 'dark' ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>
              Automatic follows your device's system appearance.
            </Text>
          </View>

          {/* Section: Combined About & Legal */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>About & Legal</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => openLink('https://www.bcaway.app')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="globe-outline" size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Website</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.row}
                onPress={() => openLink('https://github.com/bcaway')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="logo-github" size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>GitHub</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.row}
                onPress={() => openLink('https://www.bcaway.app/privacy')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Privacy Policy</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.row}
                onPress={() => openLink('https://www.bcaway.app/terms')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} style={styles.rowIcon} />
                  <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Terms & Disclaimers</Text>
                </View>
                <Ionicons name="open-outline" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Card Button */}
          <View style={styles.signOutSection}>
            <TouchableOpacity
              style={[styles.signOutCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.absent}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.signOutText, { color: colors.absent }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          {/* App Info Footer */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerVersion, { color: colors.textMuted }]}>
              BCAway {Constants.expoConfig?.version ?? '1.1.2'}
            </Text>
            <Text style={[styles.footerDeveloper, { color: colors.textTertiary || colors.textMuted }]}>
              Developed by Kabir Sekhon
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  wrapper: {
    width: '100%',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  loggedInText: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    letterSpacing: -0.1,
  },
  loggedInEmail: {
    fontWeight: '600',
  },
  section: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 8,
    marginLeft: 2,
  },
  sectionCaption: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 6,
    marginLeft: 4,
    lineHeight: 18,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 14 : 13,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    marginRight: 14,
    width: 20,
    textAlign: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  signOutSection: {
    marginTop: 6,
    marginBottom: 20,
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
    gap: 3,
  },
  footerVersion: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  footerDeveloper: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
});
