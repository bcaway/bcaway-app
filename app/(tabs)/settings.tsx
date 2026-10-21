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

  const userEmail = user?.email || 'student@bergen.org';
  const isStaff = isBcawayEmail(userEmail);
  const userInitials = (userEmail.split('@')[0] || 'ST').slice(0, 2).toUpperCase();

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
          {/* Uber/DoorDash Style Header: Bold Title */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
          </View>

          {/* User Identity Profile Card (Uber Account Tab pattern) */}
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>{userInitials}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.profileEmail, { color: colors.textPrimary }]} numberOfLines={1}>
                {userEmail}
              </Text>
              <View style={styles.badgeRow}>
                <View style={[styles.roleBadge, { backgroundColor: colors.primarySubtle }]}>
                  <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                    {isStaff ? 'BCAway Staff' : 'BCA Student'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

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
                          backgroundColor: isActive ? colors.primarySubtle : colors.surfaceSubtle,
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

          {/* Section: My Teachers */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>My Teachers</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/starred-teachers' as any);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.starBg }]}>
                    <Ionicons name="star" size={16} color={colors.star} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Starred Faculty</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Online & Community */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Community</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.menuRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.bcaway.app')}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                    <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Website</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.instagram.com/getbcaway/')}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                    <Ionicons name="logo-instagram" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Instagram</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => openLink('https://github.com/bcaway')}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                    <Ionicons name="logo-github" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>GitHub</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Support & Feedback */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Support</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.menuRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.bcaway.app/requestteacher')}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                    <Ionicons name="person-add-outline" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Request Teacher</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => openLink('mailto:support@bcaway.app')}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                    <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>Contact Developer</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section: Legal */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>Legal</Text>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.menuRow, { borderBottomColor: colors.border }]}
                onPress={() => openLink('https://www.bcaway.app/privacy')}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Text style={[styles.menuTitlePlain, { color: colors.textPrimary }]}>Privacy Policy</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuRow}
                onPress={() => openLink('https://www.bcaway.app/terms')}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <Text style={[styles.menuTitlePlain, { color: colors.textPrimary }]}>Terms & Disclaimers</Text>
                </View>
                <Ionicons name="open-outline" size={15} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Card Button */}
          <View style={styles.section}>
            <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="log-out-outline"
                  size={17}
                  color={colors.absent}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.signOutText, { color: colors.absent }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info Footer (Uber / DoorDash style) */}
          <View style={styles.footerContainer}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              BCAway {Constants.expoConfig?.version ?? '1.1.2'} · Kabir Sekhon
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  cardGroup: {
    borderRadius: 14,
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Platform.OS === 'android' ? 14 : 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: Platform.OS === 'android' ? 48 : 44,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuTitlePlain: {
    fontSize: 15,
    fontWeight: '500',
    paddingLeft: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
