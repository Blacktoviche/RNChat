import * as localDB from './LocalDB';
import * as onlineDB from './OnlineDB';
import { MESSAGE_STATUS_UNREAD, MESSAGE_STATUS_READ } from '../utils/GlobaleStaticVars';

import {
    LOGIN_USER_SUCCESS,
    LOGIN_USER_FAIL,

    REGISTER_USER_SUCCESS,
    REGISTER_USER_FAIL,
    UPDATE_PASSWORD_SUCCESS,
    UPDATE_PASSWORD_FAIL,
    SETUP_LOGGEDIN_USER
} from '../core/actions/types';


export const registerUser = (navigation, dispatch, email, password) => {
    onlineDB.creatUser(email, password).then((data) => {
        var uid = data.uid;
        localDB.addUser({ email, password, uid });
        onlineDB.addUser(email);
        dispatch({
            type: REGISTER_USER_SUCCESS,
            payload: { email, password }
        });
        dispatch({
            type: SETUP_LOGGEDIN_USER,
            payload: {
                uid: uid,
                email: email,
                username: email
            }
        });
        navigation.navigate('MainNav');
    }).catch((error) => {
        console.log('error: ' + error);
        dispatch({
            type: REGISTER_USER_FAIL,
            payload: error
        });
    });
}

export const signinUser = (navigation, dispatch, email, password) => {
    onlineDB.signinUser(email, password).then((data) => {
        var uid = data.uid;
        localDB.addUser({ email, password, uid });
        onlineDB.addUser(email);
        dispatch({
            type: LOGIN_USER_SUCCESS,
            payload: { email, password }
        });
        dispatch({
            type: SETUP_LOGGEDIN_USER,
            payload: {
                uid: uid,
                email: email,
                username: email
            }
        });
        navigation.navigate('Main');
    }).catch((error) => {
        console.log('error: ' + error);
        dispatch({
            type: LOGIN_USER_FAIL,
            payload: error
        });
    });
}

export const addContact = (contact) => {
    localDB.addContact(contact);
}

export const updatePassword = (dispatch, newPassword) => {
    var onlineUser = onlineDB.getCurrentUser();
    if (!onlineUser) {
        dispatch({
            type: UPDATE_PASSWORD_FAIL,
            payload: 'User is not connected'
        });
    }
    onlineDB.updatePassword().then(function () {
        localDB.updateUserPassword({ newPassword });
        dispatch({
            type: UPDATE_PASSWORD_SUCCESS
        });
    }, function (error) {
        dispatch({
            type: UPDATE_PASSWORD_FAIL,
            payload: error
        });
    });
}


export const updateProfile = ({ email, fullName, username }) => {
    onlineDB.updateProfile().set({
        uid: onlineDB.getCurrentUser().uid,
        fullname: fullName,
        username: username,
        photo: '',
        email: email
    });

    localDB.updateUser({ fullName, username });
}

export const getCurrentLocalUser = () => {
    return localDB.getCurrentUser();
}

export const getCurrentOnlineUser = () => {
    return onlineDB.getCurrentUser();
}

export const isContact = (uid) => {
    return localDB.isContact(uid);
}

export const getLocalContacts = () => {
    return localDB.getContacts();
}

export const getOnlineUsers = () => {
    return onlineDB.getContacts();
}

export const getUserRef = (userUid) => {
    return onlineDB.getUserRef(userUid);
}

//Chat/Messages
export const sendMessage = (message) => {
    var userChatRef = onlineDB.getReceiverChatRef(message.uidTo, message.uidFrom).push();
    userChatRef.set({
        id: message._id,
        text: message.text,
        createdAt: message.createdAt.getTime(),
        status: MESSAGE_STATUS_UNREAD
    });
    message.sent = true;
    message.id = localDB.generateID();
    message.key = userChatRef.key;
    message.sent = true;
    message.received = false;
    message.status = MESSAGE_STATUS_UNREAD;
    saveMessage(message);
}

export const sendQueuedMessage = (message) => {
    var userChatRef = onlineDB.getReceiverChatRef(message.uidTo, message.uidFrom).push();
    userChatRef.set({
        id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        status: MESSAGE_STATUS_UNREAD
    });
    message.key = userChatRef.key;
    message.sent = true;
    localDB.updateMessage(message);
    localDB.deleteQueueMessage(message.id);
}

export const updateMessage = (message) => {
    var messageRef = onlineDB.getMessageRef(message.uidTo, message.uidFrom, message.key);
    messageRef.update({
        status: MESSAGE_STATUS_READ
    });
}

export const saveMessage = (message) => {
    if (!message.id) {
        message.id = localDB.generateID();
    }
    localDB.saveMessage(message);
}

export const saveQueuedMessage = (message) => {
    message.id = localDB.generateID();
    message.key = '';
    message.sent = false;
    message.received = false;
    message.status = MESSAGE_STATUS_UNREAD;
    saveMessage(message);
    localDB.saveQueueMessage(message);
}

export const getChats = () => {
    return localDB.getChats();
}

export const getContact = (uid) => {
    return localDB.getContact(uid);
}

export const getChatRef = (uid) => {
    return onlineDB.getChatRef(uid);
}

export const getUnreadMessagesRef = (uid, uidFrom) => {
    return onlineDB.getUnreadMessagesRef(uid, uidFrom);
}

export const getQueuedMessages = () => {
    return localDB.getQueuedMessages();
}

export const getMessages = (uid, uid2) => {
    return localDB.getMessages(uid, uid2);
}

export const deleteAll = () => {
    return localDB.deleteAll();
}
