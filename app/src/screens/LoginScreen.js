import React from 'react';
import {View, Linking, StyleSheet, Image, Alert} from 'react-native';
import {Button} from '../components/Button';
import {AuthContext} from '../context/AuthProvider';
import TextInputC from '../components/TextInputC';
import {gs} from '../constants/styles';
import TextC from '../components/TextC';
import api from '../constants/api';
import cfdt_logo from '../../assets/cfdt_logo.png';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import axios from 'axios';
import strings from '../../strings.json';
const LoginScreen = () => {
  const authContext = React.useContext(AuthContext);

  const [npa, setNpa] = React.useState('');
  const [password, setPassword] = React.useState('');

  // Open a webpage going to the adhesion page
  const openOnlineAdhesion = () => {
    Linking.openURL(api.adhesion_page);
  };

  const onResetPassword = async () => {
    if (!npa) {
      Alert.alert(
        'Erreur',
        "Merci d'entrer votre numéro personnel d'adhérent.",
      );
      return;
    }

    try {
      const res = await axios.get(api.user_reset_password + '?npa=' + npa);
      if (res.status === 200) {
        if (!Boolean(res.data)) {
          Alert.alert(
            'Réinitialisation réussie',
            strings.alerts.npa_check.body,
          );
        }
      }
    } catch (err) {
      Alert.alert('', err.response.data);
    }
  };

  return (
    <View style={gs.containers.primary_fill}>
      <ScrollView>
        <View style={styles.scrollview}>
          <View style={gs.center}>
            <Image source={cfdt_logo} style={styles.logo} />
          </View>

          <TextInputC
            keyboardType="number-pad"
            autoCOmpleteType="off"
            placeholder="1234567"
            theme="light"
            label="NPA"
            value={npa}
            style={styles.textInput}
            onChangeText={npa => {
              setNpa(npa);
              authContext.resetCanLogin();
            }}
          />

          {authContext.canLogin && (
            <View>
              <TextInputC
                label="Mot de passe"
                secureTextEntry
                autoCapitalize="none"
                autoCompleteType="password"
                theme="light"
                placeholder="Mot de passe"
                value={password}
                style={styles.textInput}
                onChangeText={password => setPassword(password)}
              />
            </View>
          )}

          <Button
            outline
            style={styles.button}
            onPress={() =>
              authContext.canLogin
                ? authContext.login(npa, password)
                : authContext.checkNPA(npa)
            }>
            {authContext.canLogin ? 'Connexion' : 'Suivant'}
          </Button>

          <Button
            isText
            onPress={onResetPassword}
            labelStyle={{
              color: 'white',
              fontSize: 10,
            }}>
            Réinitialiser le mot de passe
          </Button>

          <TextC style={[gs.c_white, gs.center, gs.bold, styles.text_or]}>
            OU
          </TextC>

          <Button outline onPress={openOnlineAdhesion}>
            Adhérer en ligne
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollview: {
    flex: 1,
    padding: gs.paddings.large,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: gs.paddings.medium,
  },
  button: {
    marginTop: gs.paddings.small,
  },
  text_or: {
    fontSize: 18,
    margin: gs.paddings.small,
  },
  textInput: {
    height: 50,
    fontSize: 20,
  },
});

export default LoginScreen;
