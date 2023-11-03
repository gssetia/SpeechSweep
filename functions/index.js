/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
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
    admin
      .messaging()
      .send(payload)
      .then(function(response) {
        console.log("Notification sent successfully:", response);
      })
      .catch(function(error) {
        console.log("Notification sent failed:", error);
      });
  });
