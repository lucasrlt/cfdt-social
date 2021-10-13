import {useRoute} from '@react-navigation/core';
import React from 'react';
import {MediaTypeOptions} from 'expo-image-picker';
import {ActivityIndicator, Image, Text, View} from 'react-native';
// import Video from 'react-native-video';
import {Video, AVPlaybackStatus} from 'expo-av';
import convertToProxyURL from 'react-native-video-cache';
import FastImage from 'react-native-fast-image';

const MediaFullScreen = props => {
  const route = useRoute();

  const {source, mediaType} = route.params;
  const [isLoading, setIsLoading] = React.useState(false);

  console.log(source);
  return (
    <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'black'}}>
      {mediaType === MediaTypeOptions.Images ? (
        <FastImage
          style={{width: '100%', height: '100%'}}
          source={source}
          resizeMode={FastImage.resizeMode.center}
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
