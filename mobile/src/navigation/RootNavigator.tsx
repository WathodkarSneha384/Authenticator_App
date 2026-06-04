import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

import RegisterScreen       from '../screens/RegisterScreen';
import OtpVerifyScreen      from '../screens/OtpVerifyScreen';   // SmsOtp
import PendingScreen        from '../screens/PendingScreen';
import HomeScreen           from '../screens/HomeScreen';         // RegistrationKey
import TokenScreen          from '../screens/TokenScreen';        // SidToken

export type RootStackParamList = {
  Register:        undefined;
  SmsOtp:          undefined;
  Pending:         undefined;
  RegistrationKey: undefined;
  SidToken:        undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const HEADER = {
  headerStyle: { backgroundColor: '#1B4F8A' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' as const },
};

export default function RootNavigator() {
  const { appStatus } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={HEADER}>

        {/* FR-011: After registration → SID/Token window only */}
        {appStatus === 'registered' ? (
          <Stack.Screen name="SidToken" component={TokenScreen} options={{ title: 'CBS Token', headerLeft: () => null }} />

        ) : appStatus === 'stage2_approved' ? (
          <Stack.Screen name="RegistrationKey" component={HomeScreen} options={{ title: 'Enter Registration Key', headerLeft: () => null }} />

        ) : appStatus === 'submitted' || appStatus === 'stage1_approved' ? (
          <Stack.Screen name="Pending" component={PendingScreen} options={{ title: 'Registration Pending', headerLeft: () => null }} />

        ) : appStatus === 'otp_pending' ? (
          <>
            <Stack.Screen name="SmsOtp"   component={OtpVerifyScreen} options={{ title: 'Verify OTP' }} />
            <Stack.Screen name="Pending"  component={PendingScreen}   options={{ title: 'Registration Pending' }} />
          </>

        ) : (
          /* unregistered — default */
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'CBS Authenticator', headerLeft: () => null }} />
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
