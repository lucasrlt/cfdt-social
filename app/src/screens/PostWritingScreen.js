import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import {Button} from '../components/Button';
import Checkmark from '../../assets/checkmark.svg';
import {gs} from '../constants/styles';
import axios from 'axios';
import api from '../constants/api';
import {pickMediaFromGallery} from '../utils/profile_edition';
import {MediaTypeOptions} from 'expo-image-picker';
import {AuthContext} from '../context/AuthProvider';
import MediaRender from '../components/MediaRender';
import Poll from '../components/Poll';

const PostWritingScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const win = Dimensions.get('window');

  const {user} = React.useContext(AuthContext);

  const [inputHeight, setInputHeight] = useState(win.width * 0.3);
  const [content, setContent] = useState({
    text: '',
    poll: null,
    medias: [],
  });

  const onSubmit = async () => {
    try {
      const data = new FormData();

      data.append('text', content.text);
      data.append('poll', JSON.stringify(content.poll));
      content.medias.forEach(media => data.append('medias', media));

      const res = await axios.post(api.post_new, data);
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

  const onAddPoll = () => {
    navigation.navigate('PollCreation', {
      onSubmit: poll => {
        setContent({...content, poll});
      },
    });
  };

  const onAddMedia = mediaTypes => async () => {
    if (mediaTypes.length >= 10) {
      Alert.alert('', 'Vous ne pouvez pas importer plus de 10 photos/vidéos.');
      return;
    }

    const options = {
      mediaTypes,
      quality: 0.25,
      allowsEditing: true,
    };

    const file = await pickMediaFromGallery(options);
    if (file) {
      setContent(c => ({...c, medias: [...c.medias, file]}));
    }
  };

  const removeMedia = uri => () => {
    setContent(c => ({...c, medias: c.medias.filter(m => m.uri !== uri)}));
  };

  navigation.setOptions({
    headerRight: () => (
      <Button style={styles.validateButton} onPress={onSubmit}>
        <Checkmark fill="white" />
      </Button>
    ),
  });

  return (
    <ScrollView
      contentContainerStyle={[
        {backgroundColor: gs.colors.light_gray, flexGrow: 1},
      ]}>
      <TextInput
        placeholder="Ecrivez votre message ici..."
        textAlignVertical="top"
        style={[styles.input, {height: inputHeight}]}
        value={content}
        placeholderTextColor="#00000088"
        onChangeText={text => setContent(c => ({...c, text}))}
        onContentSizeChange={e =>
          setInputHeight(e.nativeEvent.contentSize.height)
        }
        multiline
      />

      {content.medias.length > 0 && (
        <View>
          <MediaRender
            medias={content.medias}
            isEditing
            onRemove={removeMedia}
            innerStyle={styles.mediaInnerStyle}
          />
        </View>
      )}

      {content.poll && (
        <View>
          <Poll {...content.poll} style={{margin: 10}} canVote={false} />
        </View>
      )}

      <View>
        {user.is_admin && (
          <Button fontSize={12} style={styles.button} onPress={onAddPoll}>
            Ajouter un sondage
          </Button>
        )}

        <Button
          style={styles.button}
          fontSize={12}
          onPress={onAddMedia(MediaTypeOptions.Images)}>
          Ajouter une image
        </Button>

        {user.is_admin && (
          <Button
            style={styles.button}
            fontSize={12}
            onPress={onAddMedia(MediaTypeOptions.Videos)}>
            Ajouter une vidéo
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  validateButton: {padding: 0, marginRight: 14},
  mediaInnerStyle: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    backgroundColor: gs.colors.light_gray,
    color: '#000000',
    padding: 20,
    flexGrow: 1,
  },
  button: {
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default PostWritingScreen;
