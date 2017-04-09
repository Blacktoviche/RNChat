import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import reducers from './src/core/reducers';
import App from './src/App';
import { TabNavigator, StackNavigator } from 'react-navigation';
import { Spinner } from 'native-base';
import firebase from 'firebase';


export default class RNChat extends Component {

  componentWillMount() {
    firebase.initializeApp({
      apiKey: 'AIzaSyBqbqqy3Ai68d5m20CDdDYWBc5q94EvTWU',
      authDomain: 'rnsimplechat.firebaseapp.com',
      databaseURL: 'https://rnsimplechat.firebaseio.com',
      projectId: 'rnsimplechat',
      storageBucket: 'rnsimplechat.appspot.com',
      messagingSenderId: '997910728984'
    });
  }

  componentDidMount() {
  }


  render() {

    const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
    return (
      <Provider store={store}>
        <App />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('RNChat', () => RNChat);