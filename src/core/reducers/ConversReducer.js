import {
    SETUP_LOGGEDIN_USER,
    MESSAGE_SENT,
    MESSAGE_RECEIVED,
    OPEN_CONVERSATION,
    SETUP_CONVERSATION,
    NETWORK_STATUS_CHANGED,
    IS_RECEIVER_CONTACT,
    SETUP_OLD_MESSAGES
} from '../actions/types';

const INITIAL_STATE = {
    currentChat: null,
    typingText: '',
    message: '',
    receiverName: '',
    receiverUID: '',
    isContact: false,
    messages: new Array(),
    loggedinUser: null,
    networkStatus: false,
    active: false
};

export default (state = INITIAL_STATE, action) => {

    switch (action.type) {
        case IS_RECEIVER_CONTACT:
            return { ...state, isContact: action.payload };
        case NETWORK_STATUS_CHANGED:
            return { ...state, networkStatus: action.payload };
        case SETUP_LOGGEDIN_USER:
            return { ...state, loggedinUser: action.payload };
        case SETUP_OLD_MESSAGES:
            return { ...state, ...state, messages: state.currentChat.append(new Array(), action.payload) };
        case MESSAGE_RECEIVED:
            if (state.receiverUID == action.senderUid) {
                return { ...state, messages: state.currentChat.append(state.messages, action.message) };
            } else {
                return { ...state };
            }
        case MESSAGE_SENT:
            return { ...state, messages: state.currentChat.append(state.messages, action.message) };
        case SETUP_CONVERSATION:
            return { ...state, receiverName: action.payload.name, receiverUID: action.payload.uid, currentChat: action.payload.currentChat };
        case OPEN_CONVERSATION:
            return { ...state, receiverName: action.payload.username, receiverUID: action.payload.uid };
        default:
            return state;
    }
};
