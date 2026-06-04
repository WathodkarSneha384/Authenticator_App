/**
 * PendingScreen — shown while waiting for Stage I / Stage II approval.
 */
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';

export default function PendingScreen() {
  const { userId, reset } = useAuthStore();

  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
      <Text className="text-5xl mb-6">⏳</Text>
      <Text className="text-2xl font-bold text-primary mb-3">Pending Approval</Text>
      <Text className="text-gray-600 text-center mb-2">
        Your registration is under review.
      </Text>
      <Text className="text-gray-500 text-center text-sm mb-8">
        User ID: <Text className="font-bold text-primary">{userId}</Text>
        {'\n'}You will receive a Registration Key on your mobile once approved.
      </Text>

      <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full mb-8">
        <Text className="text-amber-800 font-semibold mb-2">Approval Steps</Text>
        <Text className="text-amber-700 text-sm">1. Stage I approver reviews request</Text>
        <Text className="text-amber-700 text-sm">2. Stage II approver gives final approval</Text>
        <Text className="text-amber-700 text-sm">3. Registration Key sent to your mobile</Text>
        <Text className="text-amber-700 text-sm">4. Enter key in app to complete setup</Text>
      </View>

      <TouchableOpacity
        className="border border-danger rounded-xl py-3 px-6"
        onPress={() =>
          Alert.alert('Reset', 'This will clear your registration data. Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reset', style: 'destructive', onPress: reset },
          ])
        }
      >
        <Text className="text-danger font-semibold">Start Over</Text>
      </TouchableOpacity>
    </View>
  );
}
