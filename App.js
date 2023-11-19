import React, { useState, useEffect } from 'react';
import { Image, View, TextInput, StyleSheet, Alert, ImageBackground, Keyboard} from 'react-native';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import { Button, Text } from '@rneui/themed';
import PhoneInput from "react-native-phone-number-input";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/AntDesign';

const App = () => {
    // If null, no SMS has been sent
    const [confirm, setConfirm] = useState(null);
    const [loggedIn, setLoggedIn] = useState(null);
    const [phone, setPhone] = useState(null);
    const [message, setMessage] = useState('');
    // verification code (OTP - One-Time-Passcode)
    const [code, setCode] = useState('');
    const db = database().ref('/users/');

    const storeUser = async (value) => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem('user', jsonValue);
      } catch (e) {
        // saving error
        console.log(e);
      }
    };

    const storePhone = async (value) => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem('phone', jsonValue);
      } catch (e) {
        // saving error
        console.log(e);
      }
    };

    const getData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        const phone = await AsyncStorage.getItem('phone');

        if (user !== null) {
          console.log("User already logged in as:" + user);
          setLoggedIn(user);
        }

        if (phone !== null) {
          console.log("User entered phone as:" + phone);
          setConfirm(phone);
        }else{
          console.log("User at login.");
        }

      } catch (e) {
        // error reading value
        console.log(e);
      }
    };

    const logout = async () => {
      try {
        setLoggedIn(null);
        await AsyncStorage.removeItem('user');
        console.log("Successfully logged out.")
        back();
      } catch (e) {
        // error reading value
        console.log(e);
      }
    };

    const back = async () => {
      try {
        setConfirm(null);
        await AsyncStorage.removeItem('phone');
        console.log("Back to phone input")
      } catch (e) {
        // error reading value
        console.log(e);
      }
    };



    useEffect(() => {
      // Assume a message-notification contains a "type" property in the data payload of the screen to open
      getData();
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
      console.log(phone);
      try {
        if (phone) {
          const confirmation = await auth().signInWithPhoneNumber(phone);
          setConfirm(confirmation);
          storePhone(phone);

          Toast.show({
            type: 'info',
            text1: 'OTP',
            text2: "Enter the one-time password sent to your phone number.",
            position: 'bottom'
          });

        }else{
          Keyboard.dismiss();
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: "Your Phone Number is invalid, please try again",
            position: 'bottom'
          });
        }
        
      }catch (error) {
        console.log('Invalid phone#:', phone);
        console.log(error);
        Keyboard.dismiss();
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: "Your Phone Number is invalid, please try again",
          position: 'bottom'
        });
      }
    }
  
    async function confirmCode() {
      try {
        await confirm.confirm(code);
        storeUser(phone);
        setLoggedIn(phone);

        Toast.show({
          type: 'success',
          text1: 'You are now logged in as:',
          text2: phone,
          position: 'bottom'
        });

      } catch (error) {
        Keyboard.dismiss();
        Toast.show({
          type: 'error',
          text1: 'OTP code is incorrect.',
          text2:'Please try again.',
          position: 'bottom'
        });
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
            
            <PhoneInput textContainerStyle={{  borderColor:"black", borderLeftWidth:1, backgroundColor: 'tomato' }} containerStyle={{ borderRadius:3, borderColor:"black", borderWidth:1, backgroundColor: 'tomato' }} textInputStyle={ styles.input } defaultCode="CA" placeholder='Phone #' onChangeFormattedText={text => setPhone(text)} autoFocus/>
            <Button
              buttonStyle={styles.button}
              color="tomato"
              title="Next"
              onPress={() => signInWithPhoneNumber()}/>
          </View>

        ) : !loggedIn ? 
          (
            <View style={styles.container}>

              <View style={styles.backContainer}>
                <Button buttonStyle={{backgroundColor:'orange'}} onPress={() => back()}>
                  <Icon size={25} name='back'/>
                </Button>
              </View>

              <TextInput keyboardType='numeric' style={styles.codeInput} onChangeText={text => setCode(text)} />
              <Button buttonStyle={styles.button} title="Confirm" onPress={() => confirmCode()} />
            </View>
        ):
          <View style={styles.container2}>
            
            <View style={styles.logoutContainer}>
              <Button buttonStyle={{backgroundColor:'orange'}} onPress={() => logout()}>
                <Icon size={25} name='logout'/>
              </Button>
            </View>
            
            <Text h3 style={styles.text}>Submit your message below to be broadcast to all participants if you win the Sweep! </Text>
            <TextInput numberOfLines={6} style={styles.messageInput} value={message} maxLength={100} multiline={true} onChangeText={text => setMessage(text)} />
            <Button buttonStyle={styles.button} title="Submit!" onPress={() => confirmMessage()}/>
          </View>
            
        }
        <Toast bottomOffset={30}/>
        </ImageBackground>
       
    )
  };

  const styles = StyleSheet.create({
    logoutContainer: {
      left:160,
      borderColor:'black',
      borderWidth:1,
    },
    backContainer: {
      right:160,
      borderColor:'black',
      borderWidth:1,
      bottom:240,
    },
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
