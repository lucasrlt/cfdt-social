import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Platform,
  StatusBar,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AuthProvider from './src/context/AuthProvider';
import PostsProvider from './src/context/PostsProvider';
import Navigation from './src/Navigation';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import {Button} from './src/components/Button';
import {gs} from './src/constants/styles';

export default function App() {
  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
    })();
  }, []);

  return (
    <AuthProvider>
      <SafeAreaView style={{flex: 1, backgroundColor: gs.colors.primary}}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={gs.colors.primary}
        />
        <Navigation />
      </SafeAreaView>
    </AuthProvider>
  );
}
