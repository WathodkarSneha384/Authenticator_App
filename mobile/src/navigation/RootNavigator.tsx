import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';

import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import TokenScreen from '../screens/TokenScreen';
import HomeScreen from '../screens/HomeScreen';

export type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  OtpVerify: undefined;
  Token: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isRegistered, sessionToken } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1B4F8A' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isRegistered ? (
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register Device' }} />
        ) : !sessionToken ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'CBS Login' }} />
            <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: 'Mobile Token Verify' }} />
            <Stack.Screen name="Token" component={TokenScreen} options={{ title: 'Token' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CBS Authenticator' }} />
            <Stack.Screen name="Token" component={TokenScreen} options={{ title: 'Generate Token' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
