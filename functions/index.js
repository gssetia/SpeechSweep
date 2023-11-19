/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 * firebase deploy --only functions
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const logger = require("firebase-functions/logger");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const functions = require("firebase-functions");
const admin = require("firebase-admin");


// admin.initializeApp(functions.config().firebase);
admin.initializeApp();

exports.schedulePushNotification = onSchedule("every day 00:28", async (event) => {
    

    admin.database().ref('/users/').once('value', (snapshot) => {
        const data = snapshot.val();
        // console.log(snapshot.val());

        const keys = Object.keys(data);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const randomEntry = data[randomKey];
        console.log(randomKey);
        console.log(randomEntry);

        const notification = {
            title: "Sweep!",
            body: randomEntry['message'],
        }

        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          const token = data['notification_token'];
          
          
        //   console.log(data);
          payload = {
            token: token,
            notification: notification
          };
          admin
           .messaging()
           .send(payload)
           .then(function(response) {
             console.log("Notification sent successfully to given user:", response);
           })
           .catch(function(error) {
             console.log("Notification sent failed:", error);
           });
        });
    });
    
  });

exports.sendPushNotification = functions.database
  .ref("users/{userID}")
  .onCreate(event => {

    const token = event._data.notification_token;
    payload = {
       token: token,
      notification: {
        title: "Welcome",
        body: "thank for installed our app",
      },
    };
    // admin
    //   .messaging()
    //   .send(payload)
    //   .then(function(response) {
    //     console.log("Notification sent successfully:", response);
    //   })
    //   .catch(function(error) {
    //     console.log("Notification sent failed:", error);
    //   });
  });
