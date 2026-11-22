import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { space } from './theme';

type RowProps = {
  children: ReactNode;
  gap?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: StyleProp<ViewStyle>;
};

/** Horizontal LinearLayout analog (Ch 4). */
export function Row({ children, gap = space.md, align = 'center', justify, style }: RowProps) {
  return (
    <View
      style={[{ flexDirection: 'row', gap, alignItems: align, justifyContent: justify }, style]}
    >
      {children}
    </View>
  );
}
