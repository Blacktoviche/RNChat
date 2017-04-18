import * as backend from '../../backend/Mediator';
import RNFetchBlob from 'react-native-fetch-blob'
import * as CONSTANTS from '../../utils/GlobaleStaticVars';
import { Platform } from 'react-native';
import { CameraRoll } from 'react-native';
import { PermissionsAndroid } from 'react-native';


import {
    MESSAGE_RECEIVED,
    SETUP_LOGGEDIN_USER,
    NETWORK_STATUS_CHANGED,
    QUEUED_MESSAGES_SENT,
    CURRENT_SCREEN_CHANGED
} from './types';

var thumbnailUri = '';
var isThumbnail = false;

export const setupLoggedinUser = (user) => {
    return {
        type: SETUP_LOGGEDIN_USER,
        payload: user
    };
}

const userMessagesRef = null;

export const startMessagesListener = loggedinUser => (dispatch) => {
    console.log('Messages listener started...' + loggedinUser.uid);
    setupFilesDirectory();
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
                    _id: msgData._id,
                    text: msgData.text,
                    createdAt: new Date(msgData.createdAt),
                    status: msgData.status,
                    type: msgData.type,
                    image: msgData.image,
                    video: msgData.video,
                    location: msgData.location,
                    document: msgData.document
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
                    console.log('rec_msg_id : ' + msgData._id);
                    dispatch(messageRecieved(msg, loggedinUser, senderUser));
                }, (error) => {
                    console.log('erro: ' + error);
                });
            });
            //console.log('end messageRef for!');
        });
    });
}

const messageRecieved = (message, loggedinUser, senderUser) => {
    message.user = { _id: 2, name: senderUser.username, avatar: require('../../imgz/noimg.png') };
    message.sent = true;
    message.received = true;

    return (dispatch) => {
        if (message.type == CONSTANTS.MESSAGE_TYPE_TEXT) {
            backend.saveMessage(message);
            backend.updateMessage(message);
            dispatch({
                type: MESSAGE_RECEIVED,
                message: message,
                senderUid: senderUser.uid
            })
        } else if (message.type == CONSTANTS.MESSAGE_TYPE_IMAGE) {
            proccessImage(dispatch, message, loggedinUser, senderUser);
        }
    }
}

/*
const proccessThumbnail = (message, loggedinUser, senderUser) => {
    backend.getFileDownloadURL(loggedinUser.uid, message.image).then((url) => {
        RNFetchBlob.config({ path: RNFetchBlob.fs.dirs.CacheDir + '/' + message.image, })
            .fetch('GET', url, {
            }).then((res) => {
                console.log('The file saved to ', res.path());
                thumbnailUri = res.path();
                isThumbnail = true;
                thumbnailMessageUid = message.uid;
            }).catch((err) => {
                console.log('Error downloading thumnail');
                console.log(err);
                isThumbnail = false;
            });
    }).catch((err) => {
        console.log('Error getting thumnail url');
        console.log(err);
        isThumbnail = false;
    });
}
*/

const proccessImage = (dispatch, message, loggedinUser, senderUser) => {
    console.log('image message received: ');
    var msgText = message.text;
    backend.getFileDownloadURL(loggedinUser.uid, message.image).then((url) => {
        RNFetchBlob.config({ path: RNFetchBlob.fs.dirs.CacheDir + '/' + message.image, })
            .fetch('GET', url, {
                //'Content-Type': 'image/jpeg'
            }).progress({ count: 1 }, (received, total) => {
                console.log('progress', received / total);
                message.text = 'Downloading image...';
                message.progressMessage = true;
                message.progress = received / total;
                message.image = undefined;
                /*if (isThumbnail === true) {
                    message.thumbnailUri = thumbnailUri;
                }*/

                if (received <= total) {
                    dispatch({
                        type: MESSAGE_RECEIVED,
                        message: message,
                    });
                }
            }).then((res) => {
                console.log('The file saved to ', res.path());
                message.text = msgText;
                message.image = res.path();
                if (Platform.OS === 'ios') {
                    saveImageOnIOS(dispatch, message);
                } else {
                    saveImageOnAndroid(dispatch, message);
                }

            }).catch((err) => {
                console.log('Error downloading image');
                console.log(err);
            });
    }).catch((err) => {
        console.log('Error getting image url');
        console.log(err);
    });
}


const saveImageOnIOS = (dispatch, message) => {
    CameraRoll.saveToCameraRoll(message.image).then(res => {
        message.image = res;
        message.progressMessage = false;
        backend.saveMessage(message);
        backend.updateMessage(message);
        dispatch({
            type: MESSAGE_RECEIVED,
            message: message
        })
    }).catch(err => {
        console.log('error: ' + err);
    });
}

async function saveImageOnAndroid(dispatch, message) {
    var newImagePath = CONSTANTS.IMAGES_DIRECTORY + getFileNameFromPath(message.image);
    const granted = await requestExternalPermission();
    if (granted === true) {
        RNFetchBlob.fs.cp(message.image, newImagePath)
            .then(() => {
                message.progressMessage = false;
                message.image = CONSTANTS.ANDROID_FILE_PREFIX + newImagePath;
                backend.saveMessage(message);
                backend.updateMessage(message);
                console.log('newimgpath: ', message.image);
                dispatch({
                    type: MESSAGE_RECEIVED,
                    message: message
                })
            })
            .catch((err) => {
                console.log('error: ' + err);
            })
    } else {
        console.log("Permission denied");
        alert('You cant send/recieve pictures unless you grant RNChat app external storage permission');
    }
}

const getFileNameFromPath = (path) => {
    return path.substring(path.lastIndexOf('/') + 1)
}

export async function setupFilesDirectory() {
    if (Platform.OS === 'android') {
        //maybe later
        const granted = await requestExternalPermission();
        console.log('permossions returned: ', granted);
        if (granted) {
            RNFetchBlob.fs.exists(CONSTANTS.IMAGES_DIRECTORY)
                .then((exist) => {
                    console.log('files directory exist' + exist);
                    if (exist === false) {
                        RNFetchBlob.fs.mkdir(CONSTANTS.IMAGES_DIRECTORY)
                            .then(() => { console.log('files directory created'); })
                            .catch((err) => { console.log(err); })
                    }
                }).catch((err) => {
                    console.log(err);
                })
        } else {
            console.log("Permission denied 1");
            alert('You cant send/recieve pictures unless you grant RNChat app external storage permission');
        }
    }
}

export const stopMessagesListener = () => {
    if (userMessagesRef) {
        userMessagesRef.off();
    }
}

export const sendQueuedMessages = () => {
    var queuedMessages = backend.getQueuedMessages();

    return (dispatch) => {
        queuedMessages.forEach((message) => {
            backend.sendQueuedMessage(dispatch, message);
        });
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


async function requestExternalPermission() {
    const readPerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    const writePerm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    console.log('permissions: ', readPerm, writePerm);
    if (readPerm === true && writePerm === true) {
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