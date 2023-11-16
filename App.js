import React, { useState, useEffect } from 'react';
import { Image, View, SafeAreaView, TextInput, StyleSheet, Alert, ImageBackground} from 'react-native';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import { Button, Card, Input, Text } from '@rneui/themed';
import PhoneInput from "react-native-phone-number-input";

const App = () => {

    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);
    const [loggedIn, setloggedIn] = useState(null);
    const [phone, setPhone] = useState(null);
    const [message, setMessage] = useState('');
    // verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');
    const db = database().ref('/users/');


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

    useEffect(() => {
      // Assume a message-notification contains a "type" property in the data payload of the screen to open

      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log(JSON.stringify(remoteMessage))
        Alert.alert('Sweep!', remoteMessage['notification']['body']);
      });
  
      // messaging().onNotificationOpenedApp(remoteMessage => {
      //   console.log(
      //     'Notification caused app to open from background state:',
      //     remoteMessage.notification,
      //   );
      //   navigation.navigate(remoteMessage.data.type); fXNFZaU4ShmGgqsxpWqNM9:APA91bHAXgUIfFr68jakrRw-etsua1BtMOTdokfUDqRp9N0fqBaHMki68fqW8oe4j0yysYtMmZFYCrnudGxUTYUlcvfbEOPqyErV08RIPUwrochY2gIUOR6z3CId5gVR3pGUOE0UPd4l
      // }); egQwMs0K0GZetFO9q-bsbJ:APA91bHGZ8Q5sWYXVEyo3rWhgWKOyXhreakbv9AO7Mlgqfo9tLI_i5hWIw70ysNvX_XTgqDv1PCty4GlxA2RoHhII4MKdE1yEZxofbPQICkn5MN8MHFeGPTeKbKvnrQeUayWXoj3SsbS

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage['notification']['body']);
      });
  
      // Check whether an initial notification is available
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage['notification']['body'],
            );
            // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
          }
          
        });
      return unsubscribe;
    }, []);
  
    // Handle the button press 
    async function signInWithPhoneNumber() {
      console.log(loggedIn, phone);
      try {
        if (phone) {
          const confirmation = await auth().signInWithPhoneNumber(phone);
          setConfirm(confirmation);
          Toast.show({
            type: 'info',
            text1: 'OTP',
            text2: "Enter the one-time password sent to your phone number.",
            position: 'bottom'
          });
        }else{
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: "Your Phone Number is invalid, please Try again",
            position: 'bottom'
          });
        }
        
      }catch (error) {
        console.log('Invalid phone#:', phone);
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
        });
        setloggedIn(phone);
        db
        .child(phone)
        .set("")
        .then(() => {console.log('data set')});
      } catch (error) {
        console.log('Invalid code.');
        console.log(error);
      }
    }

    async function confirmMessage() {
      try {
        if (message) {
          // db
          // .child('+' + phone)
          // .set(message)
          // .then(() => console.log('data set'));
        
          Toast.show({
            type: 'success',
            text1: 'Your Message has been successfully submitted!',
            text2: phone,
            position: 'bottom'
          })
          const enabled = await messaging().hasPermission();
          if (enabled) {
            messaging()
              .getToken()
              .then(fcmToken => {
                if (fcmToken) {
                  console.log(fcmToken);
                  db
                    .child(phone)
                    .set({
                      message: message,
                      notification_token: fcmToken,
                      created_at: Date.now(),
                    })
                    .then(res => {
                      console.log(res);
                    });
                } else {
                alert("user doesn't have a device token yet");
                }
              });
          } else {
            alert("Notifications must be enabled.");
          }
        }
      } catch (error) {
        console.log('Invalid message.');
        console.log(error);
      }
    }


    return (
    
        <ImageBackground style={styles.view} source={require('./assets/bg2.png')}> 

        {!confirm ? (

          <View style={styles.container}> 
          <Image style={styles.logo} source={require("./assets/speechsweep.png")}/>
          
          <PhoneInput textContainerStyle={{  borderColor:"black", borderLeftWidth:1, backgroundColor: 'tomato' }} containerStyle={{ borderRadius:3, borderColor:"black", borderWidth:1, backgroundColor: 'tomato' }} textInputStyle={ styles.input } defaultCode="CA" placeholder='Phone #' value={phone} onChangeFormattedText={text => setPhone(text)} autoFocus/>
          <Button
          buttonStyle={styles.button}
          color="tomato"
          title="Next"
          onPress={() => signInWithPhoneNumber()}
        />
          </View>

        ) : !loggedIn ? 
          (
            <View style={styles.container}>
            <TextInput keyboardType='numeric' style={styles.codeInput} value={code} onChangeText={text => setCode(text)} />
            <Button buttonStyle={styles.button} title="Confirm" onPress={() => confirmCode()} />
            </View>
        ):
        <View style={styles.container2}>
          
          <Text h3 style={styles.text}>Submit your message below to be broadcast to all participants if you win the Sweep! </Text>
          <TextInput numberOfLines={6} style={styles.messageInput} value={message} maxLength={100} multiline={true} onChangeText={text => setMessage(text)} />
          <Button buttonStyle={styles.button} title="Submit!" onPress={() => confirmMessage()} />
          </View>
        
        }
        <Toast bottomOffset={10}/>
        
        </ImageBackground>
       
    )
  };

  const styles = StyleSheet.create({
    logo: {
      width: 125,
      height:125, 
      top: 50,
      position:'absolute',
    },
    text:{
      textAlign:'center',
      padding:50,
      paddingBottom:20,
    },
    container: {
      alignItems:'center',
      flex:1,
      justifyContent:'center',
    },
    container2: {
      alignItems:'center',
      flex:1,
      justifyContent:'center',
      bottom:100,
    },
    codeInput: {
      height: 30,
      backgroundColor: 'pink',
      width: 100,
      borderRadius:4,
      padding: 5,
    },
    messageInput: {
      height: 100,
      backgroundColor: 'pink',
      width: 260,
      borderRadius:4,
      padding: 5,
    },
    input: {
      borderRadius:3,
      height: 30,
      borderWidth: 1,
      padding: 5,
      justifyContent:"center",
      alignItems:"center",
      backgroundColor: 'pink',
    },
    button: {
      height: 45,
      marginTop:20,
      borderRadius:20,
      width:100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'red',
    },
    view : {
      flex: 1,
      alignItems: 'center',
      justifyContent:"center",
    },
    bg : {
      flex: 1,
    }
  });
export default App;
