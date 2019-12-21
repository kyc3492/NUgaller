var admin = require('firebase-admin');
var serviceAccount = require('./NUGUproject-FCMkey.json');
var private = require('./private_keys');
// This registration token comes from the client FCM SDKs.
var registrationToken = private.jhs8;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

var successMessage = {
    data: {
      title: '알림 보낸다',
      body: '받아라 얍! ^o^/',
      request: 'FindActivity'
    },
    token: registrationToken
};

var failureMessage = {
    data: {
      title: '누구가 아무 사진도 찾지 못했어요.',
      body: '혹시 업로드하지 않으셨거나 다른 키워드를 말씀하셨나요?'
    },
    token: registrationToken
};

var albumCreatedMessage = {
    data: {
      title: '누구가 요청하신 폴더를 만들었습니다!',
      body: '멋진 사진들로 채워볼까요?'
    },
    token: registrationToken
};

var albumExistsMessage = {
    data: {
      title: '요청하신 폴더명이 이미 존재합니다.',
      body: '다른 이름으로 다시 시도해보시겠어요?'
    },
    token: registrationToken
};

var moveSuccessMessage = {
  data: {
    title: '요청하신 사진들을 앨범으로 옮겼어요!',
    body: '만든 앨범 구경하러 가실래요?',
    request: 'MoveActivity'
  },
  token: registrationToken
}

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

function sendCreatedNotification(){
  // Send a message to the device corresponding to the provided
  // registration token.
  admin.messaging().send(albumCreatedMessage).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}

function sendAlreadyExistNotification(){
  admin.messaging().send(albumExistsMessage).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}

function sendMoveSuccessNotification(){
  admin.messaging().send(moveSuccessMessage).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}

sendMoveSuccessNotification();
//sendSuccessNotification();

module.exports={
  sendSuccessNotification,
  sendFailNotification,
  sendCreatedNotification,
  sendAlreadyExistNotification,
  sendMoveSuccessNotification
}
