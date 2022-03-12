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
import {RootSiblingParent} from 'react-native-root-siblings';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  return (
    <AuthProvider>
      <RootSiblingParent>
        <SafeAreaView style={{flex: 1, backgroundColor: gs.colors.primary}}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={gs.colors.primary}
          />
          <Navigation />
        </SafeAreaView>
      </RootSiblingParent>
    </AuthProvider>
  );
}
