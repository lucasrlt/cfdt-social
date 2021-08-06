import * as React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import {gs} from '../constants/styles';
import TextC from './TextC';
// import { TouchableOpacity } from "react-native-gesture-handler";

export function Button({
  outline = false,
  isText = false,
  fullWidth = false,
  fontSize = gs.font.normal,
  textAlign = 'center',
  disabled = false,
  labelStyle = {},
  ...props
}) {
  const btnStyle = {
    backgroundColor: isText
      ? '#FFFFFF00'
      : outline
      ? '#FFFFFF'
      : gs.colors.primary,
  };

  const txtStyle = {
    color: outline || isText ? gs.colors.primary : gs.colors.white,
    fontSize,
    fontWeight: outline ? 'normal' : 'bold',
    ...labelStyle,
  };

  if (disabled) {
    btnStyle.backgroundColor += 'AA';
  }

  const borderStyle = {
    borderWidth: outline ? 1 : 0,
    borderColor: outline ? gs.colors.primary : gs.colors.primary,
    marginTop: isText ? 0 : 10,
    marginBottom: isText ? 0 : 10,
  };

  const childType = typeof props.children
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={[styles.container, btnStyle, borderStyle, props.style]}>
        {childType !== "string" ? 
          props.children
        :
      <TextC style={[txtStyle, styles.text, {textAlign}]}>
        {props.children}
      </TextC>}
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
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
});
