import React from 'react';
import PropTypes from 'prop-types';
import {Text, View, TextInput, StyleSheet} from 'react-native';
import TextC from './TextC';
import {gs} from '../constants/styles';

const TextInputC = ({
  label,
  noMargin = false,
  outline = false,
  theme = 'dark',
  labelStyle = {},
  ...props
}) => {
  console.log(theme);
  const outlineStyle = outline
    ? {
        borderWidth: 1,
        borderRadius: 5,
      }
    : {};

  return (
    <View style={!noMargin ? styles.container : {}}>
      {label && (
        <TextC
          style={[
            styles.label,
            styles['label_' + (outline ? 'dark' : theme)],
            labelStyle,
          ]}>
          {label}
        </TextC>
      )}

      <TextInput
        {...props}
        style={[
          styles.input,
          styles['input_' + theme],
          props.style,
          outlineStyle,
        ]}
        placeholderTextColor={
          theme === 'dark' ? gs.colors.subtitle : gs.colors.subtitle
        }
      />
    </View>
  );
};

TextInput.propTypes = {
  label: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark', 'gray']),
  labelStyle: PropTypes.object,
  outline: PropTypes.bool,
};

TextInput.defaultProps = {
  theme: 'dark',
  outline: false,
};

const styles = StyleSheet.create({
  container: {
    marginBottom: gs.paddings.small,
  },
  label: {
    fontSize: gs.font.default,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'black',
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
  input_gray: {
    backgroundColor: gs.colors.light_gray,
  },
});

export default TextInputC;
