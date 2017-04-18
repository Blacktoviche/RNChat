import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    View
} from 'react-native';
import {
    Spinner
} from 'native-base';
import * as Progress from 'react-native-progress';

export default class ProgressMessage extends Component {

    render() {
        const message = this.props.currentMessage;
        if (message.progressMessage === true) {
            return (
                <View style={{
                    width: 200,
                    height: 150,
                    borderRadius: 1,
                    margin: 3,
                }}>
                    <Progress.Circle progress={message.progress} size={150} direction={'counter-clockwise'} thickness={10}
                        style={{ alignItems: 'center' }} color={'black'} unfilledColor={'white'} />
                </View>
            );
        }
        return null;

    }
}

ProgressMessage.defaultProps = {
    currentMessage: {},
};

ProgressMessage.propTypes = {
    currentMessage: React.PropTypes.object,
};