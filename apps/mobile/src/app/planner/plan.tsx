import { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getLastDraft } from '../../stores/planStore';
import { loadProfile } from '../../stores/profileStore';
import { approvePlanOnServer, generatePlan } from '../../stores/serverStore';
import { Column } from '../../ui/Column';
import { Pictogram } from '../../ui/Pictogram';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Row } from '../../ui/Row';
import { Screen } from '../../ui/Screen';
import { TextField } from '../../ui/TextField';
import { iconFallback } from '../../ui/iconFallback';
import { colors, font, space } from '../../ui/theme';

const SAMPLE_DAY = 'school 8–3, dentist 16:00, swimming';

export default function PlannerPlanScreen() {
  const [dayText, setDayText] = useState(SAMPLE_DAY);
  const [status, setStatus] = useState('Type the day. Generate proposes. You approve before Supported view.');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(getLastDraft());

  async function onGenerate() {
    Keyboard.dismiss();
    setBusy(true);
    setStatus('Checking server… llama3.1:70b can take up to three minutes on first generate.');
    try {
      const profile = await loadProfile();
      const result = await generatePlan(dayText, profile);
      setDraft(getLastDraft());
      const badge = result.validation.ok ? 'valid' : result.validation.violations.join('; ');
      const source = result.source === 'llm' ? 'LLM' : 'template';
      setStatus(`${source} plan ${result.id.slice(0, 8)}. ${badge}. ${result.planner_notes ?? ''}`.trim());
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not generate. Cached plan is unchanged.');
    } finally {
      setBusy(false);
    }
  }

  async function onApprove() {
    Keyboard.dismiss();
    if (!draft) {
      setStatus('Generate first. Nothing new was approved.');
      return;
    }
    if (!draft.validation.ok) {
      setStatus('Fix validation issues before approve.');
      return;
    }
    setBusy(true);
    try {
      await approvePlanOnServer(draft.id, draft.plan);
      setStatus('Approved. Supported view now shows this day from the device cache.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Approve failed. Cached plan kept.');
    } finally {
      setBusy(false);
    }
  }

  const valid = draft?.validation.ok ?? false;

  return (
    <Screen
      bottom={
        <Column gap={space.md}>
          <PrimaryButton
            label={busy ? 'Working…' : 'Generate proposal'}
            onPress={() => {
              if (!busy) {
                void onGenerate();
              }
            }}
          />
          <PrimaryButton
            variant="outline"
            label="Approve plan"
            onPress={() => {
              if (!busy) {
                void onApprove();
              }
            }}
          />
        </Column>
      }
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Column gap={space.md}>
          <Text style={styles.title} accessibilityRole="header">
            Plan
          </Text>
          <Text style={styles.body}>{status}</Text>
          <TextField label="Day text" value={dayText} onChangeText={setDayText} multiline />
          {draft ? (
            <View style={[styles.badge, valid ? styles.badgeOk : styles.badgeBad]}>
              <Text style={styles.badgeText}>{valid ? '✓ Validate: ok' : '✕ Validate: issues'}</Text>
            </View>
          ) : null}
          {draft && !valid
            ? draft.validation.violations.map((item) => (
                <Text key={item} style={styles.issue}>
                  {item}
                </Text>
              ))
            : null}
          {draft?.planner_notes ? <Text style={styles.body}>{draft.planner_notes}</Text> : null}
          {draft?.plan.items.map((item) => (
            <View key={`${item.start}-${item.title}`} style={styles.itemCard}>
              <Pictogram size={56} label={item.title} fallback={iconFallback(item.icon_id)} />
              <Column gap={2} flex={1}>
                <Text style={styles.itemTitle}>
                  {item.start}–{item.end}  {item.title}
                </Text>
                <Text style={styles.itemMeta}>
                  {item.icon_id} · load {item.load}
                </Text>
              </Column>
            </View>
          ))}
          {draft?.plan.supports.map((support) => (
            <Row key={`${support.type}-${support.after_item}`} gap={space.sm}>
              <Text style={styles.supportIcon}>☕</Text>
              <Text style={styles.body}>
                Support after item {support.after_item + 1}: {support.reason}
              </Text>
            </Row>
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
  },
  itemMeta: {
    fontSize: font.body,
    color: colors.textDim,
  },
  issue: {
    fontSize: font.body,
    color: colors.danger,
  },
  supportIcon: {
    fontSize: 20,
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
