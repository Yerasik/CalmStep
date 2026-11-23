import { ReactNode, useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from './theme';

type ScreenProps = {
  children: ReactNode;
  bottom?: ReactNode;
};

/**
 * Full-bleed column (Ch 4). The action stays at the bottom and lifts above the keyboard.
 */
export function Screen({ children, bottom }: ScreenProps) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <KeyboardAvoidingView
        style={styles.avoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={styles.body}>{children}</View>
        {bottom ? (
          <View style={[styles.bottom, keyboardOpen && styles.bottomAboveKeyboard]}>{bottom}</View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  avoid: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  bottom: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  bottomAboveKeyboard: {
    paddingBottom: space.sm,
  },
});
