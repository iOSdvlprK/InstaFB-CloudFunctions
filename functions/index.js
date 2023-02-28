// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require("firebase-functions");


// The Firebase Admin SDK to access the Firestore.
const admin = require('firebase-admin');

admin.initializeApp({
  databaseURL: "https://instafb-58b4d-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// listen for Following events and then trigger a push notification
exports.observeFollowing = functions.database.ref('/following/{uid}/{followingId}')
  .onCreate((snap, context) => {
    const uid = context.params.uid;
    const followingId = context.params.followingId;

    // let's log out some messages
    console.log('User: ' + uid + ' is following: ' + followingId);

    // trying to figure out fcmToken to send a push message
    return admin.database().ref('/users/' + followingId).once('value', snapshot => {

      const userWeAreFollowing = snapshot.val();

      return admin.database().ref('/users/' + uid).once('value', snapshot => {

        const userDoingTheFollowing = snapshot.val();

        const message = {
          notification: {
            title: "You now have a new follower",
            body: userDoingTheFollowing.username + ' is now following you'
          },
          data: {
            followerId: uid
          },
          token: userWeAreFollowing.fcmToken
        };
  
        admin.messaging().send(message)
          .then((response) => {
            console.log('Successfully sent message:', response);
          })
          .catch((error) => {
            console.log('Error sending message:', error);
          });
      })
    })
  });


exports.sendPushNotifications = functions.https.onRequest((req, res) => {
  res.send("Attempting to send Push Notification..")
  console.log("LOGGER --- Trying to send Push message..")


    const uid = 'GzBXgx76hOPuo9vmiceyKB1N44B3'

    // As an admin, the app has access to read and write all data, regardless of Security Rules
    return admin.database().ref('/users/' + uid).once('value', snapshot => {
      var user = snapshot.val()

      console.log("User username: " + user.username + " User fcmToken: " + user.fcmToken)

      const message = {
        notification: {
          title: "Push notification TITLE HERE",
          body: "Body over here is our message body.."
        },
        data: {
          score: '850',
          time: '2:45'
        },
        token: user.fcmToken
      };

      admin.messaging().send(message)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        }); 
    })
})

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});



