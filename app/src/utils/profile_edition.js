import {Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import strings from '../../strings.json';

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
