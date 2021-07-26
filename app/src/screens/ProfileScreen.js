import {useIsFocused} from '@react-navigation/native';
import axios from 'axios';
import React from 'react';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Avatar} from '../components/Avatar';
import {Button} from '../components/Button';
import TextC from '../components/TextC';
import TextInputC from '../components/TextInputC';
import api from '../constants/api';
import {gs} from '../constants/styles';
import {AuthContext} from '../context/AuthProvider';
import {pickImageFromGallery} from '../utils/profile_edition';

const ProfileScreen = props => {
  const authContext = React.useContext(AuthContext);
  const {user} = authContext;

  const isFocused = useIsFocused();
  const [avatar, setAvatar] = React.useState(null);
  const [username, setUsername] = React.useState(user.username);

  React.useEffect(() => {
    if (!isFocused) {
      setAvatar(null);
      setUsername(user.username);
    }
  }, [user.avatar_uri, user.username, isFocused]);

  const updateAvatar = async () => {
    const result = await pickImageFromGallery();
    if (result) {
      setAvatar(result);
    }
  };

  const onSubmitProfileUpdate = async () => {
    try {
      const data = new FormData();
      data.append('username', username);
      if (avatar && avatar.fromGallery) {
        data.append('avatar', avatar);
      }

      const res = await axios.post(api.user_update_profile, data);
      if (res.status === 200) {
        authContext.update_token(res.data.jwt);
        Alert.alert('', 'Votre profil a bien été mis à jour.');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('', err.response.data);
    }
  };

  return (
    <View style={gs.containers.primary}>
      <TextC style={gs.title}>Modification du profil</TextC>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={updateAvatar}>
          <Avatar style={styles.avatar} source={avatar} />
        </TouchableOpacity>
        <View style={gs.flex(1)}>
          <TextInputC
            theme="light"
            label="Nom d'utilisateur"
            outline
            noMargin
            value={username}
            onChangeText={val => setUsername(val)}
          />
          <Button
            style={styles.submitButton}
            fontSize={gs.font.normal}
            onPress={onSubmitProfileUpdate}>
            Valider
          </Button>
          <Button
            isText
            fontSize={12}
            style={styles.logoutButton}
            onPress={authContext.logout}
            textAlign="right">
            Se déconnecter
          </Button>
        </View>
      </View>
      <View>
        <TextC style={gs.title}>Votre activité</TextC>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    marginTop: 10,
    flexDirection: 'row',
  },
  avatar: {
    width: 90,
    height: 90,
    marginTop: 10,
    marginRight: 20,
  },
  submitButton: {
    padding: 2,
  },
  logoutButton: {
    padding: 20,
    marginBottom: 20,
  },
});

export default ProfileScreen;
