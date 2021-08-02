import {useRoute} from '@react-navigation/core';
import React from 'react';
import {MediaTypeOptions} from 'expo-image-picker';
import {ActivityIndicator, Image, Text, View} from 'react-native';
import Video from 'react-native-video';

const MediaFullScreen = props => {
  const route = useRoute();

  const {source, mediaType} = route.params;
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'black'}}>
      {mediaType === MediaTypeOptions.Images ? (
        <Image style={{width: '100%', aspectRatio: 1}} source={source} />
      ) : (
        <>
          <Video
            source={source}
            controls
            style={isLoading ? {} : styles.video}
            onReadyForDisplay={() => setIsLoading(false)}
          />
          {isLoading && <ActivityIndicator color="white" size="large" />}
        </>
      )}
    </View>
  );
};

const styles = {
  video: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

export default MediaFullScreen;
