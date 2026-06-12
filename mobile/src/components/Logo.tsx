import React from 'react';
import { Image, View, ViewStyle } from 'react-native';

const logo = require('../../Asset/datavsnus_logo.jpg');

type Props = {
  size?: number;
  /** Show the white rounded card behind the logo. */
  card?: boolean;
  style?: ViewStyle;
};

/**
 * Brand mark rendered from the datavsnus globe logo.
 * Wrapped in a white rounded card so it sits cleanly on any background.
 */
export default function Logo({ size = 96, card = true, style }: Props) {
  const inner = Math.round(size * 0.78);

  if (!card) {
    return (
      <Image
        source={logo}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#0F2C57',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 12,
          elevation: 6,
        },
        style,
      ]}
    >
      <Image
        source={logo}
        style={{ width: inner, height: inner }}
        resizeMode="contain"
      />
    </View>
  );
}
