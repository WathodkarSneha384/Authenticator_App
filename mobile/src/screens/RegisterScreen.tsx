/**
 * RegisterScreen — Step 1
 * User enters CBS User ID (max 10 alphanumeric). FR-001 FR-002 FR-003
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { validateUser } from '../services/api';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { appAlert, appAlertError, appAlertSuccess } from '../store/alertStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [userId, setUserId]   = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserId: storeId, setStatus, setMaskedMobile,completeRegistration, userId: storedUserId, appStatus } = useAuthStore();

  // Once the registration has been submitted (after OTP verification), the
  // User ID is locked: pre-fill it from the store/storage and prevent editing
  // so the user cannot register a different User ID.
  const isUserIdLocked = appStatus === 'submitted';

  useEffect(() => {
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, [storedUserId]);

  async function handleRegister() {
    
    const id = userId.trim().toUpperCase();
    if (!id) { appAlertError('Error', 'Please enter your User ID.'); return; }
    if (!/^[A-Z0-9]{1,10}$/.test(id)) {
      appAlertError('Error', 'User ID must be alphanumeric and max 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await validateUser(id);
      console.log('Validation Result:', res);

      // if (res.status === 'registered') { storeId(id); setStatus('registered'); return; }
      // if (res.status === 'submitted' || res.status === 'stage1_approved') {
      //   Alert.alert('Pending Approval', 'User ID Pending for Approval.'); return;
      // }
      // if (res.status === 'stage2_approved') {
      //   storeId(id); setStatus('stage2_approved');
      //   navigation.navigate('RegistrationKey'); return;
      // }
      // if (res.status === 'rejected') { Alert.alert('Rejected', res.message); return; }

      // OTP sent
      if(res?.errorCode == '00'){
      await completeRegistration(id, res.mobileNo ?? res.mobile ?? '', 'otp_pending');

      if (res.devOtp) {
        appAlert('DEV — OTP', `OTP: ${res.devOtp}`, [{ text: 'OK', onPress: () => navigation.navigate('SmsOtp') }], 'info');
      } else {
        navigation.navigate('SmsOtp');
      }
    }else if(res?.errorCode == '421'){
      await completeRegistration(userId,res?.mobileNo ?? res?.mobile,'submitted');
      appAlert('Alert', res?.errorMsg || 'User is pending for Approval.', undefined, 'warning');
      
    }else if(res?.errorCode == '422'){
      console.log('in errorcode 422');
      setStatus('registered');
      const mobile = await AsyncStorage.getItem('mobile');
      console.log('Mobile:', mobile);
      const status = await AsyncStorage.getItem('status');
      console.log('Status:', status);
      await completeRegistration(userId,mobile!,'registered');
      const status1 = await AsyncStorage.getItem('status');
      console.log('Status1:', status1);
       appAlertSuccess('Alert', res?.errorMsg || 'User is registered successfully.', () => navigation.navigate('SidToken'));
    }
    else{
      appAlertError('Error', res?.errorMsg || 'An error occurred while validating the User ID.');
    }
    } catch (e: any) {
      console.error('Validation Error:', e);
      appAlertError('Error', e?.response?.data?.error || e.message);
    } finally { setLoading(false); }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-surface" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View className="flex-1 justify-center px-6">

        {/* Brand header */}
        <View className="items-center mb-10">
          <Logo size={104} />
          <Text className="text-2xl font-bold text-primary mt-5">DM Authenticator</Text>
          <Text className="text-gray-500 mt-1">Secure offline authentication</Text>
        </View>

        {/* Form card */}
        <View className="bg-white rounded-2xl px-5 pt-6 pb-7 shadow-md">
          <Text className="text-lg font-bold text-primary mb-1">Get started</Text>
          <Text className="text-gray-500 text-sm mb-5">
            Enter your CBS User ID to begin registration.
          </Text>

          <Text className="text-sm font-semibold text-gray-700 mb-1">User ID</Text>
          <TextInput
            className={`border-2 rounded-xl px-4 py-3 text-lg mb-1 ${isUserIdLocked ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-surface border-gray-200 text-gray-900'}`}
            value={userId}
            onChangeText={(t) => setUserId(t.toUpperCase())}
            placeholder="Enter User ID"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            maxLength={10}
            autoCorrect={false}
            editable={!isUserIdLocked}
          />
          <Text className="text-xs text-gray-400 mb-6">
            {isUserIdLocked ? 'Your registration is submitted for this User ID.' : 'Max 10 alphanumeric characters'}
          </Text>

          <TouchableOpacity
            className={`bg-primary rounded-xl py-4 items-center shadow-sm ${loading ? 'opacity-60' : ''}`}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className="text-white font-bold text-base">Register</Text>}
          </TouchableOpacity>
        </View>

        <Text className="text-center text-xs text-gray-400 mt-8">
          Protected by datavision
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
