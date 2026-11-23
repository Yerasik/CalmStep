import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { setSetting } from '../stores/settingsStore';
import { Column } from '../ui/Column';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Screen } from '../ui/Screen';
import { colors, font, space } from '../ui/theme';

/**
 * RoleGate (launcher Activity analog, Ch 6 Intent extras).
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
      <Column flex={1} justify="center" gap={space.lg}>
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🗓️</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          CalmStep
        </Text>
        <Text style={styles.tagline}>
          A Planner builds the day.{'\n'}The supported person follows one calm timeline.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardLine}>🧭  Planner: interview → plan → approve</Text>
          <Text style={styles.cardLine}>🌤️  Supported: one timeline, one break button</Text>
          <Text style={styles.cardLine}>🔒  Nicknames only. No diagnosis. No chat.</Text>
        </View>
      </Column>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.surfaceTint,
    borderWidth: 2,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIcon: {
    fontSize: 44,
  },
  title: {
    fontSize: font.hero,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  tagline: {
    fontSize: font.title,
    lineHeight: 28,
    color: colors.textDim,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 18,
    padding: space.lg,
    gap: space.sm,
  },
  cardLine: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.text,
  },
});
