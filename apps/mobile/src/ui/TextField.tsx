import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, font, tapMin } from './theme';

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  textAlign?: 'left' | 'center';
  large?: boolean;
  onSubmit?: () => void;
};

export function TextField({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  maxLength,
  textAlign = 'left',
  large = false,
  onSubmit,
}: TextFieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        textAlign={textAlign}
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
        returnKeyType="done"
        blurOnSubmit
        onSubmitEditing={onSubmit}
        style={[styles.input, multiline && styles.multiline, large && styles.large]}
        placeholderTextColor="#777777"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: font.body,
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    minHeight: tapMin,
    borderWidth: 2,
    borderColor: colors.track,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: font.body,
    color: colors.text,
  },
  multiline: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  large: {
    minHeight: 72,
    fontSize: font.display,
    letterSpacing: 8,
    fontWeight: '700',
  },
});
