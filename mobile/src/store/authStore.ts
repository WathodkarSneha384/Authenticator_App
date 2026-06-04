import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppStatus =
  | 'unregistered'
  | 'otp_pending'
  | 'submitted'
  | 'stage1_approved'
  | 'stage2_approved'
  | 'registered';

interface AuthState {
  userId: string | null;
  seed: string | null;
  appStatus: AppStatus;
  maskedMobile: string | null;
  setUserId: (id: string) => void;
  setStatus: (status: AppStatus) => void;
  setMaskedMobile: (m: string) => void;
  completeRegistration: (seed: string, userId: string) => Promise<void>;
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

  completeRegistration: async (seed, userId) => {
    await AsyncStorage.setItem('seed', seed);
    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem('status', 'registered');
    set({ seed, userId, appStatus: 'registered' });
  },

  loadFromStorage: async () => {
    const seed   = await AsyncStorage.getItem('seed');
    const userId = await AsyncStorage.getItem('userId');
    const status = (await AsyncStorage.getItem('status')) as AppStatus | null;
    if (seed && userId && status === 'registered') {
      set({ seed, userId, appStatus: 'registered' });
    }
  },

  reset: () => {
    AsyncStorage.clear();
    set({ userId: null, seed: null, appStatus: 'unregistered', maskedMobile: null });
  },
}));
