import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Image} from 'react-native';
import {Avatar} from '../components/Avatar';
import {Button} from '../components/Button';
import TextC from '../components/TextC';
import api from '../constants/api';
import {AuthContext} from '../context/AuthProvider';

const CfdtNewsScreen = () => {
  const authContext = React.useContext(AuthContext);

  const navigation = useNavigation();

  console.log(api.user_avatar + '?file=' + authContext.user.avatar_uri);

  return (
    <View>
      <TextC>Ramenez la coupe laaa {JSON.stringify(authContext.user)}</TextC>
      <Avatar style={{width: 50, height: 50}} />
      <Button onPress={authContext.logout}>Deco</Button>
    </View>
  );
};

export default CfdtNewsScreen;
