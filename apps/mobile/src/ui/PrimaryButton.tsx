import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, font, tapMin } from './theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'accent' | 'danger' | 'outline';
  flex?: number;
};

/** Finger-friendly control: min 56 pt, one label, pressed state. */
export function PrimaryButton({ label, onPress, variant = 'accent', flex }: PrimaryButtonProps) {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'accent' && styles.accent,
        variant === 'danger' && styles.danger,
        isOutline && styles.outline,
        pressed && styles.pressed,
        flex !== undefined ? { flex } : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          isOutline ? { color: colors.accent } : { color: '#FFFFFF' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tapMin,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accent: {
    backgroundColor: colors.accent,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.accent,
  },
  label: {
    fontSize: font.title,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
