import React from 'react';
import {View, Linking, StyleSheet, Image, Alert, Modal, KeyboardAvoidingView} from 'react-native';
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const LoginScreen = () => {
  const authContext = React.useContext(AuthContext);

  const [npa, setNpa] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [passwordReset, setPasswordReset] = React.useState({
    npa: null,
    email: '',
    show: false,
  });

  // Open a webpage going to the adhesion page
  const openOnlineAdhesion = () => {
    Linking.openURL(api.adhesion_page);
  };

  const onShowResetForm = () =>
    setPasswordReset({show: true, npa: null, email: null});
  const onHideResetForm = () =>
    setPasswordReset({show: false, npa: null, email: null});

  const onResetPassword = async () => {
    if (!passwordReset.npa || !passwordReset.email) {
      Alert.alert(
        'Erreur',
        "Merci d'entrer toutes les informations demandées.",
      );
      return;
    }

    try {
      const res = await axios.post(api.user_reset_password, {
        npa: passwordReset.npa.trim(),
        email: passwordReset.email.trim(),
      });
      if (res.status === 200) {
        if (!Boolean(res.data)) {
          onHideResetForm();

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
      <KeyboardAwareScrollView>
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
            onPress={onShowResetForm}
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
      </KeyboardAwareScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={passwordReset.show}
        style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <KeyboardAvoidingView style={styles.resetModalContainer} behavior="padding">
          <View style={styles.resetModalContent}>
            <TextC style={[gs.title]}>Réinitialisation</TextC>
            <TextC style={{color: gs.colors.subtitle, marginBottom: 10}}>
              Merci de renseigner votre NPA ainsi que l'adresse e-mail associée
              à ce compte.
            </TextC>
            <TextInputC
              theme="gray"
              placeholder="1234567"
              label="NPA"
              value={passwordReset.npa}
              onChangeText={npa => setPasswordReset(p => ({...p, npa}))}
            />
            <TextInputC
              theme="gray"
              placeholder="mail@example.com"
              autoCapitalize="none"
              label="E-mail"
              onChangeText={email => setPasswordReset(p => ({...p, email}))}
            />
            <View style={{flexDirection: 'row'}}>
              <Button outline style={gs.flex(1)} onPress={onHideResetForm}>
                Annuler
              </Button>
              <Button
                style={[gs.flex(1), {marginLeft: 15}]}
                onPress={onResetPassword}>
                Valider
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  resetModalContainer: {
    padding: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0006',
  },
  resetModalContent: {
    backgroundColor: 'white',
    elevation: 6,
    padding: 20,
    borderRadius: 10,
  },
});

export default LoginScreen;
