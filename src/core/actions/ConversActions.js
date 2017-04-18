import * as backend from '../../backend/Mediator';
import * as CONSTANTS from '../../utils/GlobaleStaticVars';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import {
    MESSAGE_SENT,
    SETUP_CONVERSATION,
    IS_RECEIVER_CONTACT,
    SETUP_OLD_MESSAGES,
    IMAGE_MODAL_CHANGED,
    IMAGE_MESSAGE_TEXT_CHANGED,
    VIEW_PROGRESS_CHANGED,
    EMPTY_ACTION
} from './types';

const userMessagesRef = null;

export const sendTextMessage = (message, networkStatus) => {
    message.type = CONSTANTS.MESSAGE_TYPE_TEXT;
    if (networkStatus) {
        backend.sendTextMessage(message, false);
    } else {
        backend.saveQueuedMessage(message);
    }

    return (dispatch) => {
        dispatch({
            type: MESSAGE_SENT,
            message: message
        });
    }
}

export const sendImageMessage = (message, networkStatus) => {
    console.log('send image message');
    message.type = CONSTANTS.MESSAGE_TYPE_IMAGE;
    return (dispatch) => {
        if (networkStatus) {
            backend.sendImageMessage(dispatch, message, false);
        } else {
            backend.saveQueuedMessage(message);
        }
        dispatch(hideImageModal());
        dispatch({
            type: MESSAGE_SENT,
            message: message
        });
    }
}

export const setupConversation = (receiverName, receiverUID, currentChat, loggedinUser, oldMessages) => {
    return (dispatch) => {
        //console.log('img uri: ' + oldMessages[0].image);
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
            message.user = { _id: 1, name: loggedinUser.username };
        } else {
            message.user = { _id: 2, name: receiverName };
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

export const showImageModal = (imagePath) => {
    return (dispatch) => {
        dispatch({
            type: EMPTY_ACTION
        });
        proccessModal(dispatch, imagePath);
    }
}

async function proccessModal(dispatch, imagePath) {
    if (Platform.OS === 'android') {
        const granted = await requestExternalPermission();
        if (granted === true) {
            let imgName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
            let newPath = CONSTANTS.IMAGES_DIRECTORY + imgName;
            if (imagePath.startsWith(CONSTANTS.ANDROID_FILE_PREFIX + CONSTANTS.IMAGES_DIRECTORY) === true) {
                dispatch({
                    type: IMAGE_MODAL_CHANGED,
                    imageModalVisible: true,
                    imagePath: imagePath
                });
            } else {
                RNFetchBlob.fs.cp(imagePath.replace(CONSTANTS.ANDROID_FILE_PREFIX, ""), newPath)
                    .then(() => {
                        newPath = CONSTANTS.ANDROID_FILE_PREFIX + newPath;
                        console.log('image copied: ' + newPath);
                        dispatch({
                            type: IMAGE_MODAL_CHANGED,
                            imageModalVisible: true,
                            imagePath: imagePath
                        });

                    }).catch((error) => { console.log('mv error: ' + error); })
            }
        } else {
            console.log("Permission denied");
            alert('You cant send/recieve pictures unless you grant RNChat app external storage permission');
            dispatch({
                type: EMPTY_ACTION
            });
        }
    } else {
        dispatch({
            type: IMAGE_MODAL_CHANGED,
            imageModalVisible: true,
            imagePath: imagePath
        });
    }
}
export const hideImageModal = () => {
    return {
        type: IMAGE_MODAL_CHANGED,
        imageModalVisible: false,
        imagePath: ''
    };
}

export const imageMessageTextChanged = (imageMessageText) => {
    return {
        type: IMAGE_MESSAGE_TEXT_CHANGED,
        payload: imageMessageText
    };
};

async function requestExternalPermission() {
    var readPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    var writePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    if (readPerm && writePerm) {
        return true;
    } else {
        var granted = null;
        try {
            granted = await PermissionsAndroid.requestMultiple(
                [PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE],
                {
                    'title': 'RNChat App Needs External Permission',
                    'message': 'RNChat app needs access to your external storage ' +
                    'so you can send/recieve pictures.'
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
}