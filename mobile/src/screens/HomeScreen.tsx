/**
 * RegistrationKeyScreen — Step 3
 * User enters the Registration Key received via SMS after Stage II approval.
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { submitRegistrationKey } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';
import { appAlertError } from '../store/alertStore';
import { colors } from '../theme/colors';

export default function RegistrationKeyScreen() {
  const [key, setKey]         = useState('');
  const [loading, setLoading] = useState(false);
  const { userId } = useAuthStore();

  async function handleSubmit() {
    if (!key.trim()) { appAlertError('Error', 'Please enter the Registration Key.'); return; }
    setLoading(true);
    try {
      await submitRegistrationKey(userId!, key.trim());
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      appAlertError('Error', err?.response?.data?.error || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Logo size={84} />
          <Text style={styles.title}>Registration Key</Text>
          <Text style={styles.subtitle}>
            Enter the Registration Key sent to your registered mobile number.
          </Text>
        </View>

        <View style={styles.demoBox}>
          <Text style={styles.demoText}>DEMO MODE — Key is: DEMO1234</Text>
        </View>

        <Text style={styles.label}>Registration Key</Text>
        <TextInput
          style={styles.input}
          value={key}
          onChangeText={t => setKey(t.toUpperCase())}
          placeholder="DEMO1234"
          placeholderTextColor={colors.gray400}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={8}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonText}>Complete Registration</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
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
  subtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 22,
  },
  demoBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  demoText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    letterSpacing: 4,
    textAlign: 'center',
    color: colors.gray900,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});
