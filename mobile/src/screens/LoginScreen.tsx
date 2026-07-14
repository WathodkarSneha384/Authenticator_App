/**
 * LoginScreen — Shown after OTP verified, waiting for Stage I/II approval.
 * FR-010: If user tries to register again, system checks status and shows Pending.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { appAlertConfirm } from '../store/alertStore';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { userId, reset } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconEmoji}>⏳</Text>
      </View>
      <Text style={styles.title}>Registration Submitted</Text>
      <Text style={styles.body}>Your registration is pending admin approval.</Text>
      <Text style={styles.meta}>
        User ID: <Text style={styles.metaBold}>{userId}</Text>
        {'\n'}You will receive a Registration Key on your registered mobile number once approved.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <Text style={styles.infoItem}>1. Stage I approver reviews your request</Text>
        <Text style={styles.infoItem}>2. Stage II approver gives final approval</Text>
        <Text style={styles.infoItem}>3. Registration Key sent to your mobile</Text>
        <Text style={styles.infoItem}>4. Enter key in app to complete setup</Text>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => appAlertConfirm(
          'Reset',
          'This will clear your registration. Are you sure?',
          reset,
          'Reset',
          true,
        )}
      >
        <Text style={styles.resetText}>Start Over</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    color: colors.white,
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  metaBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  infoTitle: {
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoItem: {
    color: '#B45309',
    fontSize: 14,
    lineHeight: 22,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resetText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
});
