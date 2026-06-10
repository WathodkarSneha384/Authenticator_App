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
  
  // completeRegistration: async (seed: string, userId: string, maskedMobile: string) => {
     completeRegistration: async ( userId: string, maskedMobile: string,status: AppStatus) => {
  //  await AsyncStorage.setItem('seed', seed);
    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem('mobile', maskedMobile);
    await AsyncStorage.setItem('status', status);
    set({  userId, appStatus: status, maskedMobile });
  },

  loadFromStorage: async () => {
    const seed   = await AsyncStorage.getItem('seed');
    const userId = await AsyncStorage.getItem('userId');
    const status = (await AsyncStorage.getItem('status')) as AppStatus | null;
    const mobile = await AsyncStorage.getItem('mobile');
    console.log("appStatus: " + status);
    console.log("seed: "+seed);
    console.log("userId: "+userId);
     if(mobile) set({ maskedMobile: mobile }); 
    //  seed && 
    if ( userId && status === 'registered') {
      console.log('User is fully registered. Restoring session...');
      set({  userId, appStatus: 'registered' });
    }
    const keys = await AsyncStorage.getAllKeys();
    console.log('Keys:', keys);
  },

  reset: () => {
    AsyncStorage.clear();
    set({ userId: null, seed: null, appStatus: 'unregistered', maskedMobile: null });
  },
}));
