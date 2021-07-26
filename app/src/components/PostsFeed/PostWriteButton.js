import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import TextInputC from '../TextInputC';

const PostWriteButton = ({onCreatePost}) => {
  const navigation = useNavigation();
  const onPress = () => {
    navigation.navigate('PostWriting', {
      onGoBack: onCreatePost,
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{marginHorizontal: 20, marginTop: 10}}>
      <TextInputC
        placeholder="Ecrire une publication"
        underlineColorAndroid="transparent"
        pointerEvents="none"
        editable={false}
        theme="gray"
        style={{height: 50}}
      />
    </TouchableOpacity>
  );
};

export default PostWriteButton;
