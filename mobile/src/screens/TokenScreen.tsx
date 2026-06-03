import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAuthStore } from '../store/authStore';
import { generateToken, remainingSeconds } from '../utils/totp';

export default function TokenScreen() {
  const seed = useAuthStore((s) => s.seed);
  const [token, setToken] = useState('------');
  const [remaining, setRemaining] = useState(30);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!seed) return;

    function refresh() {
      const secs = remainingSeconds();
      setRemaining(secs);
      setToken(generateToken(seed!));

      progress.setValue(secs / 30);
      Animated.timing(progress, {
        toValue: 0,
        duration: secs * 1000,
        useNativeDriver: false,
      }).start();
    }

    refresh();
    const id = setInterval(refresh, 30000 - ((Date.now() / 1000) % 30) * 1000 % 30000 || 30000);
    const tick = setInterval(() => setRemaining(remainingSeconds()), 1000);

    return () => { clearInterval(id); clearInterval(tick); };
  }, [seed]);

  if (!seed) {
    return (
      <View className="flex-1 bg-surface items-center justify-center px-6">
        <Text className="text-gray-500 text-center">
          No seed registered on this device. Complete registration and wait for admin approval.
        </Text>
      </View>
    );
  }

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const barColor = remaining > 10 ? '#22C55E' : '#EF4444';

  function copyToken() {
    Clipboard.setString(token);
    Alert.alert('Copied', 'Token copied to clipboard');
  }

  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
      <Text className="text-gray-500 mb-2 text-sm">Current Token</Text>

      <TouchableOpacity onPress={copyToken} className="bg-white rounded-2xl px-10 py-6 shadow-md items-center mb-4">
        <Text className="text-5xl font-bold tracking-widest text-primary">{token}</Text>
        <Text className="text-xs text-gray-400 mt-2">Tap to copy</Text>
      </TouchableOpacity>

      <View className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
        <Animated.View style={{ width: barWidth, backgroundColor: barColor, height: '100%', borderRadius: 999 }} />
      </View>
      <Text className="text-gray-500 text-sm">Expires in {remaining}s</Text>

      <Text className="text-xs text-gray-400 mt-8 text-center">
        Token generated offline using your registered seed.{'\n'}Works without internet.
      </Text>
    </View>
  );
}
