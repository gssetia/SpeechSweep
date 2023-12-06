import React, { useState, useEffect } from 'react';
import { Image, View, TextInput, StyleSheet, Alert, ImageBackground, Keyboard, Dimensions} from 'react-native';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import { Button, Text } from '@rneui/themed';
import PhoneInput from "react-native-phone-number-input";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/AntDesign';

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

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
      //   navigation.navigate(remoteMessage.data.type); 
      // }); 

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
        
          const enabled = await messaging().hasPermission();
          if (!enabled) {
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
                alert("User doesn't have a device token yet");
                }
              });
              Keyboard.dismiss();
              Toast.show({
                type: 'success',
                text1: 'Your message has been successfully submitted!',
                text2: phone,
                position: 'bottom'
              });

          } else {
            Keyboard.dismiss();
            Toast.show({
              type: 'success',
              text1: 'Your message has been successfully submitted!',
              text2: phone,
              position: 'bottom'
            });
            // Toast.show({
            //   type: 'error',
            //   text1: 'Notifications must be enabled to enter!',
            //   text2: 'Enable notifications before trying again',
            //   position: 'bottom'
            // });
          }
        }
      } catch (error) {
        console.log('Invalid message.');
        console.log(error);
      }
    }

    return (
    
        <ImageBackground style={styles.view} source={require('./assets/bg2.png')}> 

        { confirm ? (

           
          <View style={styles.container}>
              <View
                style={{
                  height: '30%',
                  width:'45%',
                  // backgroundColor: 'lightblue',
                  justifyContent:'center',
                  alignItems:'center',
                }}
              > 
              <Image style={styles.logo} source={require("./assets/speechsweep.png")}/>
              </View>


              <View
                style={{
                  width: '80%',
                  height: '25%',
                  justifyContent:'center'
                }}
              >
              
              <PhoneInput textContainerStyle={{ borderColor:"black", borderLeftWidth:1, backgroundColor: 'tomato' }} containerStyle={{ borderRadius:3, borderColor:"black", borderWidth:1, backgroundColor: 'tomato' }} textInputStyle={ styles.input } defaultCode="CA" placeholder='Phone #' codeTextStyle={{fontSize:20,}} onChangeFormattedText={text => setPhone(text)} autoFocus/>
              
              </View> 
              <View
                  style={{
                    width: '25%',
                    height: '45%',
                    // backgroundColor: 'steelblue',
                    textAlign:'center'
                  }}
              >
                <Button
                  buttonStyle={styles.button}
                  titleStyle={{fontSize:20}}
                  color="tomato"
                  title="Next"
                  onPress={() => signInWithPhoneNumber()}/>
              </View> 
            </View>


        ) : loggedIn ? 
          (
            <View style={styles.container}>


            <View
                style={{
                  height: '20%',
                  width:'40%',
                  // backgroundColor: 'lightblue',
                  justifyContent:'flex-end',
                  alignItems:'center',
                }}
              > 
                  <View style={styles.buttonContainer}>
                  <Button buttonStyle={{backgroundColor:'orange'}} onPress={() => back()}>
                    <Icon size={25} name='back'/>
                  </Button>
                </View>
                
              </View>

              <View
                style={{
                  width: '55%',
                  height: '35%',
                  justifyContent:'center',
                  // backgroundColor:'skyblue',
                  alignItems:'center'
                }}
              >

<Text h3 style={styles.text}> Confirm the 6-digit OTP sent to your phone </Text>
<TextInput keyboardType='numeric' placeholder='Verify #' style={styles.codeInput} onChangeText={text => setCode(text)} />
              </View>

              <View
                style={{
                  width: '25%',
                  height: '45%',
                  // backgroundColor: 'steelblue',
                  textAlign:'center'
                }}
              >
 
              <Button titleStyle={{fontSize:20}} buttonStyle={styles.button} title="Confirm" onPress={() => confirmCode()} />
              </View>
              
             
             
            </View>
        ):


          <View style={styles.container}>




          <View
                style={{
                  height: '20%',
                  width:'40%',
                  // backgroundColor: 'lightblue',
                  justifyContent:'flex-end',
                  alignItems:'center',
                }}
              > 
              <View style={styles.buttonContainer}>
                <Button buttonStyle={{backgroundColor:'orange'}} onPress={() => logout()}>
                  <Icon size={25} name='logout'/>
                </Button>
              </View>

            </View>

            <View
                style={{
                  width: '80%',
                  height: '35%',
                  justifyContent:'center',
                  // backgroundColor:'skyblue',
                  alignItems:'center'
                }}
              >

                <Text h4 style={styles.text}>Submit your message below to be broadcast to all participants if you win the Sweep! </Text>
                
                <TextInput numberOfLines={6} style={styles.messageInput} value={message} maxLength={240} multiline={true} placeholder='240 Characters Max' onChangeText={text => setMessage(text)} />
                    
                </View>


  <View
                style={{
                  width: '25%',
                  height: '45%',
                  // backgroundColor: 'steelblue',
                  textAlign:'center'
                }}
              >
                  <Button titleStyle={{fontSize:20}} buttonStyle={styles.button} title="Submit!" onPress={() => confirmMessage()}/>
                  

</View>
                
                
          </View>
            
        }
        <Toast bottomOffset={90}/>
        </ImageBackground>
       
    )
  };

  const styles = StyleSheet.create({
    buttonContainer: {
      right:'80%',
      borderColor:'black',
      borderWidth:1,
    },
    logo: {
      width: '70%',
      height: '70%', 
    },
    text:{
      textAlign:'center',
      paddingBottom:20,
    },
    container: {
      alignItems:'center',
      justifyContent:'center',
    },
    codeInput: {
      height: 50,
      backgroundColor: 'pink',
      width: 150,
      borderRadius:4,
      padding: 5,
      textAlign:'center',
      fontSize:20,
    },
    messageInput: {
      height: '50%',
      backgroundColor: 'pink',
      borderRadius:4,
      marginLeft:100,
      marginRight:100,
      textAlign:'center',
      fontSize:20,
      width:'90%',
    },
    input: {
      borderRadius:3,
      height: 40,
      borderWidth: 1,
      padding: 5,
      justifyContent:"center",
      alignItems:"center",
      backgroundColor: 'pink',
      fontSize:20,
    },
    button: {
      height: 45,
      borderRadius:20,
      width:'100%',
      backgroundColor: 'red',
    },
    view : {
      justifyContent:"center",
      height:'100%',
    },
  });
export default App;
