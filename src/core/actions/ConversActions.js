import * as backend from '../../backend/Mediator';

import {
    MESSAGE_SENT,
    SETUP_CONVERSATION,
    IS_RECEIVER_CONTACT,
    SETUP_OLD_MESSAGES
} from './types';

const userMessagesRef = null;

export const sendMessage = (uidFrom, uidTo, receiverName, message, networkStatus) => {
    console.log('network status: ' + uidTo);
    var msg = message[0];
    msg.title = receiverName;
    msg.uidFrom = uidFrom;
    msg.uidTo = uidTo;
    if (networkStatus) {
        backend.sendMessage(msg);
    } else {
        backend.saveQueuedMessage(msg);
    }

    return (dispatch) => {
        dispatch({
            type: MESSAGE_SENT,
            message: msg
        });
    }
}

export const setupConversation = (receiverName, receiverUID, currentChat, loggedinUser, oldMessages) => {
    return (dispatch) => {
        dispatch({
            type: SETUP_CONVERSATION,
            payload: { name: receiverName, uid: receiverUID, currentChat: currentChat }
        });
        setupOldMessages(dispatch, oldMessages, loggedinUser, receiverName);
    }
}

const setupOldMessages = (dispatch, oldMessages, loggedinUser, receiverName) => {
    let messages = new Array();
    oldMessages.forEach((message) => {
        if (message.uidFrom == loggedinUser.uid) {
            message.user = { _id: 1, name: loggedinUser.username, avatar: require('../../imgz/noimg.png') };
        } else {
            message.user = { _id: 2, name: receiverName, avatar: require('../../imgz/noimg.png') };
        }
        messages.push(message);
    });

    dispatch({
        type: SETUP_OLD_MESSAGES,
        payload: messages
    });
}

export const addContact = (uid, email, username, photo) => {
    backend.addContact({ uid, email, username, photo });
    console.log('contact added ');
    return changeReceiverContactStatus(true);
};

export const changeReceiverContactStatus = (isContact) => {
    return {
        type: IS_RECEIVER_CONTACT,
        payload: isContact
    };
};