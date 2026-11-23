import { StyleSheet, Text, View } from 'react-native';

import { colors } from './theme';

type PictogramProps = {
  size?: number;
  fallback?: string;
  label: string;
};

/** Ch 10 ImageView analog: a recognisable emoji glyph in a soft card (not a solid square). */
export function Pictogram({ size = 96, fallback = '●', label }: PictogramProps) {
  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: Math.max(14, size / 4),
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.46 }} allowFontScaling={false}>
        {fallback}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 2,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
