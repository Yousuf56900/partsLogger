import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {appImages} from '../Assets/Images';

const CustomIcon = props => {
  const {
    size,
    src,
    resizeMode = 'cover',
    customIconStyle,
    customIconWrapper,
    bgColor,
    disabled,
    onPress,
  } = props;

  const imageSource =
    src && (typeof src === 'number' || src?.uri)
      ? src
      : appImages.placeholder;

  return (
    <TouchableOpacity
      activeOpacity={0.1}
      disabled={disabled}
      onPress={onPress}
      style={[
        {height: size, width: size, backgroundColor: bgColor},
        customIconWrapper,
      ]}>
      <Image
        source={imageSource}
        style={[styles.img, customIconStyle]}
        resizeMode={resizeMode}
      />
    </TouchableOpacity>
  );
};

export default CustomIcon;

const styles = StyleSheet.create({
  img: {
    width: '100%',
    height: '100%',
  },
});
