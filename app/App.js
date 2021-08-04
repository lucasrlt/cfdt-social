import React, {useEffect, useRef, useState} from 'react';
import {Alert, Platform, StatusBar, Text, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AuthProvider from './src/context/AuthProvider';
import PostsProvider from './src/context/PostsProvider';
import Navigation from './src/Navigation';
import * as Notifications from 'expo-notifications';
import {Button} from './src/components/Button';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="light-content" />
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
