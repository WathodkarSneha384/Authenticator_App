/**
 * SidTokenScreen — FR-011 FR-012
 * After registration: user enters SID (from CBS screen) → Token auto-generates.
 * This is the ONLY screen shown after successful registration.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Animated, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { generateToken } from '../utils/totp';
import Logo from '../components/Logo';
import { appAlertConfirm, appAlertError } from '../store/alertStore';
import { APP_VERSION, APP_VERSION_FULL } from '../constants/app';
import { colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SidTokenScreen() {
  const { userId, maskedMobile, reset, loadFromStorage } = useAuthStore();
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(userId);
  const [resolvedMobile, setResolvedMobile] = useState<string | null>(maskedMobile);
  const [sid, setSid] = useState('');
  const [token, setToken] = useState('');
  const [timer, setTimer] = useState(0);
  const [sidEntered, setSidEntered] = useState(false);
  const progress = useRef(new Animated.Value(1)).current;
  const currentMinuteRef = useRef(Math.floor(Date.now() / 60000));
  const tokenStartTimeRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      await loadFromStorage();
      const [storedUserId, storedMobile] = await Promise.all([
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('mobile'),
      ]);
      setResolvedUserId(storedUserId ?? userId);
      setResolvedMobile(storedMobile ?? maskedMobile);
    })();
  }, [loadFromStorage, userId, maskedMobile]);

  function handleEnterSid() {
    const id = sid.trim().toUpperCase();
    if (!id) {
      appAlertError('Error', 'Please enter the SID.');
      return;
    }
    if (!/^[A-Z0-9]{1,6}$/.test(id)) {
      appAlertError('Error', 'SID must be alphanumeric and max 6 characters.');
      return;
    }
    if (!resolvedUserId || !resolvedMobile) {
      appAlertError('Error', 'User ID or mobile number is missing. Please register again.');
      return;
    }

    tokenStartTimeRef.current = Date.now();
    setSidEntered(true);
    refreshToken();
  }

  useEffect(() => {
    if (!sidEntered) return;

    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - tokenStartTimeRef.current) / 1000);
      const rem = Math.max(100 - elapsed, 0);

      setTimer(rem);
      progress.setValue(rem / 100);

      if (rem <= 0) {
        clearInterval(tick);
        setSidEntered(false);
        setSid('');
        setToken('');
        setTimer(0);
        return;
      }

      const currentMinute = Math.floor(Date.now() / 60000);
      if (currentMinute !== currentMinuteRef.current) {
        currentMinuteRef.current = currentMinute;
        refreshToken();
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [sidEntered]);

  function refreshToken() {
    if (!resolvedUserId || !resolvedMobile) return;
    const t = generateToken(resolvedUserId, resolvedMobile, sid);
    console.log('Generated Token:', t);
    setToken(t);
  }

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const barColor = timer > 10 ? colors.success : colors.danger;

  if (!sidEntered) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inner}>
          <View style={styles.header}>
            <Logo size={96} />
            <Text style={styles.title}>DM Authenticator</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardDesc}>
              Enter the SID displayed on your login screen to generate your token.
            </Text>
            <Text style={styles.sidLabel}>SID</Text>
            <TextInput
              style={styles.input}
              value={sid}
              onChangeText={(t) => setSid(t.toUpperCase())}
              maxLength={6}
              placeholder="Enter SID"
              placeholderTextColor={colors.gray400}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleEnterSid}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Generate Token</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>App version {APP_VERSION}</Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.tokenContainer}>
      <Logo size={64} />
      <Text style={styles.metaText}>
        SID: <Text style={styles.metaBold}>{sid}</Text>
      </Text>
      <Text style={[styles.metaText, styles.metaTextSpaced]}>
        User ID: <Text style={styles.metaBold}>{resolvedUserId}</Text>
      </Text>

      <View style={styles.tokenCard}>
        <Text style={styles.tokenLabel}>Your Token</Text>
        <Text style={styles.tokenValue}>{token}</Text>
        <Text style={styles.tokenHint}>Refreshes automatically</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: barWidth, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.timerText}>Expires in {timer}s</Text>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => { setSidEntered(false); setSid(''); setToken(''); }}
      >
        <Text style={styles.outlineButtonText}>Enter New SID</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => appAlertConfirm(
          'Logout',
          'Clear registration from this device?',
          reset,
          'Clear',
          true,
        )}
      >
        <Text style={styles.clearText}>Clear Device Registration</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Token generated offline. Works without internet.
      </Text>
      <Text style={styles.version}>App version {APP_VERSION_FULL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  sidLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    letterSpacing: 4,
    textAlign: 'center',
    color: colors.gray900,
    backgroundColor: colors.surface,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  tokenContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  metaText: {
    fontSize: 18,
    color: colors.gray500,
    marginTop: 16,
  },
  metaTextSpaced: {
    marginTop: 4,
    marginBottom: 24,
  },
  metaBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  tokenCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    borderTopWidth: 4,
    borderTopColor: colors.accent,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tokenLabel: {
    fontSize: 12,
    color: colors.gray400,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tokenValue: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 6,
    color: colors.accentDark,
  },
  tokenHint: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 12,
  },
  progressTrack: {
    width: '100%',
    backgroundColor: colors.gray200,
    borderRadius: 999,
    height: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  timerText: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 32,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  outlineButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  clearText: {
    color: colors.gray400,
    fontSize: 14,
  },
  footer: {
    fontSize: 16,
    color: colors.gray400,
    marginTop: 24,
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 16,
    textAlign: 'center',
  },
});
