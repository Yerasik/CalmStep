import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { setSetting } from '../stores/settingsStore';
import { Column } from '../ui/Column';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Screen } from '../ui/Screen';
import { colors, font, space } from '../ui/theme';

/**
 * RoleGate — launcher Activity restyled with Ch 4 primitives.
 * Adult-self: same account, toggle Planner / Supported (Stage 0).
 */
export default function RoleGateScreen() {
  return (
    <Screen
      bottom={
        <Column gap={space.md}>
          <PrimaryButton
            label="Continue as Planner"
            onPress={() => {
              void setSetting('active_role', 'planner');
              router.push({ pathname: '/interview', params: { role: 'planner' } });
            }}
          />
          <PrimaryButton
            variant="outline"
            label="Open as Supported"
            onPress={() => {
              void setSetting('active_role', 'supported');
              router.push({ pathname: '/supported/day', params: { role: 'supported' } });
            }}
          />
        </Column>
      }
    >
      <Column gap={space.md}>
        <Text style={styles.title} accessibilityRole="header">
          RoleGate
        </Text>
        <Text style={styles.body}>
          Choose a role on this account. Planner builds the day. Supported only follows it. No
          diagnosis, no free chat.
        </Text>
        <Text style={styles.meta}>extra role is passed on the next screen (Intent extras analog).</Text>
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
  body: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.text,
  },
  meta: {
    fontSize: font.body,
    color: colors.text,
  },
});
