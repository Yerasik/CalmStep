import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { readRole } from '../navigation/extras';
import { getLastDraft } from '../stores/planStore';
import { approvePlanOnServer } from '../stores/serverStore';
import { Column } from '../ui/Column';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Screen } from '../ui/Screen';
import { colors, font, space } from '../ui/theme';

/** After approve: go to Planner Today (DECIDE after_approve = go-today). */
export default function PlanReviewScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = readRole(params.role);
  const draft = getLastDraft();
  const [status, setStatus] = useState(
    draft
      ? `Review ${draft.plan.items.length} items. Approve caches the plan on this phone.`
      : 'No generated plan yet. Generate on the Plan tab first. Cached Supported plan is unchanged.',
  );
  const [busy, setBusy] = useState(false);

  async function onApprove() {
    if (!draft) {
      setStatus('Generate a plan first. The last approved plan on this phone is still there.');
      return;
    }
    setBusy(true);
    try {
      await approvePlanOnServer(draft.id, draft.plan);
      router.push({ pathname: '/planner/today', params: { role, from: 'plan-review' } });
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `${err.message} Last approved plan on this phone was not replaced.`
          : 'Approve failed. Cached plan kept.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      bottom={
        <PrimaryButton
          label={busy ? 'Working…' : 'Approve plan'}
          onPress={() => {
            if (!busy) {
              void onApprove();
            }
          }}
        />
      }
    >
      <Column gap={space.md}>
        <Text style={styles.title} accessibilityRole="header">
          PlanReview
        </Text>
        <Text style={styles.body}>{status}</Text>
        {draft?.plan.items.map((item) => (
          <Text key={`${item.start}-${item.title}`} style={styles.body}>
            {item.start} {item.title}
          </Text>
        ))}
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
});
