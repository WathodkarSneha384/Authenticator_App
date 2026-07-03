import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator, StatusBar, StyleSheet } from 'react-native';
import Logo from './Logo';
import { colors } from '../theme/colors';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View pointerEvents="none" style={styles.glowWrap}>
        <View style={styles.glow} />
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.logoBlock, { opacity: fade, transform: [{ scale }] }]}>
          <Logo size={130} />
          <Text style={styles.title}>DM Authenticator</Text>
          <View style={styles.accentBar} />
          <Text style={styles.tagline}>Secure offline authentication</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator color={colors.accentLight} />
        <Text style={styles.footerText}>Powered by datavision</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  glowWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.accent,
    opacity: 0.12,
    marginBottom: 120,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 72,
  },
  logoBlock: {
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '700',
    marginTop: 36,
  },
  accentBar: {
    height: 4,
    width: 48,
    borderRadius: 999,
    backgroundColor: colors.accent,
    marginTop: 16,
  },
  tagline: {
    color: colors.accentLight,
    fontSize: 14,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginTop: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
