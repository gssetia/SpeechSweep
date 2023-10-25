import React, { useState, useEffect } from 'react';
import { Button, TextInput, Text, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import database from '@react-native-firebase/database';

const App = () => {

    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);
    const [loggedIn, setloggedIn] = useState(null);
    const [phone, setPhone] = useState(null);
    const [message, setMessage] = useState('');
    // verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');
    const db = database().ref('/users/')

    db
      .once('value')
      .then(snapshot => {
      console.log('User data: ', snapshot.val());
    });

    // Handle login
    function onAuthStateChanged(user) {
      if (user) {
        console.log(user);
        Toast.show({
          type: 'success',
          text1: 'You are now logged in as:',
          text2: user.phoneNumber,
          position: 'bottom'
        })
        setloggedIn(user.phoneNumber);
        // Some Android devices can automatically process the verification code (OTP) message, and the user would NOT need to enter the code.
        // Actually, if he/she tries to enter it, he/she will get an error message because the code was already used in the background.
        // In this function, make sure you hide the component(s) for entering the code and/or navigate away from this screen.
        // It is also recommended to display a message to the user informing him/her that he/she has successfully logged in.
      }
    }
  
    // useEffect(() => {
    //   const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    //   return subscriber; // unsubscribe on unmount
    // }, []);
  
    // Handle the button press
    async function signInWithPhoneNumber() {
      console.log(loggedIn, "+" + phone);
      try {
        if (phone) {
          const confirmation = await auth().signInWithPhoneNumber("+" + phone);
          setConfirm(confirmation);
        }else{
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: "Your Phone Number is invalid, please Try again",
            position: 'bottom'
          });
        }
        
      }catch (error) {
        console.log('Invalid phone#.');
        console.log(error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: "Your Phone Number is invalid, please Try again",
          position: 'bottom'
        });
      }
    }
  
    async function confirmCode() {
      try {
        await confirm.confirm(code);
        console.log("Nice!");
        Toast.show({
          type: 'success',
          text1: 'You are now logged in as:',
          text2: phone,
          position: 'bottom'
        })
        db
        .child('+' + phone)
        .set("")
        .then(() => console.log('data set'));
      } catch (error) {
        console.log('Invalid code.');
        console.log(error);
      }
    }

    async function confirmMessage() {
      try {
        if (message) {
          db
          .child('+' + phone)
          .set(message)
          .then(() => console.log('data set'));
        }
        
        Toast.show({
          type: 'success',
          text1: 'Your Message has been successfully submitted!',
          text2: phone,
          position: 'bottom'
        })
      } catch (error) {
        console.log('Invalid message.');
        console.log(error);
      }
    }
  
    if (!confirm) {
      return (
        <>
        <TextInput style={styles.input} value={phone} onChangeText={text => setPhone(text)} />
        <Button
          title="Phone Number Sign In"
          onPress={() => signInWithPhoneNumber()}
        />
        <Toast bottomOffset={10}/>
        </>
      );
    }else{
      if (!phone) {
        return (
          <>
            <TextInput style={styles.input} value={code} onChangeText={text => setCode(text)} />
            <Button position='300' title="Confirm Code" onPress={() => confirmCode()} />
            <Toast bottomOffset={10}/>
          </>
        );
      }else{
        return (
          <>
            <Text>Submit your message below to be sent to all participants if you win the lottery! 
                  You can submit a new message to replace your previous one.</Text>
            <TextInput style={styles.input} value={message} onChangeText={text => setMessage(text)} />
            <Button position='30' title="Confirm message" onPress={() => confirmMessage()} />
            <Toast bottomOffset={10}/>
          </>
        );
      }
    }
  };
  const styles = StyleSheet.create({
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
  });
export default App;
