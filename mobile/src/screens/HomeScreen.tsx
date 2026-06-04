/**
 * RegistrationKeyScreen — Step 3
 * After Stage II approval, user enters Registration Key received via SMS.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { submitRegistrationKey } from '../services/api';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'RegistrationKey'> };

export default function RegistrationKeyScreen({ navigation }: Props) {
  const [key, setKey]         = useState('');
  const [loading, setLoading] = useState(false);
  const { userId, completeRegistration } = useAuthStore();

  async function handleSubmit() {
    if (!key.trim()) { Alert.alert('Error', 'Please enter the Registration Key.'); return; }
    setLoading(true);
    try {
      const res = await submitRegistrationKey(userId!, key.trim());
      await completeRegistration(res.seed, res.userId);
      // Navigation handled automatically by RootNavigator watching appStatus
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-success rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl">🔑</Text>
          </View>
          <Text className="text-2xl font-bold text-primary">Registration Key</Text>
          <Text className="text-gray-500 mt-1 text-center">
            Enter the Registration Key sent to your registered mobile number.
          </Text>
        </View>

        <Text className="text-sm font-semibold text-gray-700 mb-1">Registration Key</Text>
        <TextInput
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-2xl tracking-widest text-gray-900 mb-8"
          value={key}
          onChangeText={(t) => setKey(t.toUpperCase())}
          placeholder="XXXX0000"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
        />

        <TouchableOpacity
          className={`bg-success rounded-xl py-4 items-center ${loading ? 'opacity-60' : ''}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text className="text-white font-bold text-base">Complete Registration</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
