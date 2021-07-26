import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Alert} from 'react-native';
import {Button} from '../components/Button';
import Checkmark from '../../assets/checkmark.svg';
import {gs} from '../constants/styles';
import axios from 'axios';
import api from '../constants/api';

const PostWritingScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();

  const [content, setContent] = useState({
    text: '',
    poll: null,
    files: null,
  });

  const onSubmit = async () => {
    try {
      const res = await axios.post(api.post_new, content);
      if (res.status === 200) {
        route.params.onGoBack(res.data);
        navigation.goBack();
        Alert.alert('', 'Votre publication a bien été envoyée');
      }
    } catch (err) {
      console.log(err);
      if (err.response) {
        Alert.alert('', err.response.data);
      }
    }
  };

  navigation.setOptions({
    headerRight: () => (
      <Button style={styles.validateButton} onPress={onSubmit}>
        <Checkmark fill="white" />
      </Button>
    ),
  });

  return (
    <View style={[gs.flex(1), {backgroundColor: gs.colors.light_gray}]}>
      <TextInput
        placeholder="Ecrivez votre message ici..."
        textAlignVertical="top"
        style={styles.input}
        value={content}
        placeholderTextColor="#00000088"
        onChangeText={text => setContent(c => ({...c, text}))}
        multiline
      />
      <View>
        <Button fontSize={12} style={styles.button}>
          Ajouter un sondage
        </Button>
        <Button style={styles.button} fontSize={12}>
          Ajouter une image
        </Button>
        <Button style={styles.button} fontSize={12}>
          Ajouter une vidéo
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  validateButton: {padding: 0, marginRight: 14},
  input: {
    flex: 1,
    backgroundColor: gs.colors.light_gray,
    color: '#000000',
    padding: 20,
  },
  button: {
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default PostWritingScreen;
