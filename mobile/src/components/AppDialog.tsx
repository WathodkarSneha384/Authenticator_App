import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAlertStore, AlertVariant } from '../store/alertStore';

const VARIANT_CONFIG: Record<
  AlertVariant,
  { icon: string; iconColor: string; iconBg: string; accent: string }
> = {
  error: {
    icon: 'close-circle',
    iconColor: '#EF4444',
    iconBg: '#FEF2F2',
    accent: '#EF4444',
  },
  success: {
    icon: 'checkmark-circle',
    iconColor: '#22C55E',
    iconBg: '#F0FDF4',
    accent: '#22C55E',
  },
  warning: {
    icon: 'alert-circle',
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    accent: '#D97706',
  },
  info: {
    icon: 'information-circle',
    iconColor: '#16A9C2',
    iconBg: '#ECFEFF',
    accent: '#16A9C2',
  },
  confirm: {
    icon: 'help-circle',
    iconColor: '#0F2C57',
    iconBg: '#F2F7FA',
    accent: '#0F2C57',
  },
};

/** Branded modal dialog — navy/teal theme matching the rest of the app. */
export default function AppDialog() {
  const { visible, title, message, variant, buttons, hideAlert } = useAlertStore();
  const config = VARIANT_CONFIG[variant];

  function handlePress(onPress?: () => void) {
    hideAlert();
    onPress?.();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hideAlert}>
      <Pressable style={styles.overlay} onPress={hideAlert}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Top accent stripe */}
          <View style={[styles.stripe, { backgroundColor: config.accent }]} />

          <View style={styles.body}>
            <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
              <Ionicons name={config.icon} size={36} color={config.iconColor} />
            </View>

            <Text style={styles.title}>{title}</Text>
            {!!message && <Text style={styles.message}>{message}</Text>}

            <View style={styles.actions}>
              {buttons.map((btn, i) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                const isPrimary = !isCancel && !isDestructive;

                return (
                  <TouchableOpacity
                    key={`${btn.text}-${i}`}
                    style={[
                      styles.btn,
                      isPrimary && styles.btnPrimary,
                      isCancel && styles.btnCancel,
                      isDestructive && styles.btnDestructive,
                      buttons.length === 1 && styles.btnFull,
                    ]}
                    onPress={() => handlePress(btn.onPress)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        isPrimary && styles.btnTextPrimary,
                        isCancel && styles.btnTextCancel,
                        isDestructive && styles.btnTextDestructive,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 44, 87, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F2C57',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  stripe: {
    height: 4,
    width: '100%',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F2C57',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFull: {
    flex: 1,
  },
  btnPrimary: {
    backgroundColor: '#0F2C57',
  },
  btnCancel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  btnDestructive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#FFFFFF',
  },
  btnTextCancel: {
    color: '#6B7280',
  },
  btnTextDestructive: {
    color: '#EF4444',
  },
});
