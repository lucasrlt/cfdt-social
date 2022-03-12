import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import api from '../constants/api';
import {MediaTypeOptions} from 'expo-image-picker';
import {Button} from './Button';
import CloseIcon from '../../assets/close.svg';
import PlayIcon from '../../assets/play_filled.svg';
import {useNavigation} from '@react-navigation/native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {gs} from '../constants/styles';
import noImage from '../../assets/no-image.jpg';
import FastImage from 'react-native-fast-image';
import FileIcon from '../../assets/file.svg';
import {downloadDocument} from '../utils/profile_edition';

const Media = ({media, onRemove, isEditing, ...props}) => {
  const {mediaType, uri, fromGallery} = media;
  const source = React.useMemo(
    () => ({uri: !fromGallery ? api.user_avatar + uri : uri}),
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
        <FastImage {...props} source={source} defaultSource={noImage} />
      ) : mediaType === MediaTypeOptions.Videos ? (
        <View>
          <FastImage {...props} source={thumbnail} blurRadius={5} />
          <View style={[styles.video_thumbnail, videoBg]}>
            <PlayIcon width={60} height={60} fill={gs.colors.light_gray} />
          </View>
        </View>
      ) : (
        ''
      )}

      {isEditing && (
        <Button style={{position: 'absolute', right: 20, top: 0, padding: 2}}>
          <CloseIcon fill="white" onPress={onRemove} />
        </Button>
      )}
    </TouchableOpacity>
  );
};

const MediasCards = ({medias, onRemove, isEditing, innerStyle, ...props}) => {
  if (medias.length === 0) {
    return null;
  }

  return medias.length === -1 ? (
    <Media
      media={displayableMedias[0]}
      style={styles.media_full}
      isEditing={isEditing}
      onRemove={onRemove ? onRemove(displayableMedias[0].uri) : () => {}}
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

const Document = ({document, onRemove, isEditing, ...props}) => {
  const display_uri = decodeURI(
    isEditing
      ? document.uri.split('/').slice(-1)
      : document.uri.split('.').slice(1).join('.'),
  );

  const localStyle = {
    backgroundColor: !isEditing ? '#EFEFEF' : '#FFF',
    marginRight: !isEditing ? 0 : 10,
  };

  const onPress = () =>
    downloadDocument(document.uri, display_uri, isEditing, true);

  return (
    <TouchableOpacity onPress={onPress} style={props.style}>
      <View style={[styles.document_container, localStyle]}>
        <FileIcon
          style={styles.document_icon}
          fill={gs.colors.primary + 'CC'}
        />
        <Text style={styles.document_name}>{display_uri}</Text>
      </View>
    </TouchableOpacity>
  );
};

const DocumentsCards = ({
  documents,
  onRemove,
  isEditing,
  innerStyle,
  ...props
}) => {
  if (documents.length === 0) {
    return null;
  }

  return (
    <FlatList
      vertical
      data={documents}
      style={styles.documents_wrapper}
      renderItem={({item}) => (
        <Document
          style={innerStyle}
          document={item}
          isEditing={isEditing}
          onRemove={onRemove(item.uri)}
        />
      )}
      keyExtractor={item => item.uri}
    />
  );
};

const MediaRender = props => {
  const medias = props.medias.filter(m => m.mediaType !== 'Documents');
  const documents = props.medias.filter(m => m.mediaType === 'Documents');

  return (
    <>
      <MediasCards {...props} medias={medias} />
      <DocumentsCards {...props} documents={documents} />
    </>
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
  documents_wrapper: {
    paddingTop: 5,
  },
  document_container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    marginBottom: 10,
    padding: 5,
  },
  document_icon: {
    color: gs.colors.primary,
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  document_name: {
    color: gs.colors.primary,
    marginLeft: 8,
    ...gs.bold,
  },
});

export default MediaRender;
