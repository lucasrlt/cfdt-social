import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Avatar} from '../components/Avatar';
import TextC from '../components/TextC';
import api from '../constants/api';
import {gs} from '../constants/styles';
import useApi from '../hooks/useApi';
import {date_to_string} from '../utils';
import EditIcon from '../../assets/chat_white.svg';
import {Button} from '../components/Button';

const ChatsScreen = props => {
  const [conversations, isLoading, updateConversations, setConversations] =
    useApi(api.chat_get_conversations);

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (isFocused) {
      const stack = navigation.dangerouslyGetParent();
      stack.setOptions({
        headerRight: null,
      });
    }
  }, [isFocused]);

  React.useEffect(() => {
    const itv = setInterval(() => {
      updateConversations();
    }, 30000);

    return () => clearInterval(itv);
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!isLoading || isFocused) {
        // Put a tag when conversations have unread messages
        const previousUpdates = await AsyncStorage.getItem('conv-updates');
        const updates = JSON.parse(previousUpdates) || {};

        const updatedConversations = conversations.map(conv => ({
          ...conv,
          hasUpdate:
            !updates[conv.withUser._id] ||
            new Date(updates[conv.withUser._id]) < new Date(conv.lastUpdate),
        }));

        setConversations(updatedConversations);
      }
    })();
  }, [isLoading, isFocused]);

  const onOpenConversation = withUser => async () => {
    // When viewing messages, store the last time when the message was viewed
    // to show notification in case of a new message
    try {
      navigation.navigate('ConversationScreen', {withUser});
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={item => item.withUser._id}
        ListEmptyComponent={() => (
          <TextC style={[gs.subtitle, {textAlign: 'center', marginTop: '80%'}]}>
            Il n'y a aucune conversation à afficher
          </TextC>
        )}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.cardContainer}
            onPress={onOpenConversation(item.withUser)}>
            <Avatar remote uri={item.withUser.avatar_uri} />
            <View style={gs.flex(1)}>
              <View style={styles.headerRow}>
                <TextC style={styles.headerUsername}>
                  {item.withUser.username.substring(0, 17)}
                  {item.withUser.username.length > 17 && (
                    <TextC style={styles.headerUsernameSub}>...</TextC>
                  )}
                </TextC>
                <TextC style={[gs.subtitle, {fontSize: 10}]}>
                  le {date_to_string(item.lastUpdate, true)}
                </TextC>
                {item.hasUpdate && <View style={styles.updateCircle} />}
              </View>
              <TextC style={styles.message}>
                {item.message.substring(0, 150)}
              </TextC>
            </View>
          </TouchableOpacity>
        )}
        refreshing={isLoading}
        onRefresh={updateConversations}
      />

      <TouchableOpacity
        style={styles.chatBubble}
        onPress={() => navigation.navigate('NewMessage')}>
        <EditIcon fill="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  editButton: {padding: 0, marginRight: 14},
  container: {flex: 1, backgroundColor: 'white'},
  cardContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  message: {
    marginLeft: 15,
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  updateCircle: {
    marginLeft: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: gs.colors.primary,
  },
  chatBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: gs.colors.primary,
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {flexDirection: 'row', alignItems: 'center'},
  headerUsername: {flexGrow: 1, color: 'black', fontSize: 16, marginLeft: 15},
});

export default ChatsScreen;
