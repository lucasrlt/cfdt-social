import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewBase,
} from 'react-native';
import TextC from '../components/TextC';
import TextInputC from '../components/TextInputC';
import api from '../constants/api';
import {gs} from '../constants/styles';
import useApi from '../hooks/useApi';
import SendIcon from '../../assets/send.svg';
import {Button} from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Avatar} from '../components/Avatar';
import {AuthContext} from '../context/AuthProvider';
import {date_to_string} from '../utils';

const Wrapper = props =>
  Platform.OS === 'ios' ? (
    <KeyboardAvoidingView
      style={[gs.containers.primary, {paddingTop: 0}]}
      behavior="padding">
      {props.children}
    </KeyboardAvoidingView>
  ) : (
    <View style={[gs.containers.primary, {paddingTop: 0}]}>
      {props.children}
    </View>
  );

const ConversationScreen = props => {
  const route = useRoute();
  const navigation = useNavigation();
  const {user} = useContext(AuthContext);
  const {withUser} = route.params;

  const isFocused = useIsFocused();
  const [messages, isLoading, fetchMessages] = useApi(
    api.chat_get_messages + '?withUser=' + withUser._id,
  );

  const [inputHeight, setInputHeight] = useState(50);
  const [message, setMessage] = useState('');
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  useEffect(() => {
    const itv = setInterval(() => {
      fetchMessages();
    }, 30000);

    const ksl = Keyboard.addListener('keyboardWillShow', () =>
      setIsKeyboardShown(true),
    );
    const khl = Keyboard.addListener('keyboardWillHide', () =>
      setIsKeyboardShown(false),
    );

    return () => {
      Keyboard.removeSubscription(ksl);
      Keyboard.removeSubscription(khl);
      clearInterval(itv);
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({headerTitle: withUser.username});
  }, [withUser.username]);

  useEffect(() => {
    (async () => {
      const previousUpdates = await AsyncStorage.getItem('conv-updates');
      let updates = previousUpdates === null ? {} : JSON.parse(previousUpdates);
      updates[withUser._id] = Date.now();
      await AsyncStorage.setItem('conv-updates', JSON.stringify(updates));
    })();
  }, [isFocused, withUser._id]);

  const sendMessage = async () => {
    try {
      const res = await axios.post(api.chat_new_message, {
        to: withUser._id,
        message,
      });
      if (res.status === 200) {
        fetchMessages();
        setMessage('');
      }
    } catch (err) {
      Alert.alert('', 'Il y a eu une erreur');
    }
  };

  return (
    <Wrapper>
      <FlatList
        inverted
        keyExtractor={item => item._id}
        data={messages}
        refreshing={isLoading}
        onRefresh={fetchMessages}
        ListEmptyComponent={() => (
          <View
            style={{
              transform: [{scaleX: 1}, {scaleY: -1}],
            }}>
            <TextC
              style={[gs.subtitle, {marginBottom: '90%', textAlign: 'center'}]}>
              {"Il n'y a aucun message à afficher pour cette conversation"}
            </TextC>
          </View>
        )}
        renderItem={({item}) => {
          const isFromSelf = user._id === item.from;
          const date = date_to_string(item.created, true).split('à');

          return (
            <View
              style={[
                styles.messageContainer,
                {flexDirection: isFromSelf ? 'row-reverse' : 'row'},
              ]}>
              <Avatar
                remote
                uri={isFromSelf ? user.avatar_uri : withUser.avatar_uri}
                size={30}
              />
              <View
                style={[
                  styles.messageContent,
                  {
                    backgroundColor: isFromSelf
                      ? gs.colors.primary + '99'
                      : '#97979733',
                    maxWidth: Dimensions.get('window').width * 0.6,
                  },
                ]}>
                <TextC style={{color: isFromSelf ? 'white' : 'black'}}>
                  {item.message}
                </TextC>
              </View>
              <View>
                <TextC style={styles.messageTime}>
                  {date[0].substring(0, 5)} à{date[1]}
                </TextC>
                {/* <TextC style={styles.messageTime}> {date[1]}</TextC> */}
              </View>
            </View>
          );
        }}
      />

      <View style={styles.newMessageContainer} behavior="position">
        <View style={gs.flex(1)}>
          <TextInputC
            theme="gray"
            underlineColorAndroid="transparent"
            placeholder="Ecrivez votre message ici"
            multiline
            onContentSizeChange={e =>
              setInputHeight(Math.max(50, e.nativeEvent.contentSize.height))
            }
            value={message}
            onChangeText={text => setMessage(text)}
            style={{height: inputHeight, color: 'black'}}
            noMargin
          />
        </View>
        <Button
          style={styles.sendButton}
          disabled={!message}
          onPress={sendMessage}>
          <SendIcon fill="white" width={15} height={15} />
        </Button>
      </View>
      {Platform.OS === 'ios' && (
        <View style={{height: isKeyboardShown ? 70 + 34 : 10}} />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  newMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  sendButton: {
    padding: 8,
    marginLeft: 10,
    marginBottom: 0,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 5,
    marginBottom: 10,
  },
  messageContent: {
    borderRadius: 8,
    marginHorizontal: 10,
    padding: 10,
    color: '#333',
  },
  messageTime: {
    fontSize: 8,
    color: gs.colors.subtitle,
  },
});

export default ConversationScreen;
