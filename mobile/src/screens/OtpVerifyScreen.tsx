/**
 * SmsOtpScreen — Step 2
 * 6-digit numeric OTP, 180s countdown, Resend button. FR-005 to FR-009
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

  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, []);

  function startTimer() {
    setTimer(OTP_TTL);
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearTimer(); return 0; } return t - 1; });
    }, 1000);
  }

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const mm = Math.floor(timer / 60).toString().padStart(2, '0');
  const ss = (timer % 60).toString().padStart(2, '0');

  async function handleSubmit() {
    if (otp.length !== 6) { Alert.alert('Error', 'Please enter the 6-digit OTP.'); return; }
    if (timer === 0)       { Alert.alert('OTP Expired', 'OTP has expired. Please request a new OTP.'); return; }

    setLoading(true);
    try {
      const res = await validateOtp(userId!, otp);
      setStatus('submitted');
      // FR-004
      Alert.alert('Success', 'User Registration submitted successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Pending') },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await resendOtp(userId!);
      setOtp('');
      startTimer();
      if (res.devOtp) {
        Alert.alert('DEV — New OTP', `OTP: ${res.devOtp}`);
      } else {
        Alert.alert('OTP Sent', 'A new OTP has been sent to your registered mobile number.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally { setResending(false); }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-primary mb-2">Enter OTP</Text>
        {maskedMobile && (
          <Text className="text-gray-500 mb-8">OTP sent to {maskedMobile}</Text>
        )}

        {/* OTP Input — FR-005 FR-006 */}
        <TextInput
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-3xl tracking-widest text-gray-900 mb-4"
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, ''))}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
        />

        {/* Countdown timer — FR-008 */}
        <View className="items-center mb-6">
          <Text className={`text-lg font-bold ${timer < 30 ? 'text-danger' : 'text-primary'}`}>
            {mm}:{ss}
          </Text>
          <Text className="text-xs text-gray-400">OTP expires in</Text>
        </View>

        {/* Submit — FR-007 */}
        <TouchableOpacity
          className={`bg-primary rounded-xl py-4 items-center mb-4 ${loading ? 'opacity-60' : ''}`}
          onPress={handleSubmit}
          disabled={loading || timer === 0}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold text-base">Submit</Text>}
        </TouchableOpacity>

        {/* Resend OTP — FR-009: enabled after 180s (timer === 0) */}
        <TouchableOpacity
          className={`rounded-xl py-3 items-center border ${timer === 0 ? 'border-primary' : 'border-gray-200'}`}
          onPress={handleResend}
          disabled={timer > 0 || resending}
        >
          {resending
            ? <ActivityIndicator color="#1B4F8A" />
            : <Text className={`font-semibold ${timer === 0 ? 'text-primary' : 'text-gray-300'}`}>
                Resend OTP {timer > 0 ? `(${mm}:${ss})` : ''}
              </Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
