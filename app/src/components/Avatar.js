import React from 'react';
import {Image} from 'react-native';
import api from '../constants/api';
import {AuthContext} from '../context/AuthProvider';

export const Avatar = props => {
  const authContext = React.useContext(AuthContext);
  const {user} = authContext;

  const source = user.avatar_uri
    ? {uri: api.user_avatar + '?file=' + user.avatar_uri}
    : require('../../assets/profile_avatar.png');

  return <Image {...props} source={source} />;
};
