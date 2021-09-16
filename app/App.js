import React, {useEffect, useRef, useState} from 'react';
import {Alert, Platform, StatusBar, Text, View, SafeAreaView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AuthProvider from './src/context/AuthProvider';
import PostsProvider from './src/context/PostsProvider';
import Navigation from './src/Navigation';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import {Button} from './src/components/Button';

SplashScreen.preventAutoHideAsync().catch(() => {});


export default function App() {
  return (
    // <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "red" }}>
        <StatusBar barStyle="light-content" />
        <Navigation />
        </SafeAreaView>
      </AuthProvider>
    // </SafeAreaProvider>
  );
}
