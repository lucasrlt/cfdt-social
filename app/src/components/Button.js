import * as React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import {gs} from '../constants/styles';
import TextC from './TextC';
// import { TouchableOpacity } from "react-native-gesture-handler";

export function Button({
  outline = false,
  isText = false,
  fullWidth = false,
  fontSize = gs.font.normal,
  ...props
}) {
  const btnStyle = {
    backgroundColor: isText
      ? '#FFFFFF00'
      : outline
      ? 'white'
      : gs.colors.primary,
    color: outline || isText ? gs.colors.primary : gs.colors.white,
    fontWeight: outline ? 'normal' : 'bold',
    fontSize,
  };

  const borderStyle = {
    borderWidth: isText ? 0 : 1,
    borderColor: outline ? gs.colors.primary : '#A2D146',
    marginTop: isText ? 0 : 10,
    marginBottom: isText ? 0 : 10,
  };

  return (
    <TouchableOpacity
      {...props}
      style={[styles.container, btnStyle, borderStyle, props.style]}>
      <TextC style={[btnStyle, styles.text]}>{props.children}</TextC>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    padding: 10,
    alignContent: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: 'white',
    textTransform: 'uppercase',
  },
  text: {
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
