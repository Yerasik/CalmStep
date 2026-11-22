import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { loadLatestApprovedPlan, pickCurrentItem } from '../../stores/planStore';
import type { StoredPlan } from '../../stores/planStore';
import { Column } from '../../ui/Column';
import { iconFallback } from '../../ui/iconFallback';
import { Pictogram } from '../../ui/Pictogram';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Row } from '../../ui/Row';
import { Screen } from '../../ui/Screen';
import { TimelineTrack } from '../../ui/TimelineTrack';
import { colors, font, space } from '../../ui/theme';

export default function SupportedDayScreen() {
  const [plan, setPlan] = useState<StoredPlan | null>(null);
  const [status, setStatus] = useState('Loading…');

  useEffect(() => {
    void loadLatestApprovedPlan()
      .then((next) => {
        setPlan(next);
        setStatus(next ? `Plan ${next.date}` : 'No approved plan on this device.');
      })
      .catch(() => {
        setStatus('Could not read the plan.');
      });
  }, []);

  const current = plan && plan.items.length > 0 ? pickCurrentItem(plan) : null;

  return (
    <Screen
      bottom={
        <PrimaryButton
          label="I need a break"
          onPress={() => {
            router.push({ pathname: '/supported/break', params: { role: 'supported' } });
          }}
        />
      }
    >
      <Column flex={1} gap={space.lg}>
        <View style={styles.nowCard}>
          <Row gap={space.md} align="center">
            <Pictogram
              label={current?.title ?? 'Current activity'}
              fallback={iconFallback(current?.icon_id ?? 'eat')}
            />
            <Column gap={space.sm} flex={1}>
              <Text style={styles.nowLabel}>NOW</Text>
              <Text style={styles.nowTitle}>{current?.title ?? '—'}</Text>
              <Text style={styles.meta}>
                {current ? `${current.start}–${current.end}` : status}
              </Text>
            </Column>
          </Row>
        </View>
        <TimelineTrack />
        <Column gap={space.sm}>
          {plan?.items.map((item) => (
            <Text key={`${item.start}-${item.title}`} style={styles.meta}>
              {item.start} {item.title}
            </Text>
          ))}
        </Column>
      </Column>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nowCard: {
    backgroundColor: colors.surface,
    borderColor: colors.track,
    borderWidth: 2,
    borderRadius: 16,
    padding: space.md,
  },
  nowLabel: {
    fontSize: font.title,
    fontWeight: '700',
    color: colors.marker,
  },
  nowTitle: {
    fontSize: font.display,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: font.body,
    color: colors.text,
  },
});

