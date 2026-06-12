/**
 * SidTokenScreen — FR-011 FR-012
 * After registration: user enters SID (from CBS screen) → Token auto-generates.
 * This is the ONLY screen shown after successful registration.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { generateToken, remainingSeconds } from '../utils/totp';
import Logo from '../components/Logo';
import { appAlert, appAlertConfirm, appAlertError } from '../store/alertStore';

export default function SidTokenScreen() {
  const { seed, userId, reset } = useAuthStore();
  const [sid, setSid]           = useState('');
  const [token, setToken]       = useState('');
  const [timer, setTimer]       = useState(0);
  const [sidEntered, setSidEntered] = useState(false);
  const progress                = useRef(new Animated.Value(1)).current;
  const animRef                 = useRef<Animated.CompositeAnimation | null>(null);
  const currentMinuteRef = useRef(Math.floor(Date.now() / 60000));
  const sidTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenStartTimeRef = useRef<number>(0);
  

  // FR-012: auto-generate token when SID is entered
  // function handleEnterSid() {
  //   console.log('Entered SID:', sid);
  //   if (!sid.trim()) { Alert.alert('Error', 'Please enter the SID.'); return; }
  //   // if (!seed) return;
  //   setSidEntered(true);
  //   refreshToken();
  // }
  
function handleEnterSid() {
  // if (!sid.trim()) {
  //   Alert.alert('Error', 'Please enter the SID.');
  //   return;
  // }
   const id = sid.trim().toUpperCase();
      if (!id) { appAlertError('Error', 'Please enter your User ID.'); return; }
      if (!/^[A-Z0-9]{1,10}$/.test(id)) {
        appAlertError('Error', 'SID must be alphanumeric and max 6 characters.');
        return;
      }

  tokenStartTimeRef.current = Date.now();

  setSidEntered(true);
  refreshToken();
}

useEffect(() => {
  if (!sidEntered) return;

  const tick = setInterval(() => {
    const elapsed = Math.floor(
      (Date.now() - tokenStartTimeRef.current) / 1000
    );

    const rem = Math.max(100 - elapsed, 0);

    setTimer(rem);

    progress.setValue(rem / 100);

    if (rem <= 0) {
      clearInterval(tick);

      setSidEntered(false);
      setSid('');
      setToken('');
      setTimer(0);

      return;
    }

    const currentMinute = Math.floor(Date.now() / 60000);

    if (currentMinute !== currentMinuteRef.current) {
      currentMinuteRef.current = currentMinute;
      refreshToken();
    }
  }, 1000);

  return () => clearInterval(tick);
}, [sidEntered]);

  // function refreshToken() {
  //   console.log('Infunction generate token0');
  //   const t   = generateToken(sid!);
  //   console.log('Generated Token:', t);
  //   const rem = remainingSeconds();
  //   setToken(t);
  //   setTimer(rem);
  //   progress.setValue(rem / 120);
  //   if (animRef.current) animRef.current.stop();
  //   animRef.current = Animated.timing(progress, {
  //     toValue: 0, duration: rem * 1000, useNativeDriver: false,
  //   });
  //   animRef.current.start();
  // }


  function refreshToken() {
  console.log('In function generate token');

  const t = generateToken(sid);
  console.log('Generated Token:', t);

  setToken(t);
}

  // useEffect(() => {
  //   if (!sidEntered) return;
  //   const tick = setInterval(() => {
  //     const rem = remainingSeconds();
  //     setTimer(rem);
  //     if (rem === 60) refreshToken(); // new 60-s window
  //   }, 1000);
  //   return () => clearInterval(tick);
  // }, [sidEntered]);


//  useEffect(() => {
//   if (!sidEntered) return;

//   const tick = setInterval(() => {
//     const rem = remainingSeconds();
//     setTimer(rem);

//     const currentMinute = Math.floor(Date.now() / 60000);

//     if (currentMinute !== currentMinuteRef.current) {
//       currentMinuteRef.current = currentMinute;
//       refreshToken();
//     }
//   }, 1000);

//   return () => clearInterval(tick);
// }, [sidEntered]);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const barColor = timer > 10 ? '#22C55E' : '#EF4444';

  if (!sidEntered) {
    return (
      <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-8">
            <Logo size={96} />
            <Text className="text-2xl font-bold text-primary mt-4">DM Authenticator</Text>
            <Text className="text-gray-500 mt-1 text-center">
              Enter the SID displayed on your login screen to generate your token.
            </Text>
          </View>

          <View className="bg-white rounded-2xl px-5 pt-6 pb-7 shadow-md">
            <Text className="text-sm font-semibold text-gray-700 mb-1">SID</Text>
            <TextInput
              className="bg-surface border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-2xl tracking-widest text-gray-900 mb-6"
              value={sid}
              onChangeText={setSid}
              maxLength={6}
              placeholder="Enter SID"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center shadow-sm"
              onPress={handleEnterSid}
              activeOpacity={0.85}
            >
              <Text className="text-white font-bold text-base">Generate Token</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View className="flex-1 bg-surface items-center justify-center px-6">
      <Logo size={64} />
      <Text className="text-gray-500 text-sm mt-4 mb-1">SID: <Text className="font-bold text-primary">{sid}</Text></Text>
      <Text className="text-gray-500 text-sm mb-6">User ID: <Text className="font-bold text-primary">{userId}</Text></Text>

      {/* Token display */}
      <View className="bg-white rounded-2xl px-10 py-8 shadow-md items-center mb-6 w-full border-t-4 border-accent">
        <Text className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Your Token</Text>
        <Text className="text-5xl font-bold tracking-widest text-accent-dark">{token}</Text>
        <Text className="text-xs text-gray-400 mt-3">Refreshes automatically</Text>
      </View>

      {/* Countdown bar */}
      <View className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
        <Animated.View style={{ width: barWidth, backgroundColor: barColor, height: '100%', borderRadius: 999 }} />
      </View>
      <Text className="text-gray-500 text-sm mb-8">Expires in {timer}s</Text>

      {/* Enter new SID */}
      <TouchableOpacity
        className="border border-primary rounded-xl py-3 px-8 mb-4"
        onPress={() => { setSidEntered(false); setSid(''); setToken(''); }}
      >
        <Text className="text-primary font-semibold">Enter New SID</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => appAlertConfirm(
        'Logout',
        'Clear registration from this device?',
        reset,
        'Clear',
        true,
      )}>
        <Text className="text-gray-400 text-sm">Clear Device Registration</Text>
      </TouchableOpacity>

      <Text className="text-xs text-gray-400 mt-6 text-center">
        Token generated offline. Works without internet.
      </Text>
    </View>
  );
}
