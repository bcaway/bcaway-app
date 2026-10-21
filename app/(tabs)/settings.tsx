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
import { useAuth, isBcawayEmail } from '../../src/context/AuthContext';
import { useTheme, ThemeMode } from '../../src/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { mode, setMode, colors } = useTheme();

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

  const handleSelectTheme = (newMode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Sleek standard-sized header across all platforms */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.wrapper}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Preferences and information</Text>
        </View>
      </View>

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
          {/* Section: Appearance (Dark Mode) */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Appearance</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.themeSelectorRow}>
                {(['system', 'light', 'dark'] as ThemeMode[]).map((m) => {
                  const isActive = mode === m;
                  const label = m === 'system' ? 'System' : m === 'light' ? 'Light' : 'Dark';
                  const iconName =
                    m === 'system'
                      ? 'phone-portrait-outline'
                      : m === 'light'
                      ? 'sunny-outline'
                      : 'moon-outline';

                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.themeButton,
                        {
                          backgroundColor: isActive ? colors.primarySubtle : colors.surface,
                          borderColor: isActive ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleSelectTheme(m)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={iconName}
                        size={18}
                        color={isActive ? colors.primary : colors.textSecondary}
                        style={{ marginBottom: 4 }}
                      />
                      <Text
                        style={[
                          styles.themeButtonText,
                          {
                            color: isActive ? colors.primary : colors.textSecondary,
                            fontWeight: isActive ? '700' : '500',
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Section: Starred Teachers */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>My Teachers</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.starredRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/starred-teachers' as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.starredLeft}>
                  <View style={[styles.starBadge, { backgroundColor: colors.starBg }]}>
                    <Ionicons name="star" size={16} color={colors.star} />
                  </View>
                  <View style={styles.starredTextContainer}>
                    <Text style={[styles.starredTitle, { color: colors.textPrimary }]}>Starred Teachers</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Account */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Account</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.metaRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.metaLabel, { color: colors.textPrimary }]}>
                  {isBcawayEmail(user?.email || '') ? 'Account Email' : 'Student Email'}
                </Text>
                <Text style={[styles.metaValue, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user?.email || 'student@bergen.org'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.signOutRow}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="log-out-outline"
                  size={16}
                  color={colors.absent}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.signOutText, { color: colors.absent }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Links & Community */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Online & Community</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.linkRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.bcaway.app')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>Website</Text>
                  <Text style={[styles.linkTarget, { color: colors.textSecondary }]}>bcaway.app</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.linkRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.instagram.com/getbcaway/')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>Instagram</Text>
                  <Text style={[styles.linkTarget, { color: colors.textSecondary }]}>@getbcaway</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('https://github.com/bcaway')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>GitHub</Text>
                  <Text style={[styles.linkTarget, { color: colors.textSecondary }]}>github.com/bcaway</Text>
                </View>
                <Ionicons name="logo-github" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Support & Feedback */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Support & Feedback</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.linkRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.bcaway.app/requestteacher')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>Request Teacher</Text>
                  <Text style={[styles.linkTarget, { color: colors.textSecondary }]}>bcaway.app/requestteacher</Text>
                </View>
                <Ionicons name="person-add-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('mailto:support@bcaway.app')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>Contact Developer</Text>
                  <Text style={[styles.linkTarget, { color: colors.textSecondary }]}>support@bcaway.app</Text>
                </View>
                <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Legal & Disclaimers */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Legal & Disclaimers</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.linkRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.bcaway.app/privacy')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>Privacy Policy</Text>
                  <Text style={[styles.linkTarget, { color: colors.textSecondary }]}>bcaway.app/privacy</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => openLink('https://www.bcaway.app/terms')}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <Text style={[styles.linkLabel, { color: colors.textPrimary }]}>Terms & Disclaimers</Text>
                  <Text style={[styles.linkTarget, { color: colors.textSecondary }]}>bcaway.app/terms</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: App Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>App Information</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.metaRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.metaLabel, { color: colors.textPrimary }]}>Developer</Text>
                <Text style={[styles.metaValue, { color: colors.textSecondary }]}>Kabir Sekhon</Text>
              </View>

              <View style={[styles.metaRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.metaLabel, { color: colors.textPrimary }]}>License</Text>
                <Text style={[styles.metaValue, { color: colors.textSecondary }]}>AGPL v3.0</Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.textPrimary }]}>Version</Text>
                <Text style={[styles.metaValue, { color: colors.textSecondary }]}>{Constants.expoConfig?.version ?? '1.1.2'}</Text>
              </View>
            </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  wrapper: {
    width: '100%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  container: {
    flex: 1,
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  cardGroup: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  themeSelectorRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 13,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  linkLeft: {
    flex: 1,
    paddingRight: 12,
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  linkTarget: {
    fontSize: 12,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  metaLabel: {
    fontSize: 15,
    fontWeight: '400',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '400',
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    paddingHorizontal: 16,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '500',
  },
  starredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    paddingHorizontal: 16,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  starredLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  starBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  starredTextContainer: {
    flex: 1,
  },
  starredTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
});
