import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

import RegisterScreen         from '../screens/RegisterScreen';
import OtpVerifyScreen        from '../screens/OtpVerifyScreen';
import PendingScreen          from '../screens/PendingScreen';
import RegistrationKeyScreen  from '../screens/HomeScreen';
import SidTokenScreen         from '../screens/TokenScreen';

export type RootStackParamList = {
  Register:        undefined;
  SmsOtp:          undefined;
  Pending:         undefined;
  RegistrationKey: undefined;
  SidToken:        undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HEADER = {
  headerStyle:      { backgroundColor: '#1B4F8A' },
  headerTintColor:  '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const },
};

export default function RootNavigator() {
  const { appStatus } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={HEADER}>

        {/* ── Fully registered: SID + Token only (FR-011) ── */}
        {appStatus === 'registered' && (
          <Stack.Screen
            name="SidToken"
            component={SidTokenScreen}
            options={{ title: 'CBS Token Generator', headerLeft: () => null }}
          />
        )}

        {/* ── Stage II approved: enter Registration Key ── */}
        {appStatus === 'stage2_approved' && (
          <Stack.Screen
            name="RegistrationKey"
            component={RegistrationKeyScreen}
            options={{ title: 'Registration Key', headerLeft: () => null }}
          />
        )}

        {/* ── Waiting for Stage I / II approval ── */}
        {(appStatus === 'submitted' || appStatus === 'stage1_approved') && (
          <Stack.Screen
            name="Pending"
            component={PendingScreen}
            options={{ title: 'Pending Approval', headerLeft: () => null }}
          />
        )}

        {/* ── OTP entry + sub-screens ── */}
        {appStatus === 'otp_pending' && (
          <>
            <Stack.Screen name="SmsOtp"          component={OtpVerifyScreen}       options={{ title: 'Verify OTP' }} />
            <Stack.Screen name="Pending"         component={PendingScreen}          options={{ title: 'Pending Approval' }} />
            <Stack.Screen name="RegistrationKey" component={RegistrationKeyScreen}  options={{ title: 'Registration Key' }} />
          </>
        )}

        {/* ── Default: first launch / unregistered ── */}
        {appStatus === 'unregistered' && (
          <>
            <Stack.Screen name="Register"        component={RegisterScreen}         options={{ title: 'CBS Authenticator', headerLeft: () => null }} />
            <Stack.Screen name="SmsOtp"          component={OtpVerifyScreen}        options={{ title: 'Verify OTP' }} />
            <Stack.Screen name="Pending"         component={PendingScreen}          options={{ title: 'Pending Approval' }} />
            <Stack.Screen name="RegistrationKey" component={RegistrationKeyScreen}  options={{ title: 'Registration Key' }} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
