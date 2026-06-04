/**
 * SmsOtpScreen — Step 2
 * 6-digit numeric OTP · 180 s countdown · Resend button  FR-005→FR-009
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { validateOtp, resendOtp } from '../services/api';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'SmsOtp'> };

const OTP_TTL = 180;

export default function OtpVerifyScreen({ navigation }: Props) {
  const [otp, setOtp]             = useState('');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer]         = useState(OTP_TTL);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  const { userId, maskedMobile, setStatus } = useAuthStore();

  /* ── countdown ── */
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

  /* ── submit ── */
  async function handleSubmit() {
    if (otp.length !== 6) { Alert.alert('Error', 'Please enter the 6-digit OTP.'); return; }
    if (timer === 0)       { Alert.alert('Expired', 'OTP has expired. Please request a new OTP.'); return; }

    setLoading(true);
    try {
      const res = await validateOtp(userId!, otp);

      // Demo / fast-track: Stage II already approved → go straight to Registration Key
      if (res.status === 'stage2_approved') {
        setStatus('stage2_approved');
        const key = (res as any).devRegKey as string | undefined;
        Alert.alert(
          'Registration Submitted ✓',
          key
            ? `Demo Registration Key:\n\n${key}\n\nYou will need this in the next step.`
            : 'User Registration submitted successfully.\nYou will receive a Registration Key via SMS once approved.',
          [{ text: 'Continue', onPress: () => navigation.navigate('RegistrationKey') }],
        );
        return;
      }

      // Normal flow: wait for approval
      setStatus('submitted');
      Alert.alert('Submitted', 'User Registration submitted successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Pending') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  /* ── resend ── */
  async function handleResend() {
    setResending(true);
    try {
      const res = await resendOtp(userId!);
      setOtp('');
      startTimer();
      Alert.alert(
        'OTP Sent',
        res.devOtp
          ? `Demo OTP: ${res.devOtp}`
          : 'A new OTP has been sent to your registered mobile number.',
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally { setResending(false); }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 justify-center px-6">

        <Text className="text-2xl font-bold text-primary mb-2">Enter OTP</Text>
        <Text className="text-gray-500 mb-1">
          {maskedMobile ? `OTP sent to ${maskedMobile}` : 'OTP sent to your registered mobile number.'}
        </Text>

        {/* DEMO hint */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-6">
          <Text className="text-blue-700 text-xs font-semibold">DEMO MODE — OTP is: 123456</Text>
        </View>

        {/* OTP input — FR-005 FR-006 */}
        <TextInput
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-3xl tracking-widest text-gray-900 mb-4"
          value={otp}
          onChangeText={t => setOtp(t.replace(/[^0-9]/g, ''))}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
        />

        {/* Timer — FR-008 */}
        <View className="items-center mb-6">
          <Text className={`text-xl font-bold ${timer < 30 ? 'text-red-500' : 'text-primary'}`}>
            {mm}:{ss}
          </Text>
          <Text className="text-xs text-gray-400">OTP expires in</Text>
        </View>

        {/* Submit — FR-007 */}
        <TouchableOpacity
          className={`bg-primary rounded-xl py-4 items-center mb-4 ${(loading || timer === 0) ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={loading || timer === 0}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold text-base">Submit</Text>}
        </TouchableOpacity>

        {/* Resend — FR-009: enabled only after timer hits 0 */}
        <TouchableOpacity
          className={`rounded-xl py-3 items-center border ${timer === 0 ? 'border-primary' : 'border-gray-200'}`}
          onPress={handleResend}
          disabled={timer > 0 || resending}
        >
          {resending
            ? <ActivityIndicator color="#1B4F8A" />
            : <Text className={`font-semibold ${timer === 0 ? 'text-primary' : 'text-gray-300'}`}>
                Resend OTP {timer > 0 ? `(available in ${mm}:${ss})` : ''}
              </Text>}
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}
