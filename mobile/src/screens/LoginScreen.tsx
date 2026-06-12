/**
 * PendingScreen — Shown after OTP verified, waiting for Stage I/II approval.
 * FR-010: If user tries to register again, system checks status and shows Pending.
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { appAlertConfirm } from '../store/alertStore';

export default function PendingScreen() {
  const { userId, reset } = useAuthStore();

  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
      <View className="w-20 h-20 bg-accent rounded-full items-center justify-center mb-6">
        <Text className="text-white text-4xl">⏳</Text>
      </View>
      <Text className="text-2xl font-bold text-primary mb-3">Registration Submitted</Text>
      <Text className="text-gray-600 text-center mb-2">
        Your registration is pending admin approval.
      </Text>
      <Text className="text-gray-500 text-center text-sm mb-8">
        User ID: <Text className="font-bold text-primary">{userId}</Text>{'\n'}
        You will receive a Registration Key on your registered mobile number once approved.
      </Text>

      <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full mb-8">
        <Text className="text-amber-800 font-semibold mb-1">What happens next?</Text>
        <Text className="text-amber-700 text-sm">1. Stage I approver reviews your request</Text>
        <Text className="text-amber-700 text-sm">2. Stage II approver gives final approval</Text>
        <Text className="text-amber-700 text-sm">3. Registration Key sent to your mobile</Text>
        <Text className="text-amber-700 text-sm">4. Enter key in app to complete setup</Text>
      </View>

      <TouchableOpacity
        className="border border-danger rounded-xl py-3 px-6"
        onPress={() => appAlertConfirm(
          'Reset',
          'This will clear your registration. Are you sure?',
          reset,
          'Reset',
          true,
        )}
      >
        <Text className="text-danger font-semibold">Start Over</Text>
      </TouchableOpacity>
    </View>
  );
}
