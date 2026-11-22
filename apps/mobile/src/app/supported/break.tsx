import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { readRole } from '../../navigation/extras';
import { Column } from '../../ui/Column';
import { Pictogram } from '../../ui/Pictogram';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { colors, font, space } from '../../ui/theme';

export default function BreakScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = readRole(params.role);

  return (
    <Screen
      bottom={
        <PrimaryButton
          label="Back to day"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace({ pathname: '/supported/day', params: { role: 'supported' } });
          }}
        />
      }
    >
      <Column gap={space.lg} align="center">
        <Pictogram label="Break" fallback="☕" size={120} />
        <Text style={styles.title} accessibilityRole="header">
          Break
        </Text>
        <Text style={styles.body}>
          Coping steps will appear here later. One action: return to the Day Strip. No LLM chat.
        </Text>
        <Text style={styles.meta}>extra role={role}</Text>
      </Column>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: font.display,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'center',
  },
  meta: {
    fontSize: font.body,
    color: colors.text,
    textAlign: 'center',
  },
});
