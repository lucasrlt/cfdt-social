import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

function RadioButton({size, tint, selected, onPress, disabled, ...props}) {
  const containerStyle = {
    height: size,
    width: size,
    borderRadius: size / 2,
    borderColor: tint,
  };

  const innerStyle = {
    height: size / 2,
    width: size / 2,
    borderRadius: size / 4,
    backgroundColor: tint,
  };

  if (disabled) {
    containerStyle.borderColor += '88';
    innerStyle.backgroundColor += '88';
  }

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle, props.style]}
      disabled={disabled}
      onPress={onPress}>
      {selected ? <View style={innerStyle} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RadioButton;
