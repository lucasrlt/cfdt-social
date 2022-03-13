import {Alert, Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import strings from '../../strings.json';
import DocumentPicker from 'react-native-document-picker';
import mime from 'mime';
import RNFetchBlob from 'rn-fetch-blob';
import {PermissionsAndroid} from 'react-native';
import api from '../constants/api';
import Toast from 'react-native-root-toast';

export const pickImageFromGallery = async (allowsEditing = false) => {
  const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissions', strings.permissions.image_picker);
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [3, 3],
    quality: 0.25,
  });

  if (!result.cancelled) {
    return {
      uri: result.uri,
      name: result.uri.split('/')[result.uri.split('/').length - 1],
      type: 'image/' + result.uri.split('.')[result.uri.split('.').length - 1],
      fromGallery: true,
    };
  }

  return;
};

export const pickMediaFromGallery = async options => {
  const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissions', strings.permissions.image_picker);
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync(options);

  if (!result.cancelled) {
    let name = result.uri.split('/');
    name = name[name.length - 1];

    let type = result.uri.split('.');
    type = type[type.length - 1];
    type =
      (options.mediaTypes === ImagePicker.MediaTypeOptions.Images
        ? 'image/'
        : 'video/') + type;

    return {
      uri: result.uri,
      name,
      type,
      fromGallery: true,
      mediaType: options.mediaTypes,
    };
  }
};

export const pickMediaFromDocuments = async () => {
  const allowedTypes =
    Platform.OS === 'ios'
      ? ['public.data']
      : ['application/*', 'text/*', 'audio/*'];

  try {
    const result = await DocumentPicker.pickSingle({
      type: allowedTypes,
      copyTo: 'cachesDirectory',
    });

    result.uri = result.fileCopyUri;
    const mimeType = mime.getType(result.uri);
    const mimePrefix = mimeType.split('/')[0];

    let mediaType =
      mimePrefix === 'image'
        ? ImagePicker.MediaTypeOptions.Images
        : mimePrefix === 'video'
        ? ImagePicker.MediaTypeOptions.Videos
        : 'Documents';

    return {
      ...result,
      type: mimeType,
      fromGallery: true,
      mediaType,
    };
  } catch (err) {
    console.log('ERRRRREUR', err);
    return;
  }
};

// On Android the path looks like "file:/[PATH]", just remove the file:/ prefix.
const trimLocalPath = path =>
  Platform.OS === 'android' ? path.split('/').slice(1).join('/') : path;

const openDocument = async path => {
  if (Platform.OS === 'ios') {
    RNFetchBlob.ios.previewDocument(path);
  } else if (Platform.OS === 'android') {
    // Request permissions
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    const isGranted =
      result[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
        'granted' &&
      result[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
        'granted';

    // Open file if permissions granted
    if (isGranted) {
      RNFetchBlob.android.actionViewIntent(path, mime.getType(path));
    } else {
      Alert.alert(
        'Permissions',
        "Impossible d'ouvrir le fichier sans les permissions.",
      );
    }
  }
};

export const downloadDocument = async (
  uri,
  name,
  isLocal,
  shouldOpen = false,
  prependHost = true,
) => {
  const {dirs} = RNFetchBlob.fs;
  const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

  const path = isLocal ? trimLocalPath(uri) : `${dirToSave}/cfdt69_${name}`;

  const config = {
    title: name,
    fileCache: true,
    path,
    addAndroidDownloads: {
      path,
      useDownloadManager: true,
      notification: true,
      mediaScannable: true,
    },
  };

  RNFetchBlob.fs
    .exists(config.path)
    .then(async exists => {
      if (!isLocal && (!exists || !shouldOpen)) {
        // Download the file
        RNFetchBlob.config(config)
          .fetch('GET', (prependHost ? api.user_avatar : '') + uri)
          .then(res => {
            if (Platform.OS === 'ios') {
              RNFetchBlob.fs.writeFile(path, res.data, 'base64');
              if (!shouldOpen) {
                openDocument(path);
              }
            }

            if (shouldOpen) {
              openDocument(path);
            } else {
              Toast.show('Le fichier a bien été téléchargé.');
            }
          })
          .catch(e => {
            console.log('The file saved to ERROR', e.message);
          });
      } else if (shouldOpen) {
        openDocument(path);
      }
    })
    .catch(err => {
      console.log('PB! ', err);
    });
};
