import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

export type AppStatus =
  | 'unregistered'
  | 'otp_pending'
  | 'submitted'
  | 'stage1_approved'
  | 'stage2_approved'
  | 'registered';

const PERSISTED_STATUSES: AppStatus[] = [
  'otp_pending',
  'submitted',
  'stage1_approved',
  'stage2_approved',
  'registered',
];

function isPersistedStatus(status: string | null): status is AppStatus {
  return !!status && PERSISTED_STATUSES.includes(status as AppStatus);
}

interface AuthState {
  userId: string | null;
  seed: string | null;
  appStatus: AppStatus;
  maskedMobile: string | null;
  setUserId: (id: string) => void;
  setStatus: (status: AppStatus) => void;
  setMaskedMobile: (m: string) => void;
  completeRegistration: ( userId: string ,mobile: string,status: AppStatus) => Promise<void>;
  loadFromStorage: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  seed: null,
  appStatus: 'unregistered',
  maskedMobile: null,

  setUserId: (userId) => set({ userId }),
  setStatus: (appStatus) => set({ appStatus }),
  setMaskedMobile: (maskedMobile) => set({ maskedMobile }),
  
  completeRegistration: async (userId: string, maskedMobile: string, status: AppStatus) => {
    await AsyncStorage.multiSet([
      ['userId', userId],
      ['mobile', maskedMobile ?? ''],
      ['status', status],
    ]);
    set({ userId, appStatus: status, maskedMobile: maskedMobile || null });
  },

  loadFromStorage: async () => {
    const [seed, userId, status, mobile] = await Promise.all([
      AsyncStorage.getItem('seed'),
      AsyncStorage.getItem('userId'),
      AsyncStorage.getItem('status'),
      AsyncStorage.getItem('mobile'),
    ]);

    if (!userId || !isPersistedStatus(status)) {
      return;
    }

    set({
      userId,
      appStatus: status,
      maskedMobile: mobile,
      ...(seed ? { seed } : {}),
    });
  },

  reset: () => {
    AsyncStorage.multiRemove(['userId', 'mobile', 'status', 'seed']);
    set({ userId: null, seed: null, appStatus: 'unregistered', maskedMobile: null });
  },
}));
