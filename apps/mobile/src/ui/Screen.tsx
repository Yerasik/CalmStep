import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, space } from './theme';

type ScreenProps = {
  children: ReactNode;
  bottom?: ReactNode;
};

/**
 * Full-bleed column with padding (Ch 4 ViewGroup).
 * Optional bottom slot is the lower third: Break / Next sit here (Ch 1).
 */
export function Screen({ children, bottom }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <View style={styles.body}>{children}</View>
      {bottom ? <View style={styles.bottom}>{bottom}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  bottom: {
    minHeight: '33%',
    justifyContent: 'flex-end',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
});
