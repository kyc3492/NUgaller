var admin = require('firebase-admin');
var serviceAccount = require('./NUGUproject-FCMkey.json');
var private = require('./private_keys');
// This registration token comes from the client FCM SDKs.
var registrationToken = private.ycn8;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

var successMessage = {
  notification: {
    title: '아리아가 사진을 찾았습니다!',
    body: '어떤 사진을 찾아왔을지 보러가요! ^o^/'
  },
  token: registrationToken
};

var failureMessage = {
  notification: {
    title: '아리아가 아무 사진도 찾지 못했어요.',
    body: '혹시 업로드하지 않으셨거나 다른 키워드를 말씀하셨나요?'
  },
  token: registrationToken
};

function sendSuccessNotification(){
  // Send a message to the device corresponding to the provided
  // registration token.
  admin.messaging().send(successMessage).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}

function sendFailNotification(){
  // Send a message to the device corresponding to the provided
  // registration token.
  admin.messaging().send(failureMessage).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}



module.exports={
  sendSuccessNotification,
  sendFailNotification
}
