import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { readRole } from '../../navigation/extras';
import { loadProfile } from '../../stores/profileStore';
import { generatePlan } from '../../stores/serverStore';
import { Column } from '../../ui/Column';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { colors, font, space } from '../../ui/theme';

export default function PlannerPlanScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = readRole(params.role);
  const [status, setStatus] = useState('Generate talks to FastAPI. Failures keep the cached plan.');
  const [jsonText, setJsonText] = useState('');
  const [busy, setBusy] = useState(false);

  async function onGenerate() {
    setBusy(true);
    setStatus('Checking server…');
    try {
      const profile = await loadProfile();
      const result = await generatePlan('school 8–3, lunch 12:00', profile);
      setJsonText(JSON.stringify(result, null, 2));
      const badge = result.validation.ok ? 'valid' : result.validation.violations.join('; ');
      setStatus(`Got plan ${result.id}. ${badge}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not generate. Cached plan is unchanged.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      bottom={
        <Column gap={space.md}>
          <PrimaryButton
            label={busy ? 'Working…' : 'Generate from server'}
            onPress={() => {
              if (!busy) {
                void onGenerate();
              }
            }}
          />
          <PrimaryButton
            variant="outline"
            label="Review plan"
            onPress={() => {
              router.push({ pathname: '/plan-review', params: { role } });
            }}
          />
        </Column>
      }
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Column gap={space.md}>
          <Text style={styles.title} accessibilityRole="header">
            PlannerPlan
          </Text>
          <Text style={styles.body}>{status}</Text>
          {jsonText ? <Text style={styles.json}>{jsonText}</Text> : null}
        </Column>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.md,
  },
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
  json: {
    fontSize: font.body,
    color: colors.text,
    fontFamily: 'Courier',
  },
});
