import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { readRole } from '../navigation/extras';
import { getLastDraft } from '../stores/planStore';
import { approvePlanOnServer } from '../stores/serverStore';
import { Column } from '../ui/Column';
import { Pictogram } from '../ui/Pictogram';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Screen } from '../ui/Screen';
import { iconFallback } from '../ui/iconFallback';
import { colors, font, space } from '../ui/theme';

/** After approve: go to Planner Today (DECIDE after_approve = go-today). */
export default function PlanReviewScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = readRole(params.role);
  const draft = getLastDraft();
  const [status, setStatus] = useState(
    draft
      ? `Review ${draft.plan.items.length} items. Approve caches the plan on this phone.`
      : 'No generated plan yet. Generate on the Plan tab first.',
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Column gap={space.md}>
          <Text style={styles.title} accessibilityRole="header">
            Review
          </Text>
          <Text style={styles.body}>{status}</Text>
          {draft ? (
            <View style={[styles.badge, draft.validation.ok ? styles.badgeOk : styles.badgeBad]}>
              <Text style={styles.badgeText}>
                {draft.validation.ok ? '✓ Validate: ok' : `✕ ${draft.validation.violations.join('; ')}`}
              </Text>
            </View>
          ) : null}
          {draft?.plan.items.map((item) => (
            <View key={`${item.start}-${item.title}`} style={styles.itemCard}>
              <Pictogram size={56} label={item.title} fallback={iconFallback(item.icon_id)} />
              <Text style={styles.itemTitle}>
                {item.start}–{item.end}  {item.title}
              </Text>
            </View>
          ))}
          {draft?.plan.supports.map((support) => (
            <Text key={`${support.type}-${support.after_item}`} style={styles.body}>
              ☕ {support.reason}
            </Text>
          ))}
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
    fontWeight: '800',
    color: colors.text,
  },
  body: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.text,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 16,
    padding: space.md,
  },
  itemTitle: {
    fontSize: font.title,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: 'center',
  },
  badgeOk: {
    backgroundColor: colors.accent,
  },
  badgeBad: {
    backgroundColor: colors.danger,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: font.body,
    fontWeight: '700',
  },
});
