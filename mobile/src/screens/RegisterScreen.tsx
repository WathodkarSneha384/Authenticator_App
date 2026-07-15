/**

 * RegisterScreen — Step 1

 * User enters CBS User ID (max 10 alphanumeric). FR-001 FR-002 FR-003

 */

import React, { useState, useEffect } from 'react';

import {

  View, Text, TextInput, TouchableOpacity,

  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,

} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/RootNavigator';

import { validateUser } from '../services/api';

import { useAuthStore } from '../store/authStore';

import Logo from '../components/Logo';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { appAlert, appAlertError, appAlertSuccess, appAlertWarning } from '../store/alertStore';
import { APP_VERSION, APP_VERSION_FULL } from '../constants/app';
import { getApiErrorMessage } from '../utils/apiError';
import { colors } from '../theme/colors';



type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };



export default function RegisterScreen({ navigation }: Props) {

  const [userId, setUserId]     = useState('');

  const [password, setPassword] = useState('');

  const [loading, setLoading]   = useState(false);

  const { setStatus, completeRegistration, userId: storedUserId, maskedMobile, appStatus } = useAuthStore();



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

    if (!password.trim()) {

      appAlertError('Error', 'Please enter your Password.');

      return;

    }

    setLoading(true);

    try {

      const res = await validateUser(id, password);

      console.log('Validation Result:', res);



      if (res?.errorCode == '00') {

        await completeRegistration(id, res.mobileNo ?? res.mobile ?? '', 'otp_pending');

        if (res.devOtp) {

          appAlert('DEV — OTP', `OTP: ${res.devOtp}`, [{ text: 'OK', onPress: () => navigation.navigate('SmsOtp') }], 'info');

        } else {

          navigation.navigate('SmsOtp');

        }

      } else if (res?.errorCode == '421') {
        await completeRegistration(id, res?.mobileNo ?? res?.mobile ?? '', 'submitted');
      //  const mobile =  await AsyncStorage.getItem('mobile');
      //   console.log('Mobile from AsyncStorage:', mobile);
        appAlertWarning('Alert', res?.errorMsg || 'User is pending for Approval.');

      } else if (res?.errorCode == '422') {
        // const mobile =  await AsyncStorage.getItem('mobile');
        // console.log('Mobile from AsyncStorage:', mobile);
         await completeRegistration(id, res.mobileNo ?? res.mobile ?? '', 'registered');
        appAlertSuccess('Alert', res?.errorMsg || 'User is registered successfully.', () => navigation.navigate('SidToken'));

      } else {

        appAlertError('Error', res?.errorMsg || 'An error occurred while validating the User ID.');

      }

    } catch (e: unknown) {

      console.error('Validation Error:', e);

      appAlertError('Error', getApiErrorMessage(e));

    } finally {

      setLoading(false);

    }

  }



  return (

    <KeyboardAvoidingView

      style={styles.container}

      behavior={Platform.OS === 'ios' ? 'padding' : undefined}

    >

      <View style={styles.inner}>

        <View style={styles.header}>

          <Logo size={104} />

          <Text style={styles.title}>DM Authenticator</Text>

          <Text style={styles.subtitle}>Secure offline authentication</Text>

        </View>



        <View style={styles.card}>

          <Text style={styles.cardTitle}>Get started</Text>

          <Text style={styles.cardDesc}>

            Enter your CBS User ID to begin registration.

          </Text>



          <Text style={styles.label}>User ID</Text>

          <TextInput

            style={[styles.input, isUserIdLocked && styles.inputLocked]}

            value={userId}

            onChangeText={(t) => setUserId(t.toUpperCase())}

            placeholder="Enter User ID"

            placeholderTextColor={colors.gray400}

            autoCapitalize="characters"

            maxLength={10}

            autoCorrect={false}

            editable={!isUserIdLocked}

          />

          <Text style={styles.hint}>

            {isUserIdLocked ? 'Your registration is submitted for this User ID.' : 'Max 10 alphanumeric characters'}

          </Text>



          <Text style={styles.label}>Password</Text>

          <TextInput

            style={styles.input}

            value={password}

            onChangeText={setPassword}

            placeholder="Enter Password"

            placeholderTextColor={colors.gray400}

            secureTextEntry

            autoCapitalize="none"

            autoCorrect={false}

          />

          <Text style={[styles.hint, styles.hintLast]}>Your CBS login password</Text>



          <TouchableOpacity

            style={[styles.button, loading && styles.buttonDisabled]}

            onPress={handleRegister}

            disabled={loading}

            activeOpacity={0.85}

          >

            {loading

              ? <ActivityIndicator color={colors.white} />

              : <Text style={styles.buttonText}>Register</Text>}

          </TouchableOpacity>

        </View>

        <Text style={styles.footer}>Protected by datavision</Text>
        <Text style={styles.version}>App version {APP_VERSION_FULL}</Text>
      </View>

    </KeyboardAvoidingView>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: colors.surface,

  },

  inner: {

    flex: 1,

    justifyContent: 'center',

    paddingHorizontal: 24,

  },

  header: {

    alignItems: 'center',

    marginBottom: 40,

  },

  title: {

    fontSize: 24,

    fontWeight: '700',

    color: colors.primary,

    marginTop: 20,

  },

  subtitle: {

    fontSize: 14,

    color: colors.gray500,

    marginTop: 4,

  },

  card: {

    backgroundColor: colors.white,

    borderRadius: 16,

    paddingHorizontal: 20,

    paddingTop: 24,

    paddingBottom: 28,

    elevation: 4,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 8,

  },

  cardTitle: {

    fontSize: 18,

    fontWeight: '700',

    color: colors.primary,

    marginBottom: 4,

  },

  cardDesc: {

    fontSize: 14,

    color: colors.gray500,

    marginBottom: 20,

  },

  label: {

    fontSize: 14,

    fontWeight: '600',

    color: colors.gray700,

    marginBottom: 4,

  },

  input: {

    borderWidth: 2,

    borderColor: colors.gray200,

    borderRadius: 12,

    paddingHorizontal: 16,

    paddingVertical: 12,

    fontSize: 18,

    color: colors.gray900,

    backgroundColor: colors.surface,

    marginBottom: 4,

  },

  inputLocked: {

    backgroundColor: colors.gray100,

    color: colors.gray500,

  },

  hint: {

    fontSize: 12,

    color: colors.gray400,

    marginBottom: 16,

  },

  hintLast: {

    marginBottom: 24,

  },

  button: {

    backgroundColor: colors.primary,

    borderRadius: 12,

    paddingVertical: 16,

    alignItems: 'center',

  },

  buttonDisabled: {

    opacity: 0.6,

  },

  buttonText: {

    color: colors.white,

    fontWeight: '700',

    fontSize: 16,

  },

  footer: {

    textAlign: 'center',

    fontSize: 12,

    color: colors.gray400,

    marginTop: 32,

  },

  version: {

    textAlign: 'center',

    fontSize: 12,

    color: colors.gray400,

    marginTop: 8,

  },

});


