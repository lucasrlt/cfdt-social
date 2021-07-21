import React from 'react';
import PropTypes from 'prop-types';
import {Text, View, TextInput, StyleSheet} from 'react-native';
import TextC from './TextC';
import {gs} from '../constants/styles';

const TextInputC = ({label, theme = 'dark', ...props}) => {
  return (
    <View style={styles.container}>
      {label && (
        <TextC style={[styles.label, styles['label_' + theme]]}>{label}</TextC>
      )}

      <TextInput
        {...props}
        style={[styles.input, styles['input_' + theme], props.style]}
        placeholderTextColor={
          theme === 'dark' ? gs.colors.subtitle : gs.colors.subtitle
        }
      />
    </View>
  );
};

TextInput.propTypes = {
  label: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark']),
};

const styles = StyleSheet.create({
  container: {
    marginTop: gs.paddings.small,
  },
  label: {
    fontSize: gs.font.default,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  label_light: {
    color: gs.colors.white,
  },
  label_dark: {
    color: gs.colors.black,
  },
  input: {
    height: 40,
    borderRadius: 3,
    paddingLeft: 10,
  },
  input_light: {
    backgroundColor: gs.colors.white,
    color: gs.colors.black,
  },
  input_dark: {
    backgroundColor: gs.colors.black,
    color: gs.colors.white,
  },
});

export default TextInputC;
