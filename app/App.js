import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AuthProvider from './src/context/AuthProvider';
import PostsProvider from './src/context/PostsProvider';
import Navigation from './src/Navigation';

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
