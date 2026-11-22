import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import { colors, font } from './theme';

type PictogramProps = {
  size?: number;
  source?: ImageSourcePropType;
  fallback?: string;
  label: string;
};

/** Square ImageView analog. Asset catalogue is later; emoji keeps the slot from looking broken. */
export function Pictogram({ size = 96, source, fallback = '■', label }: PictogramProps) {
  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.box,
        { width: size, height: size, borderRadius: Math.max(12, size / 8) },
      ]}
    >
      {source ? (
        <Image source={source} style={{ width: size - 16, height: size - 16 }} resizeMode="contain" />
      ) : (
        <Text style={[styles.fallback, { fontSize: Math.min(size * 0.45, 40) }]}>{fallback}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.track,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    color: colors.text,
    fontSize: font.display,
  },
});
