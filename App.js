/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import type {Node} from 'react';
import auth from '@react-native-firebase/auth';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  TextInput,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [phoneNumber, setPhoneNumber] = useState('');

  const signIn = async () => {
    try {
      console.log(phoneNumber);
      const confirmation = await auth().signInWithPhoneNumber("+1 416 655 5594");
      
      setConfirmation(confirmation);
    } catch (error) {
      console.log(error);
    }
  };

  const confirmVerificationCode = async (code) => {
    try {
      await confirmation.confirm(code);
      setConfirmation(null);
    } catch (error) {
      console.log(error);
    }
  };

  // if (confirmation) {
  //   return (
  //     <View>
  //       <TextInput placeholder="Verification Code" onChangeText={setCode} />
  //       <Button title="Confirm OTP" onPress={() => confirmVerificationCode(code)} />
  //     </View>
  //   );
  // }

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <View>
      <TextInput placeholder="Phone Number" onChangeText={setPhoneNumber} />
      <Button title="Phone Number Sign In" onPress={signIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
