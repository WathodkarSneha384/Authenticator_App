import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';

export default function App() {
  const loadSeed = useAuthStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadSeed(); // restore seed from AsyncStorage on app start
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1B4F8A" />
      <RootNavigator />
    </>
  );
}
