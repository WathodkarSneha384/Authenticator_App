import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import SplashScreen from './src/components/SplashScreen';
import AppDialog from './src/components/AppDialog';
import { useAuthStore } from './src/store/authStore';

const SPLASH_MIN_MS = 1800;

export default function App() {
  const loadSeed = useAuthStore((s) => s.loadFromStorage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();

    (async () => {
      try {
        await loadSeed(); // restore session from AsyncStorage on app start
      } finally {
        // Keep the splash visible for a minimum, pleasant duration.
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(SPLASH_MIN_MS - elapsed, 0);
        setTimeout(() => setReady(true), wait);
      }
    })();
  }, [loadSeed]);

  if (!ready) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0F2C57" />
      <RootNavigator />
      <AppDialog />
    </>
  );
}
