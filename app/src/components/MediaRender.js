import React, {useEffect, useState} from 'react';
import propTypes from 'prop-types';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import api from '../constants/api';
import {MediaTypeOptions} from 'expo-image-picker';
import {Button} from './Button';
import CloseIcon from '../../assets/close.svg';
import PlayIcon from '../../assets/play_filled.svg';
import {useNavigation} from '@react-navigation/native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {gs} from '../constants/styles';
import noImage from '../../assets/no-image.jpg';

const Media = ({media, onRemove, isEditing, ...props}) => {
  const {mediaType, uri, fromGallery} = media;
  const source = React.useMemo(
    () => ({uri: !fromGallery ? api.user_avatar + '?file=' + uri : uri}),
    [uri, fromGallery],
  );

  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    (async () => {
      if (mediaType === MediaTypeOptions.Videos) {
        const generatedThumbnail = await VideoThumbnails.getThumbnailAsync(
          source.uri,
          {quality: 0.1},
        );

        setThumbnail({uri: generatedThumbnail.uri});
      }
    })();
  }, [mediaType, source]);

  const navigation = useNavigation();

  const openFullScreen = () => {
    navigation.navigate('MediaFull', {source, mediaType});
  };

  const videoBg = {
    backgroundColor: thumbnail ? '#FFFFFF00' : gs.colors.subtitle + '55',
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={openFullScreen}
      style={[props.style, {marginRight: 0, marginLeft: 0}]}>
      {mediaType === MediaTypeOptions.Images ? (
        <Image {...props} source={source} defaultSource={noImage} />
      ) : (
        <View>
          <Image {...props} source={thumbnail} blurRadius={5} />
          <View style={[styles.video_thumbnail, videoBg]}>
            <PlayIcon width={60} height={60} fill={gs.colors.light_gray} />
          </View>
        </View>
      )}

      {isEditing && (
        <Button style={{position: 'absolute', right: 20, top: 0, padding: 2}}>
          <CloseIcon fill="white" onPress={onRemove} />
        </Button>
      )}
    </TouchableOpacity>
  );
};

const MediaRender = ({medias, onRemove, isEditing, innerStyle, ...props}) => {
  return medias.length === -1 ? (
    <Media
      media={medias[0]}
      style={styles.media_full}
      isEditing={isEditing}
      onRemove={onRemove ? onRemove(medias[0].uri) : () => {}}
    />
  ) : (
    <FlatList
      horizontal
      style={[styles.container, props.style]}
      data={medias}
      renderItem={({item}) => (
        <Media
          media={item}
          style={[styles.media_half, innerStyle]}
          isEditing={isEditing}
          onRemove={onRemove(item.uri)}
        />
      )}
      keyExtractor={item => item.uri}
    />
  );
};

MediaRender.defaultProps = {
  onRemove: () => () => {},
  isEditing: false,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    // maxHeight: 300,
  },
  row: {
    flexDirection: 'row',
  },
  media_half: {
    // marginLeft: 10,
    marginRight: 10,
    // // marginTop: 15,
    // marginBottom: 15,
    borderRadius: 6,
    aspectRatio: 1,
  },
  media_full: {
    width: '100%',
    borderRadius: 6,
    aspectRatio: 1,
    // padding: 40,
  },

  video_thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MediaRender;
