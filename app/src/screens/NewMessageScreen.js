import {useNavigation} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Avatar} from '../components/Avatar';
import TextC from '../components/TextC';
import TextInputC from '../components/TextInputC';
import api from '../constants/api';
import useApi from '../hooks/useApi';

const NewMessageScreen = () => {
  const [users, isLoading] = useApi(api.users_all);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const filter = search.toLowerCase();
    return users.filter(user => {
      return user.username.toLowerCase().includes(filter);
    });
  }, [isLoading, search, users.length]);

  const navigation = useNavigation();
  const onWriteMessage = user => () => {
    navigation.goBack();
    navigation.navigate('ConversationScreen', {withUser: user});
  };

  return (
    <View style={styles.container}>
      <TextInputC
        theme="gray"
        placeholder="Chercher un utilisateur"
        value={search}
        onChangeText={setSearch}
        noMargin
        style={styles.textInput}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        refreshing={isLoading}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={onWriteMessage(item)}>
            <Avatar remote uri={item.avatar_uri} style={styles.avatar} />
            <TextC style={styles.username}>{item.username}</TextC>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  userCard: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#CCC',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  username: {fontSize: 18, color: 'black'},
  textInput: {height: 50, color: 'black'},
});

export default NewMessageScreen;
