import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, isBergenEmail, isBcawayEmail } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { BCAwayLogo } from '../src/components/common/BCAwayLogo';

const RESEND_COOLDOWN_SECONDS = 60;

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, sendMagicLink, signInWithPassword } = useAuth();
  const { colors } = useTheme();

  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const passwordInputRef = useRef<TextInput>(null);

  // Check if current input email is a @bcaway.app password user
  const isStaffAccount = isBcawayEmail(email);

  // If already authenticated, redirect to tabs
  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session, router]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendLink = async () => {
    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your school email address.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    // If an authorized @bcaway.app email was entered, redirect to password flow
    if (isBcawayEmail(cleanEmail)) {
      handlePasswordSignIn();
      return;
    }

    if (!isBergenEmail(cleanEmail)) {
      setErrorMessage('Only @bergen.org email addresses are authorized to access BCAway.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error } = await sendMagicLink(cleanEmail);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to send confirmation link. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('sent');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handlePasswordSignIn = async () => {
    setErrorMessage(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail) {
      setErrorMessage('Please enter your @bcaway.app email address.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (!isBcawayEmail(cleanEmail)) {
      setErrorMessage('Password sign-in is only available for @bcaway.app accounts.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your account password.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      passwordInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error } = await signInWithPassword(cleanEmail, cleanPassword);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid email or password. Please verify your credentials.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { error } = await sendMagicLink(email.trim().toLowerCase());
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to resend confirmation link.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleBackToEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMessage(null);
    setPassword('');
    setStep('email');
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't open URL", err));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 24) + 24,
            paddingBottom: Math.max(insets.bottom, 24) + 24,
            paddingLeft: Math.max(insets.left, 20),
            paddingRight: Math.max(insets.right, 20),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <BCAwayLogo width={54} color={colors.primary} />
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {step === 'email' ? 'Sign in to BCAway' : 'Check your email'}
            </Text>
            {step === 'sent' && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Tap the confirmation link sent to {email} to sign in to BCAway.
              </Text>
            )}
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: colors.absentBg, borderColor: colors.absentBorder }]}>
              <Ionicons name="alert-circle" size={16} color={colors.absent} style={styles.errorIcon} />
              <Text style={[styles.errorText, { color: colors.absentText }]}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Content */}
          {step === 'email' ? (
            <View style={styles.form}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                {isStaffAccount ? 'ACCOUNT EMAIL' : 'SCHOOL EMAIL'}
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="student30@bergen.org"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType={isStaffAccount ? 'next' : 'go'}
                  onSubmitEditing={() => {
                    if (isStaffAccount) {
                      passwordInputRef.current?.focus();
                    } else {
                      handleSendLink();
                    }
                  }}
                  editable={!isSubmitting}
                />
              </View>

              {/* Password Field: ONLY appears for @bcaway.app accounts */}
              {isStaffAccount && (
                <>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      ref={passwordInputRef}
                      style={[styles.input, { color: colors.textPrimary }]}
                      placeholder="Account password"
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="go"
                      onSubmitEditing={handlePasswordSignIn}
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(prev => !prev)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.eyeButton}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  (isSubmitting || (isStaffAccount && !password.trim())) && styles.buttonDisabled,
                ]}
                onPress={isStaffAccount ? handlePasswordSignIn : handleSendLink}
                disabled={isSubmitting || (isStaffAccount && !password.trim())}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : isStaffAccount ? (
                  <>
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>

              <Text style={[styles.legalNotice, { color: colors.textMuted }]}>
                By signing in, you agree to our{' '}
                <Text
                  style={[styles.legalLink, { color: colors.textSecondary }]}
                  onPress={() => openLink('https://bcaway.app/terms')}
                >
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text
                  style={[styles.legalLink, { color: colors.textSecondary }]}
                  onPress={() => openLink('https://bcaway.app/privacy')}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          ) : (
            <View style={styles.form}>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || isSubmitting}
                style={[
                  styles.secondaryButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  (resendCooldown > 0 || isSubmitting) && styles.buttonDisabled,
                ]}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.textPrimary} size="small" />
                ) : (
                  <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
                    {resendCooldown > 0 ? `Resend link (${resendCooldown}s)` : 'Resend link'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBackToEmail}
                disabled={isSubmitting}
                style={styles.textButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.actionLinkText, { color: colors.primary }]}>Use a different email</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 440,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  secondaryButton: {
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  legalNotice: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  legalLink: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
