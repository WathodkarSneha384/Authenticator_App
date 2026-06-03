import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { registerUser } from '../services/api';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [form, setForm] = useState({ userId: '', mobile: '', fullName: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const update = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  async function submit() {
    if (form.password !== form.confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await registerUser({ userId: form.userId, mobile: form.mobile, fullName: form.fullName, password: form.password });
      Alert.alert(
        'Registration Submitted',
        'Your registration is pending admin approval. You will be able to log in once approved.',
        [{ text: 'OK' }]
      );
    } catch (e: any) {
      Alert.alert('Registration Failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 24 }}>
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-primary mt-4">Proctor Auth</Text>
        <Text className="text-gray-500 mt-1">CBS Offline Authenticator</Text>
      </View>

      <Label text="User ID (Employee / Customer ID)" />
      <Input value={form.userId} onChangeText={update('userId')} placeholder="Enter User ID" />

      <Label text="Full Name" />
      <Input value={form.fullName} onChangeText={update('fullName')} placeholder="Enter full name" />

      <Label text="Mobile Number" />
      <Input value={form.mobile} onChangeText={update('mobile')} placeholder="+91XXXXXXXXXX" keyboardType="phone-pad" />

      <Label text="Password" />
      <Input value={form.password} onChangeText={update('password')} placeholder="Min 8 characters" secureTextEntry />

      <Label text="Confirm Password" />
      <Input value={form.confirm} onChangeText={update('confirm')} placeholder="Re-enter password" secureTextEntry />

      <TouchableOpacity
        className="bg-primary rounded-xl py-4 mt-6 items-center"
        onPress={submit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Register Device</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Label({ text }: { text: string }) {
  return <Text className="text-sm font-semibold text-gray-700 mb-1 mt-4">{text}</Text>;
}

function Input({ value, onChangeText, placeholder, secureTextEntry, keyboardType }: any) {
  return (
    <TextInput
      className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  );
}
