import React, { Component } from 'react';
import { connect } from 'react-redux';
import uuid from 'react-native-uuid';
import * as backend from '../backend/Mediator';
import {
    sendTextMessage, setupConversation, addContact, changeReceiverContactStatus, showImageModal,
    hideImageModal, imageMessageTextChanged, sendImageMessage
} from '../core/actions';
import {
    Container, Content, Header, Footer, Card, CardItem, ListItem, Item,
    Input, Icon, Button, Text, Left, Body, Right, Title, Spinner, Fab
} from 'native-base';
import { Platform, View, StyleSheet, Modal, Image } from 'react-native';
import { GiftedChat, Actions, Bubble } from 'react-native-gifted-chat';
import {
    MenuContext,
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
    renderers
} from 'react-native-popup-menu';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import ImagePicker from 'react-native-image-crop-picker';
import ProgressMessage from './ProgressMessage';


class Conversation extends Component {

    static navigationOptions = {
        title: ({ state }) => `${state.params.receiver.username}`,
        header: {
            visible: false
        }
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        const { uid, username } = this.props.navigation.state.params.receiver;
        let oldMsgs = backend.getMessages(this.props.loggedinUser.uid, uid);
        console.log('old messages: ' + oldMsgs.length);
        this.props.setupConversation(username, uid, GiftedChat, this.props.loggedinUser, oldMsgs);
        this.props.changeReceiverContactStatus(backend.isContact(uid));
        const { email, photo } = this.props.navigation.state.params.receiver;
        this.props.addContact(uid, username, email, photo);
    }

    onSendTextMessage(messages = []) {
        const { loggedinUser, receiverUID, receiverName, networkStatus } = this.props;
        messages.forEach((message) => {
            message.title = receiverName;
            message.uidFrom = loggedinUser.uid;
            message.uidTo = receiverUID;
            this.props.sendTextMessage(message, networkStatus);
        });
    }

    onSendImageMessage() {
        const { loggedinUser, receiverUID, receiverName, networkStatus } = this.props;
        let message = {
            _id: uuid.v4(),
            text: this.props.imageMessageText,
            createdAt: new Date(),
            user: { _id: 1, name: this.props.loggedinUser.username },
            image: this.props.imagePath,
            imageName: this.props.imagePath.substring(this.props.imagePath.lastIndexOf('/') + 1),
            title: receiverName,
            uidFrom: loggedinUser.uid,
            uidTo: receiverUID
        };
        this.props.sendImageMessage(message, networkStatus);
    }

    onAddContact() {
        //const { uid, username, email, photo } = this.props.navigation.state.params.receiver;
        //this.props.addContact(uid, username, email);
    }

