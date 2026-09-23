import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, isBergenEmail } from '../src/context/AuthContext';
import { BCAwayLogo } from '../src/components/common/BCAwayLogo';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, sendMagicLink } = useAuth();

  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

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
      setResendCooldown(30);
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
      setResendCooldown(30);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleBackToEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setErrorMessage(null);
    setStep('email');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
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
            <BCAwayLogo width={54} color="#2563EB" />
            <Text style={styles.title}>
              {step === 'email' ? 'Sign in to BCAway' : 'Check your email'}
            </Text>
            {step === 'sent' && (
              <Text style={styles.subtitle}>
                Tap the confirmation link sent to {email} to sign in to BCAway.
              </Text>
            )}
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" style={styles.errorIcon} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Form Content */}
          {step === 'email' ? (
            <View style={styles.form}>
              <Text style={styles.inputLabel}>SCHOOL EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="student30@bergen.org"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="go"
                  onSubmitEditing={handleSendLink}
                  editable={!isSubmitting}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleSendLink}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || isSubmitting}
                style={[styles.secondaryButton, (resendCooldown > 0 || isSubmitting) && styles.buttonDisabled]}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#0F172A" size="small" />
                ) : (
                  <Text style={styles.secondaryButtonText}>
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
                <Text style={styles.actionLinkText}>Use a different email</Text>
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
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
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
    color: '#B91C1C',
    fontWeight: '500',
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
    height: '100%',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
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
    color: '#2563EB',
  },
});
