import { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { space } from './theme';

type ColumnProps = {
  children: ReactNode;
  gap?: number;
  flex?: number;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  style?: StyleProp<ViewStyle>;
};

/** Vertical LinearLayout analog (Ch 4). */
export function Column({ children, gap = space.md, flex, align, justify, style }: ColumnProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'column',
          gap,
          flex,
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
