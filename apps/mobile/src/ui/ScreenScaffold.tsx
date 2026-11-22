import { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Column } from './Column';
import { PrimaryButton } from './PrimaryButton';
import { Screen } from './Screen';
import { colors, font, space } from './theme';

type ScreenScaffoldProps = {
  title: string;
  note: string;
  extras?: string;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

/**
 * Shared View only (Ch 14). Planner placeholders still use this.
 * RoleGate / SupportedDay / Break use Screen primitives directly.
 */
export function ScreenScaffold({
  title,
  note,
  extras,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: ScreenScaffoldProps) {
  return (
    <Screen
      bottom={
        <Column gap={space.md}>
          {secondaryLabel && onSecondary ? (
            <PrimaryButton variant="outline" label={secondaryLabel} onPress={onSecondary} />
          ) : null}
          <PrimaryButton label={primaryLabel} onPress={onPrimary} />
        </Column>
      }
    >
      <Column gap={space.md}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.note}>{note}</Text>
        {extras ? <Text style={styles.extras}>{extras}</Text> : null}
        {children}
      </Column>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: font.display,
    fontWeight: '700',
    color: colors.text,
  },
  note: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.text,
  },
  extras: {
    fontSize: font.body,
    color: colors.text,
  },
});
