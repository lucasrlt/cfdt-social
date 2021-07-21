import propTypes from 'prop-types';
import React from 'react';
import {Text, StyleSheet} from 'react-native';

const TextC = ({light, ...props}) => {
  return (
    <Text style={[styles.text, props.style]} {...props}>
      {props.children}
    </Text>
  );
};

TextC.propTypes = {
  light: propTypes.bool,
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontFamily: 'arial, sans-serif',
    color: 'black',
  },
});

export default TextC;
