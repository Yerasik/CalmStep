import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, font, tapMin } from './theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'accent' | 'danger' | 'outline';
  flex?: number;
};

/** Finger-friendly control: min 56 pt (about 8 mm at 163 ppi), one label. */
export function PrimaryButton({ label, onPress, variant = 'accent', flex }: PrimaryButtonProps) {
  const isOutline = variant === 'outline';
  const bg =
    variant === 'danger' ? colors.danger : variant === 'outline' ? 'transparent' : colors.accent;
  const fg = isOutline ? colors.accent : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor: colors.accent,
          borderWidth: isOutline ? 2 : 0,
          flex,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tapMin,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: font.title,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