    onOpenImagePicker() {
        console.log('image picker opens');
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            mediaType: 'photo'
        }).then(image => {
            console.log(image);
            this.props.showImageModal(image.path);
        }).catch(err => {
            console.log('cancel image picker: ' + err);
        });
    }

    onOpenCameraPicker() {
        console.log('camera picker opens');
        ImagePicker.openCamera({
            width: 300,
            height: 400,
            mediaType: 'photo'
        }).then(image => {
            console.log(image);
            this.props.showImageModal(image.path);
            /*let imgName = image.path.substring(image.path.lastIndexOf('/') + 1);
            let newPath = IMAGES_DIRECTORY  + imgName;
            RNFetchBlob.fs.cp(image.path, newPath)
                .then(() => {
                    console.log('image copied: ' + newPath);
                    if (Platform.OS === 'ios') {
                        this.props.showImageModal(newPath);
                    } else {
                        this.props.showImageModal(CONSTANTS.ANDROID_FILE_PREFIX  + newPath);
                    }

                })
                .catch((error) => { console.log(error); })*/
        }).catch(err => {
            alert('Camera use permission required!');
            console.log('cancel image picker: ' + err);
        });
    }

    renderAttachmentButton() {
        return (<Button onPress={this.onOpenImagePicker.bind(this)}>
            <Icon name='attach' />
        </Button>);
    }

    onCloseImageModal() {
        this.props.hideImageModal();
    }

    onImageMessageTextChanged(imageMessageText) {
        this.props.imageMessageTextChanged(imageMessageText);
    }

    renderCustomActions(props) {
        return (
            <Button style={{ backgroundColor: '#34A34F' }} onPress={() => this.onOpenImagePicker}>
                <Icon name="logo-whatsapp" />
            </Button>
        );
    }


    renderSpinner(props) {
        return (
            <ProgressMessage
                {...props}
            />
        );
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#f0f0f0',
                    }
                }}
            />
        );
    }

    render() {
        const { uid, username, email } = this.props.navigation.state.params.receiver;
        return (
            <MenuContext customStyles={menuContextStyles} render={renderers.SlideInMenu}>
                <Container>
                    <Header>
                        <Left>
                            <Button transparent onPress={() => this.props.navigation.goBack()}>
                                <Icon name='arrow-back' />
                            </Button>
                        </Left>
                        <Body>
                            <Title>{username}</Title>
                        </Body>
                        <Right>
                            <Menu>
                                <MenuTrigger customStyles={{ flex: 1 }}>
                                    <Icon name='ios-attach' />
                                </MenuTrigger>
                                <MenuOptions customStyles={optionsStyles}>
                                    <MenuOption onSelect={() => this.onOpenCameraPicker()} customStyles={{ flex: 1, alignItems: 'center', }}>
                                        <Icon name='ios-camera' />
                                    </MenuOption>
                                    <MenuOption onSelect={() => this.onOpenImagePicker()} customStyles={{ flex: 1, alignItems: 'center', }}>
                                        <Icon name='ios-photos' />
                                    </MenuOption>
                                </MenuOptions>
                            </Menu>
                        </Right>
                    </Header>
                    <Modal
                        animationType={"slide"}
                        transparent={true}
                        visible={this.props.imageModalVisible}
                        onRequestClose={() => { this.onCloseImageModal() }}>
                        <View style={imageModalStyle}>
                            <Image source={{ uri: this.props.imagePath }}
                                style={imagePreviewStyle} resizeMode='contain' />
                            <View style={imageViewStyle}>
                                <Input style={inputTextStyle} placeholder='Type a message..'
                                    value={this.props.imageMessageText} onChangeText={this.onImageMessageTextChanged.bind(this)} />
                                <Button style={{ flex: 2 }} rounded outline light bordered onPress={() => this.onSendImageMessage()}>
                                    <Text style={{ alignItems: 'center' }}>Send</Text>
                                    <Icon name='ios-send' />
                                </Button>
                                <KeyboardSpacer />
                            </View>
                        </View>
                    </Modal>
                    <GiftedChat
                        messages={this.props.messages}
                        onSend={this.onSendTextMessage.bind(this)}
                        user={{
                            _id: 1,
                            name: this.props.loggedinUser.username
                        }}
                        //renderBubble={this.renderBubble}
                        renderCustomView={this.renderSpinner}
                    />
                </Container>
            </MenuContext>
        );
    }
}

const optionsStyles = {
    optionsContainer: {
        padding: 5,
        width: 50,
        flexDirection: 'row',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    optionsWrapper: {
    },
    optionWrapper: {
        margin: 5,
    },
    optionTouchable: {
        activeOpacity: 70,
    },
    optionText: {
    },
};

const styles = StyleSheet.create({
    footerContainer: {
        marginTop: 5,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
    },
    footerText: {
        fontSize: 14,
        color: '#aaa',
    },
    container: {
        flexDirection: 'row',
    },
    backdrop: {
        opacity: 0.5,
    },
});

const inputTextStyle = {
    flex: 10,
    borderBottomWidth: 1,
    marginLeft: 4,
    color: 'white'

};
const imagePreviewStyle = {
    width: 300,
    height: 400,
    flex: 8,
    alignItems: 'center'
};
const imageViewStyle = {
    flex: 2,
    flexDirection: 'row'
};
const imageModalStyle = {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)'
}

const menuContextStyles = {
    menuContextWrapper: styles.container,
    backdrop: styles.backdrop,
};

const mapStateToProps = ({ conversReducer }) => {
    const { currentChat, typingText, messages, message, receiverName,
        receiverUID, isContact, loggedinUser, networkStatus, imageModalVisible, imagePath, imageMessageText, viewProgress } = conversReducer;
    return {
        currentChat, typingText, messages, message, receiverName,
        receiverUID, isContact, loggedinUser, networkStatus, imageModalVisible, imagePath, imageMessageText, viewProgress
    };
};

export default connect(mapStateToProps, {
    sendTextMessage, setupConversation, addContact,
    changeReceiverContactStatus, showImageModal, hideImageModal, imageMessageTextChanged, sendImageMessage
})(Conversation);