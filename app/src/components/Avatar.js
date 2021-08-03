import React from 'react';
import {Image, StyleSheet} from 'react-native';
import api from '../constants/api';
import {AuthContext} from '../context/AuthProvider';

export const Avatar = ({remote, uri, size = 50, ...props}) => {
  const authContext = React.useContext(AuthContext);
  const {user} = authContext;

  const avatarSize = {width: size, height: size};

  const remote_uri = remote ? uri : user.avatar_uri;
  const source = remote_uri
    ? {uri: api.user_avatar + '?file=' + remote_uri}
    : require('../../assets/profile_avatar.png');

  return (
    <Image
      {...props}
      style={[styles.avatar, avatarSize, props.style]}
      source={props.source || source}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
  },
});
