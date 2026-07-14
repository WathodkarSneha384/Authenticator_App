/**
 * SmsOtpScreen — Step 2
 * 6-digit numeric OTP · 180 s countdown · Resend button  FR-005→FR-009
 */
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { validateOtp, validateUser } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Logo from '../components/Logo';
import { appAlert, appAlertError, appAlertSuccess } from '../store/alertStore';
import { getApiErrorMessage } from '../utils/apiError';
import { colors } from '../theme/colors';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'SmsOtp'> };

const OTP_TTL = 180;

export default function OtpVerifyScreen({ navigation }: Props) {
  const [otp, setOtp]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer]         = useState(OTP_TTL);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  const { userId, maskedMobile, completeRegistration } = useAuthStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'OTP Verification',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.headerBack}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => { startTimer(); return clearTimer; }, []);

  function startTimer() {
    setTimer(OTP_TTL);
    clearTimer();
    timerRef.current = setInterval(() =>
      setTimer(t => { if (t <= 1) { clearTimer(); return 0; } return t - 1; }), 1000);
  }
  function clearTimer() { if (timerRef.current) clearInterval(timerRef.current); }

  const mm = Math.floor(timer / 60).toString().padStart(2, '0');
  const ss = (timer % 60).toString().padStart(2, '0');

  async function handleSubmit() {
    if (otp.length !== 6) { appAlertError('Error', 'Please enter the 6-digit OTP.'); return; }
    if (timer === 0) { appAlertError('Expired', 'OTP has expired. Please request a new OTP.'); return; }

    setLoading(true);
    try {
      const res = await validateOtp(userId!, otp);
      console.log('OTP Validation Result:', res);

      if (res?.status == '00') {
        await completeRegistration(userId!, maskedMobile ?? res?.mobile ?? '', 'submitted');
        appAlertSuccess('Submitted', 'User Registration submitted successfully.', () => navigation.navigate('Register'));
      } else if (res?.status == '310') {
        appAlert('Alert', 'Invalid OTP, please try again.', undefined, 'error');
      } else if (res?.status == '422') {
        await completeRegistration(userId!, maskedMobile ?? res?.mobile ?? '', 'registered');
        appAlertSuccess('Submitted', res?.message || 'User is already registered.', () => navigation.navigate('Register'));
      }
    } catch (e: unknown) {
      appAlertError('Error', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await validateUser(userId!);
      console.log('Validation Result:', res);

      await completeRegistration(
        userId!,
        maskedMobile ?? res.mobileNo ?? res.mobile ?? '',
        'otp_pending',
      );

      setOtp('');
      startTimer();

      if (res.devOtp) {
        appAlert('DEV — OTP', `OTP: ${res.devOtp}`, undefined, 'info');
      }
    } catch (e: unknown) {
      console.error('Validation Error:', e);
      appAlertError('Error', getApiErrorMessage(e));
    } finally {
      setResending(false);
    }
  }

  const canResend = timer === 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Logo size={84} />
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            {maskedMobile
              ? `OTP sent to ${maskedMobile}`
              : 'OTP sent to your registered mobile number.'}
          </Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={t => setOtp(t.replace(/[^0-9]/g, ''))}
            placeholder="000000"
            placeholderTextColor={colors.gray400}
            keyboardType="numeric"
            maxLength={6}
          />

          <View style={styles.timerBlock}>
            <Text style={[styles.timer, timer < 30 && styles.timerDanger]}>
              {mm}:{ss}
            </Text>
            <Text style={styles.timerLabel}>OTP expires in</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, (loading || timer === 0) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading || timer === 0}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.buttonText}>Submit</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendButton, canResend && styles.resendButtonActive]}
            onPress={handleResend}
            disabled={!canResend || resending}
            activeOpacity={0.85}
          >
            {resending
              ? <ActivityIndicator color={colors.accent} />
              : (
                <Text style={[styles.resendText, canResend && styles.resendTextActive]}>
                  Resend OTP {timer > 0 ? `(available in ${mm}:${ss})` : ''}
                </Text>
              )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 32,
    letterSpacing: 8,
    textAlign: 'center',
    color: colors.gray900,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  timerBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timer: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accentDark,
  },
  timerDanger: {
    color: colors.danger,
  },
  timerLabel: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  resendButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  resendButtonActive: {
    borderColor: colors.accent,
  },
  resendText: {
    fontWeight: '600',
    color: colors.gray400,
    fontSize: 14,
  },
  resendTextActive: {
    color: colors.accentDark,
  },
});
