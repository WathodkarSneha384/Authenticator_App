import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  userId: string | null;
  seed: string | null;
  sessionToken: string | null;
  preAuthToken: string | null;
  isRegistered: boolean;
  setPreAuthToken: (t: string) => void;
  setSession: (token: string, userId: string) => void;
  setSeed: (seed: string) => Promise<void>;
  loadSeed: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  seed: null,
  sessionToken: null,
  preAuthToken: null,
  isRegistered: false,

  setPreAuthToken: (preAuthToken) => set({ preAuthToken }),

  setSession: (sessionToken, userId) => set({ sessionToken, userId }),

  setSeed: async (seed) => {
    await AsyncStorage.setItem('totp_seed', seed);
    set({ seed, isRegistered: true });
  },

  loadSeed: async () => {
    const seed = await AsyncStorage.getItem('totp_seed');
    const userId = await AsyncStorage.getItem('user_id');
    if (seed) set({ seed, userId, isRegistered: true });
  },

  logout: () => set({ sessionToken: null, preAuthToken: null }),
}));
