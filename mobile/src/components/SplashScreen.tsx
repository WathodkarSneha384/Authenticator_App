import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator, StatusBar } from 'react-native';
import Logo from './Logo';

/**
 * Flash / splash screen shown while the app restores its session.
 * Uses the brand navy background with the globe logo and teal accents.
 */
export default function SplashScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
    ]).start();
  }, [fade, scale]);

  return (
    <View className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#0F2C57" />

      {/* Teal glow — centered behind the logo */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: '#16A9C2',
            opacity: 0.12,
            marginBottom: 120,
          }}
        />
      </View>

      {/* Logo + title — vertically centered (offset for bottom footer) */}
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ paddingBottom: 72 }}
      >
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ scale }],
            alignItems: 'center',
          }}
        >
          <Logo size={130} />
          <Text
            className="text-white text-3xl font-bold"
            style={{ marginTop: 36 }}
          >
            DM Authenticator
          </Text>
          <View className="h-1 w-12 rounded-full bg-accent mt-4" />
          <Text className="text-accent-light text-sm mt-3 tracking-wide">
            Secure offline authentication
          </Text>
        </Animated.View>
      </View>

      <View className="absolute bottom-16 left-0 right-0 items-center">
        <ActivityIndicator color="#46C4D8" />
        <Text className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Powered by datavsnus
        </Text>
      </View>
    </View>
  );
}
