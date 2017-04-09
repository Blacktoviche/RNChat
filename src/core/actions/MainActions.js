import * as backend from '../../backend/Mediator';

import {
    MESSAGE_RECEIVED,
    SETUP_LOGGEDIN_USER,
    NETWORK_STATUS_CHANGED,
    QUEUED_MESSAGES_SENT,
    CURRENT_SCREEN_CHANGED
} from './types';

export const setupLoggedinUser = (user) => {
    return {
        type: SETUP_LOGGEDIN_USER,
        payload: user
    };
}

const userMessagesRef = null;

export const startMessagesListener = loggedinUser => (dispatch) => {
    console.log('Messages listener started...' + loggedinUser.uid);
    userMessagesRef = backend.getChatRef(loggedinUser.uid);
    userMessagesRef.on('child_changed', function (element) {
        senderUID = element.key;
        backend.getUnreadMessagesRef(loggedinUser.uid, senderUID).once('value').then(function (snapshot) {

            snapshot.forEach(function (childSnapshot) {
                var childKey = childSnapshot.key;
                var msgData = childSnapshot.val();
                var msg = {
                    uidFrom: senderUID,
                    uidTo: loggedinUser.uid,
                    key: childKey,
                    _id: msgData.id,
                    text: msgData.text,
                    createdAt: new Date(msgData.createdAt),
                    status: msgData.status,
                }

                //updating the sender info { now what I do care for is sender photo }
                var userRef = backend.getUserRef(senderUID);
                userRef.once('value').then(function (snapshot) {
                    var value = snapshot.val();
                    var senderUser = {
                        uid: value.uid,
                        username: value.username,
                        email: value.email,
                        photo: value.photo
                    }
                    msg.title = senderUser.username;
                    backend.updateMessage(msg);
                    dispatch(messageRecieved(msg, senderUser));
                }, (error) => {
                    console.log('erro: ' + error);
                });
            });
            //console.log('end messageRef for!');
        });
    });
}

const messageRecieved = (message, senderUser) => {
    message.user = { _id: 2, name: senderUser.username, avatar: require('../../imgz/noimg.png') };
    message.sent = true;
    message.received = true;
    backend.saveMessage(message);
    return {
        type: MESSAGE_RECEIVED,
        message: message,
        senderUid: senderUser.uid
    }
}

export const stopMessagesListener = () => {
    if (userMessagesRef) {
        userMessagesRef.off();
    }
}

export const sendQueuedMessages = () => {
    var queuedMessages = backend.getQueuedMessages();
    queuedMessages.forEach((message) => {
        backend.sendQueuedMessage(message);
    });

    return (dispatch) => {
        dispatch({
            type: QUEUED_MESSAGES_SENT,
            payload: queuedMessages.length
        });
    }
};

export const networkStatusChanged = (status) => {
    return (dispatch) => {
        dispatch({
            type: NETWORK_STATUS_CHANGED,
            payload: status
        });
    }
};

export const changeCurrentScreen = (currentScreen) => {
    return (dispatch) => {
        dispatch({
            type: CURRENT_SCREEN_CHANGED,
            payload: currentScreen
        });
    }
};