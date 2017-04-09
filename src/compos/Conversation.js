import React, { Component } from 'react';
import { connect } from 'react-redux';
import { sendMessage, setupConversation, addContact, changeReceiverContactStatus } from '../core/actions';
import { Container, Content, Header, Footer, List, ListItem, Item, Input, Icon, Button, Text, Left, Body, Right, Title } from 'native-base';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, Actions, Bubble } from 'react-native-gifted-chat';
import * as backend from '../backend/Mediator';

class Conversation extends Component {

    static navigationOptions = {
        title: ({ state }) => `${state.params.receiver.username}`,
        header: {
            visible: false
        }
    };

    componentWillMount() {
        const { uid, username } = this.props.navigation.state.params.receiver;
        let oldMsgs = backend.getMessages(this.props.loggedinUser.uid, uid);
        console.log('old messages: ' + oldMsgs.length);
        this.props.setupConversation(username, uid, GiftedChat, this.props.loggedinUser, oldMsgs);
        this.props.changeReceiverContactStatus(backend.isContact(uid));
        const { email, photo } = this.props.navigation.state.params.receiver;
        this.props.addContact(uid, username, email, photo);
    }

    onSendMessage(messages = []) {
        const { loggedinUser, receiverUID, receiverName, networkStatus } = this.props;
        this.props.sendMessage(loggedinUser.uid, receiverUID, receiverName, messages, networkStatus);
    }

    onAddContact() {
        //const { uid, username, email, photo } = this.props.navigation.state.params.receiver;
        //this.props.addContact(uid, username, email);
    }

    renderContactAddButton() {
        if (this.props.isContact) {
            return (<Icon name='person' />);
        } else {
            return (<Button iconLeft light onPress={this.onAddContact.bind(this)} disabled={this.props.isContact}>
                <Icon name='person-add' />
            </Button>);
        }
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
    renderFooter() {
        //For User is typing
        /* if (this.props.typingText) {
             return (
                 <View style={styles.footerContainer}>
                     <Text style={styles.footerText}>
                         {this.props.typingText}
                     </Text>
                 </View>
             );
         }*/
        return null;
    }

    render() {
        const { uid, username, email } = this.props.navigation.state.params.receiver;
        return (
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
                        {this.renderContactAddButton()}
                    </Right>
                </Header>

                <GiftedChat
                    messages={this.props.messages}
                    onSend={this.onSendMessage.bind(this)}
                    user={{
                        _id: 1,
                        name: this.props.loggedinUser.username,
                        avatar: require('../imgz/noimg.png'),
                    }}
                    //loadEarlier={this.props.loadEarlier}
                    //onLoadEarlier={this.onLoadEarlier}
                    renderFooter={this.renderFooter}
                />
            </Container>
        );
    }
}

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
});

const mapStateToProps = ({ conversReducer }) => {
    const { currentChat, typingText, messages, message, receiverName, receiverUID, isContact, loggedinUser, networkStatus } = conversReducer;
    return { currentChat, typingText, messages, message, receiverName, receiverUID, isContact, loggedinUser, networkStatus };
};

export default connect(mapStateToProps, {
    sendMessage, setupConversation, addContact, changeReceiverContactStatus
})(Conversation);