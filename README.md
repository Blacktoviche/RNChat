### RNChat

RNChat is simple chat app for android & iOS using the power of react native & redux 
RNChat uses firebase as online db & Realm as local db and it's full implemented redux actions & reducers
This is my first react native project so don't expect too much professinality :)


## Note
As the gifted chat component doesn't support editing message which I needed it for the progress message
So I had to change append function in Gifted Chat component so when I add message with the same _id the component will replace the old message with the new one

The change is here
```js
import { Map } from 'immutable';
const messagesMap = new Map();

  static append(currentMessages = [], messages) {
    if (!Array.isArray(messages)) {
      messages = [messages];
    }

    messages.forEach((message) => {
      messagesMap = messagesMap.set(message._id, message);
    });
    return messagesMap.sortBy(msg => msg.createdAt).reverse().toArray();
  }
```

![](https://raw.githubusercontent.com/Blacktoviche/RNChat/master/screenshot/receiveInAndroid.gif) ![](https://raw.githubusercontent.com/Blacktoviche/RNChat/master/screenshot/sendFromiOS)


## Requirements

- [Firebase](https://firebase.google.com)
- [Realm](https://github.com/realm/realm-js)
- [NativeBase](https://github.com/GeekyAnts/NativeBase)
- [Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat)
- [React Navigation](https://github.com/react-community/react-navigation)
- [node-uuid for react-native](https://github.com/eugenehp/react-native-uuid)
- [Immutable](https://github.com/facebook/immutable-js)
- [Popup menu](https://github.com/instea/react-native-popup-menu)
- [Progress indicators](https://github.com/oblador/react-native-progress)

## Installation
- Clone this repo
- `npm install`
- `react-native link`
- 'You have to setup permissions in xcode & AndroidManifest.xml, go to the components I used to know how'
- `react-native run-android/run-ios`

## TODO
- [x] send/receive Text
- [x] send/receive Photos
- [ ] send/receive Recorded Sound 
- [ ] send/receive Videos
- [ ] send/receive Documents
- [ ] send/receive Locations