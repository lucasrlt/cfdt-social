import {useRoute} from '@react-navigation/core';
import React, {useEffect} from 'react';
import {MediaTypeOptions} from 'expo-image-picker';
import {ActivityIndicator, Image, Platform, Text, View} from 'react-native';
// import Video from 'react-native-video';
import {Video, AVPlaybackStatus} from 'expo-av';
import convertToProxyURL from 'react-native-video-cache';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import DownloadIcon from '../../assets/download.svg';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {downloadDocument} from '../utils/profile_edition';

const MediaFullScreen = props => {
  const route = useRoute();

  const {source, mediaType} = route.params;
  const [isLoading, setIsLoading] = React.useState(false);

  const navigation = useNavigation();

  console.log('FULL SCREEN', source);
  const onDownload = () =>
    downloadDocument(
      source.uri,
      'media.' + source.uri.split('.').slice(-1),
      false,
      false,
      false,
    );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onDownload}>
          <DownloadIcon fill="white" style={styles.headerRight} />
        </TouchableOpacity>
      ),
    });
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'black'}}>
      {mediaType === MediaTypeOptions.Images ? (
        <FastImage
          style={{width: '100%', height: '100%'}}
          source={source}
          resizeMode={
            Platform.OS === 'ios'
              ? FastImage.resizeMode.contain
              : FastImage.resizeMode.center
          }
        />
      ) : (
        <>
          <Video
            source={
              source.uri.startsWith('http')
                ? {uri: convertToProxyURL(source.uri)}
                : source
            }
            onLoad={() => setIsLoading(true)}
            useNativeControls
            style={styles.video}
            resizeMode="contain"
          />
          {!isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="large" />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = {
  headerRight: {
    marginRight: 20,
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
};

export default MediaFullScreen;
