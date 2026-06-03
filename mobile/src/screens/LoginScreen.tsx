import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { loginStep1 } from '../services/api';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setPreAuthToken = useAuthStore((s) => s.setPreAuthToken);

  async function login() {
    setLoading(true);
    try {
      const res = await loginStep1(userId, password);
      setPreAuthToken(res.preAuthToken);
      navigation.navigate('OtpVerify');
    } catch (e: any) {
      Alert.alert('Login Failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-surface justify-center px-6">
      <Text className="text-2xl font-bold text-primary mb-2">CBS Login</Text>
      <Text className="text-gray-500 mb-8">Enter your credentials to continue</Text>

      <Text className="text-sm font-semibold text-gray-700 mb-1">User ID</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-4"
        value={userId}
        onChangeText={setUserId}
        placeholder="Enter User ID"
        autoCapitalize="none"
      />

      <Text className="text-sm font-semibold text-gray-700 mb-1">Password</Text>
      <TextInput
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter Password"
        secureTextEntry
      />

      <TouchableOpacity className="bg-primary rounded-xl py-4 items-center" onPress={login} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity className="mt-4 items-center" onPress={() => navigation.navigate('Token')}>
        <Text className="text-primary-light">Generate Token (offline)</Text>
      </TouchableOpacity>
    </View>
  );
}
