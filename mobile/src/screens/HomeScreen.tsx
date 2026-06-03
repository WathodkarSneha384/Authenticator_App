import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/authStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const { userId, logout } = useAuthStore();

  function confirmLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <View className="flex-1 bg-surface px-6 pt-8">
      <Text className="text-2xl font-bold text-primary">Welcome</Text>
      <Text className="text-gray-500 mb-8">{userId ?? 'User'}</Text>

      <Card
        title="Generate Token"
        description="Get your 6-digit TOTP for CBS login or transaction"
        color="bg-primary"
        onPress={() => navigation.navigate('Token')}
      />

      <Card
        title="Transaction Verify"
        description="Authorise insert / update / delete operations"
        color="bg-accent"
        onPress={() => navigation.navigate('Token')}
      />

      <View className="mt-auto mb-8">
        <TouchableOpacity className="border border-danger rounded-xl py-3 items-center" onPress={confirmLogout}>
          <Text className="text-danger font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Card({ title, description, color, onPress }: { title: string; description: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity className={`${color} rounded-2xl p-5 mb-4`} onPress={onPress}>
      <Text className="text-white text-lg font-bold">{title}</Text>
      <Text className="text-white opacity-80 mt-1 text-sm">{description}</Text>
    </TouchableOpacity>
  );
}
