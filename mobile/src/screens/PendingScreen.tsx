/**
 * PendingScreen — shown while waiting for Stage I / Stage II approval.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';
import { appAlertConfirm } from '../store/alertStore';
import { colors } from '../theme/colors';

export default function PendingScreen() {
  const { userId, reset } = useAuthStore();

  return (
    <View style={styles.container}>
      <Logo size={84} />
      <Text style={styles.emoji}>⏳</Text>
      <Text style={styles.title}>Pending Approval</Text>
      <Text style={styles.body}>Your registration is under review.</Text>
      <Text style={styles.meta}>
        User ID: <Text style={styles.metaBold}>{userId}</Text>
        {'\n'}You will receive a Registration Key on your mobile once approved.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Approval Steps</Text>
        <Text style={styles.infoItem}>1. Stage I approver reviews request</Text>
        <Text style={styles.infoItem}>2. Stage II approver gives final approval</Text>
        <Text style={styles.infoItem}>3. Registration Key sent to your mobile</Text>
        <Text style={styles.infoItem}>4. Enter key in app to complete setup</Text>
      </View>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => appAlertConfirm(
          'Reset',
          'This will clear your registration data. Are you sure?',
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
  emoji: {
    fontSize: 48,
    marginVertical: 20,
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
    marginBottom: 8,
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
