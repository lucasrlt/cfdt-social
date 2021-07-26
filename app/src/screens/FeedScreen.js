import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {View, Image} from 'react-native';
import {Avatar} from '../components/Avatar';
import {Button} from '../components/Button';
import PostsFeed from '../components/PostsFeed/PostsFeed';
import TextC from '../components/TextC';
import api from '../constants/api';
import {gs} from '../constants/styles';
import {AuthContext} from '../context/AuthProvider';

const FeedScreen = () => {
  const authContext = React.useContext(AuthContext);

  return (
    <View style={[gs.containers.primary, {padding: 0}]}>
      <PostsFeed />
    </View>
  );
};

export default FeedScreen;
