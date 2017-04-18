import RNFetchBlob from 'react-native-fetch-blob'

//Used in Profile.js
export const NEW_PASSWORD_STATUS_INITIAL = 0;
export const NEW_PASSWORD_STATUS_SUCCESS = 1;
export const NEW_PASSWORD_STATUS_FAIL = 2;

//Message types
export const MESSAGE_TYPE_TEXT = 0;
export const MESSAGE_TYPE_IMAGE = 1;
export const MESSAGE_TYPE_VIDEO = 2;
export const MESSAGE_TYPE_LOCATION = 3;
export const MESSAGE_TYPE_DOCUMENT = 4;

//Message status
export const MESSAGE_STATUS_UNREAD = 0;
export const MESSAGE_STATUS_READ = 1;
export const IMAGES_DIRECTORY = RNFetchBlob.fs.dirs.PictureDir + '/RNChat/images/';
export const ANDROID_FILE_PREFIX = 'file://';

