/**
 * RegisterScreen — Step 1
 * User enters CBS User ID (max 10 alphanumeric). FR-001 FR-002 FR-003
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { validateUser } from '../services/api';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [userId, setUserId]   = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserId: storeId, setStatus, setMaskedMobile } = useAuthStore();

  async function handleRegister() {
    const id = userId.trim().toUpperCase();
    if (!id) { Alert.alert('Error', 'Please enter your User ID.'); return; }
    if (!/^[A-Z0-9]{1,10}$/.test(id)) {
      Alert.alert('Error', 'User ID must be alphanumeric and max 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await validateUser(id);

      if (res.status === 'registered') { storeId(id); setStatus('registered'); return; }
      if (res.status === 'submitted' || res.status === 'stage1_approved') {
        Alert.alert('Pending Approval', 'User ID Pending for Approval.'); return;
      }
      if (res.status === 'stage2_approved') {
        storeId(id); setStatus('stage2_approved');
        navigation.navigate('RegistrationKey'); return;
      }
      if (res.status === 'rejected') { Alert.alert('Rejected', res.message); return; }

      // OTP sent
      storeId(id);
      setStatus('otp_pending');
      if (res.mobile) setMaskedMobile(res.mobile);

      if (res.devOtp) {
        Alert.alert('DEV — OTP', `OTP: ${res.devOtp}`, [{ text: 'OK', onPress: () => navigation.navigate('SmsOtp') }]);
      } else {
        navigation.navigate('SmsOtp');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">PA</Text>
          </View>
          <Text className="text-2xl font-bold text-primary">Proctor Auth</Text>
          <Text className="text-gray-500 mt-1">CBS Offline Authenticator</Text>
        </View>

        <Text className="text-sm font-semibold text-gray-700 mb-1">CBS User ID</Text>
        <TextInput
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 mb-1"
          value={userId}
          onChangeText={(t) => setUserId(t.toUpperCase())}
          placeholder="Enter User ID"
          autoCapitalize="characters"
          maxLength={10}
          autoCorrect={false}
        />
        <Text className="text-xs text-gray-400 mb-8">Max 10 alphanumeric characters</Text>

        <TouchableOpacity
          className={`bg-primary rounded-xl py-4 items-center ${loading ? 'opacity-60' : ''}`}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold text-base">Register</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
