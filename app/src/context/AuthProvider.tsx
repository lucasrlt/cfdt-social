import * as React from 'react';
import routes from '../constants/api';
import axios, {AxiosError, AxiosResponse} from 'axios';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Platform} from 'react-native';
import strings from '../../strings.json';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import api from '../constants/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  try {
    let token;
    const experienceId = '@cfdt.services69.app/cfdtsocial';

    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('', 'Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({experienceId})).data;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (err) {
    return 'coucou';
  }
}

export const AuthContext = React.createContext({
  isLoggedIn: false,
  token: null,
  username: '',
  name: '',
  isLoading: true,
  pending: true,
  canLogin: false,
  isFirstLogin: false,
  login: (email: String, password: String) => () => {},
  complete_login: (token: string) => {},
  logout: () => {},
  dl_login: (data: string) => {},
});

const TOKEN_KEY = 'token';
const GROUP_KEY = 'group';

function AuthProvider({children}) {
  const [state, setState] = React.useState({
    token: '',
    name: '',
    isLoggedIn: false,
    isLoading: true,
    isDeepLinked: false,
    shouldResetPassword: false,
  });

  React.useEffect(() => {
    const get_token = async () => {
      try {
        setState(s => ({...s, isLoading: true}));
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const wasUserSetup = await AsyncStorage.getItem('USER_SETUP');
        const shouldResetPassword = await AsyncStorage.getItem('SHOULD_RESET');

        setTimeout(async () => {
          if (token !== null) {
            const decoded = jwtDecode(token);

            set_auth_token(token);
            setState(state => ({
              ...state,
              isLoggedIn: true,
              token,
              user: decoded,
              isLoading: false,
              isFirstLogin: wasUserSetup !== 'true',
              shouldResetPassword: shouldResetPassword === 'true',
            }));
          } else {
            setState(state => ({
              ...state,
              isLoggedIn: false,
              isLoading: false,
              isFirstLogin:
                wasUserSetup === null ? false : wasUserSetup !== 'true',
              shouldResetPassword: shouldResetPassword === 'true',
            }));
          }

          await SplashScreen.hideAsync();
        }, 1000);
      } catch (err) {
        console.log(JSON.stringify(err));
      }
    };

    get_token();
  }, []);

  const set_auth_token = token =>
    (axios.defaults.headers.common['Authorization'] =
      'Bearer ' + String(token));

  const login = async (login: string, password: string) => {
    try {
      login = login.trim();

      const notification_token = await registerForPushNotificationsAsync();

      // get token from pjv
      const res = await axios.post(routes.user_login, {
        npa: login,
        password,
        notification_token,
      });
      if (res.status === 200) {
        const token = res.data.jwt;
        const decoded = jwtDecode(token);

        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(
          'USER_SETUP',
          String(!res.data.isFirstLogin),
        );
        await AsyncStorage.setItem(
          'SHOULD_RESET',
          String(res.data.shouldResetPassword),
        );

        set_auth_token(token);

        setState(s => ({
          ...s,
          isLoggedIn: true,
          token,
          user: decoded,
          isLoading: false,
          isFirstLogin: res.data.isFirstLogin,
          shouldResetPassword: res.data.shouldResetPassword,
        }));
      }
    } catch (err) {
      await AsyncStorage.setItem('USER_SETUP', String(false));
      console.log('ERR:', JSON.stringify(err));
      Alert.alert(
        'Connexion impossible',
        "L'identifiant ou le mot de passe est invalide.",
      );
    }
  };

  const update_token = async (token: string) => {
    const decoded = jwtDecode(token);

    set_auth_token(token);
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setState(state => ({...state, isLoggedIn: true, token, user: decoded}));
  };

  const checkNPA = async (npa: string) => {
    try {
      const res = await axios.get(routes.user_has_logged + '?npa=' + npa);
      if (res.status === 200) {
        setState(state => ({...state, canLogin: Boolean(res.data)}));

        if (!Boolean(res.data)) {
          Alert.alert(
            strings.alerts.npa_check.title,
            strings.alerts.npa_check.body,
          );
        }
      }
    } catch (err) {
      console.log(JSON.stringify(err.response));
      Alert.alert('', err.response.data);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('USER_SETUP');
    await AsyncStorage.removeItem('SHOULD_RESET');
    await axios.get(api.user_remove_notification_token);
    setState(state => ({...state, isLoggedIn: false, token: '', user: null}));

    return true;
  };

  const validateUserSetup = async jwt => {
    await AsyncStorage.setItem('USER_SETUP', 'true');
    await AsyncStorage.setItem('SHOULD_RESET', 'false');
    update_token(jwt);
    setState(state => ({
      ...state,
      isFirstLogin: false,
      shouldResetPassword: false,
    }));
  };

  const resetCanLogin = () => setState(state => ({...state, canLogin: false}));

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkNPA,
        resetCanLogin,
        validateUserSetup,
        update_token,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
