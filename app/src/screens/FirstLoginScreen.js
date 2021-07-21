import React from 'react';
import {View, Image, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {AuthContext} from '../context/AuthProvider';
import {gs} from '../constants/styles';
import {ScrollView} from 'react-native-gesture-handler';
import TextInputC from '../components/TextInputC';
import cfdt_logo from '../../assets/cfdt_logo.png';
import profile_avatar from '../../assets/add_picture.png';
import {Button} from '../components/Button';
import TextC from '../components/TextC';
import * as ImagePicker from 'expo-image-picker';
import strings from '../../strings.json';
import axios from 'axios';
import api from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FirstLoginScreen = () => {
  const authContext = React.useContext(AuthContext);

  const [username, setUsername] = React.useState(authContext.user.username);
  const [password, setPassword] = React.useState('');
  const [password2, setPassword2] = React.useState('');
  const [avatar, setAvatar] = React.useState(profile_avatar);

  const addProfileImage = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissions', strings.permissions.image_picker);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 3],
      quality: 0.25,
    });

    if (!result.cancelled) {
      setAvatar({
        uri: result.uri,
        name: result.uri.split('/')[result.uri.split('/').length - 1],
        type: 'image/jpeg',
      });
    }
  };

  const onSubmitProfile = async () => {
    if (password !== password2) {
      Alert.alert(strings.alerts.error_title, strings.alerts.unequal_password);
    } else {
      try {
        const data = new FormData();
        data.append('username', username);
        data.append('password', password);
        console.log(avatar);
        data.append('avatar', avatar);
        const res = await axios.post(api.user_setup_profile, data);
        if (res.status === 200) {
          authContext.validateUserSetup();
        }
      } catch (err) {
        console.log(err.response);
        Alert.alert('', err.response.data);
      }
    }
  };

  // authContext.logout();
  return (
    <View style={gs.containers.primary_fill}>
      <ScrollView>
        <View style={styles.container}>
          <View style={gs.center}>
            <Image source={cfdt_logo} style={styles.logo} />
          </View>

          <View style={gs.center}>
            <TextC style={[gs.c_white, gs.bold, styles.title]}>
              Première connexion
            </TextC>
            <TextC style={[gs.c_white, gs.center, gs.small_margin]}>
              Choisissez comment vous apparaîtrez sur le réseau.
            </TextC>
            <TextC style={[gs.c_white, gs.center, gs.small_margin]}>
              Ces options sont modifiables sur votre profil par la suite.
            </TextC>
          </View>

          <View style={styles.user_container}>
            <TouchableOpacity onPress={addProfileImage}>
              <Image source={avatar} style={styles.user_pic} />
            </TouchableOpacity>
            <View style={gs.flex(1)}>
              <TextInputC
                label="Nom d'utilisateur"
                placeholder="Nom d'utilisateur"
                theme="light"
                value={username}
                style={[styles.textInput]}
                onChangeText={usr => setUsername(usr)}
              />
            </View>
          </View>

          <TextInputC
            label="Nouveau mot de passe"
            secureTextEntry
            autoCapitalize="none"
            autoCompleteType="password"
            theme="light"
            placeholder="Mot de passe"
            value={password}
            style={styles.textInput}
            onChangeText={pwd => setPassword(pwd)}
          />

          <TextInputC
            label="Confirmation du mot de passe"
            secureTextEntry
            autoCapitalize="none"
            autoCompleteType="password"
            theme="light"
            placeholder="Mot de passe"
            value={password2}
            style={styles.textInput}
            onChangeText={pwd => setPassword2(pwd)}
          />

          <Button outline style={styles.button} onPress={onSubmitProfile}>
            Valider
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {height: 115, width: 115},
  user_pic: {height: 85, width: 85, marginRight: 20, borderRadius: 100},
  container: {padding: gs.paddings.medium},
  user_container: {flexDirection: 'row', marginTop: gs.paddings.medium},
  textInput: {
    fontSize: 16,
  },
  button: {
    marginTop: gs.paddings.small,
  },
  title: {
    fontSize: 18,
    marginTop: gs.paddings.large - 5,
  },
});

export default FirstLoginScreen;
