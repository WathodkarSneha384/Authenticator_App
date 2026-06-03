import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loginStep2 } from '../services/api';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'OtpVerify'> };

export default function OtpVerifyScreen({ navigation }: Props) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { preAuthToken, setSession } = useAuthStore();

  async function verify() {
    if (!preAuthToken) { Alert.alert('Error', 'Session expired. Please login again.'); return; }
    setLoading(true);
    try {
      const res = await loginStep2(preAuthToken, token);
      setSession(res.sessionToken, '');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e: any) {
      Alert.alert('Verification Failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-surface justify-center px-6">
      <Text className="text-2xl font-bold text-primary mb-2">Mobile Token</Text>
      <Text className="text-gray-500 mb-8">
        Open the Token screen, generate your 6-digit token and enter it below.
      </Text>

      <TouchableOpacity
        className="bg-accent rounded-xl py-3 items-center mb-6"
        onPress={() => navigation.navigate('Token')}
      >
        <Text className="text-white font-bold">Open Token Generator</Text>
      </TouchableOpacity>

      <Text className="text-sm font-semibold text-gray-700 mb-1">Enter Token</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 text-center text-2xl tracking-widest"
        value={token}
        onChangeText={setToken}
        placeholder="000000"
        keyboardType="numeric"
        maxLength={8}
      />

      <TouchableOpacity className="bg-primary rounded-xl py-4 items-center" onPress={verify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Verify & Login</Text>}
      </TouchableOpacity>
    </View>
  );
}
