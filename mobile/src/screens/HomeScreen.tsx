/**
 * RegistrationKeyScreen — Step 3
 * User enters the Registration Key received via SMS after Stage II approval.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { submitRegistrationKey } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function RegistrationKeyScreen() {
  const [key, setKey]         = useState('');
  const [loading, setLoading] = useState(false);
  const { userId, completeRegistration } = useAuthStore();

  async function handleSubmit() {
    if (!key.trim()) { Alert.alert('Error', 'Please enter the Registration Key.'); return; }
    setLoading(true);
    try {
      const res = await submitRegistrationKey(userId!, key.trim());
      //await completeRegistration(res.seed, res.userId);
      // RootNavigator auto-switches to SidToken when appStatus === 'registered'
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-surface"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-success rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl">🔑</Text>
          </View>
          <Text className="text-2xl font-bold text-primary">Registration Key</Text>
          <Text className="text-gray-500 mt-1 text-center">
            Enter the Registration Key sent to your registered mobile number.
          </Text>
        </View>

        {/* DEMO hint */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-6">
          <Text className="text-blue-700 text-xs font-semibold">DEMO MODE — Key is: DEMO1234</Text>
        </View>

        <Text className="text-sm font-semibold text-gray-700 mb-1">Registration Key</Text>
        <TextInput
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-2xl tracking-widest text-gray-900 mb-8"
          value={key}
          onChangeText={t => setKey(t.toUpperCase())}
          placeholder="DEMO1234"
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

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
