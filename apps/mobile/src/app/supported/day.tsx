import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Text, View } from 'react-native';

import { setClockPlan } from '../../clock/clockService';
import { useClock } from '../../clock/useClock';
import { loadLatestApprovedPlan } from '../../stores/planStore';
import type { StoredPlan } from '../../stores/planStore';
import { loadSettings } from '../../stores/settingsStore';
import { Column } from '../../ui/Column';
import { iconFallback } from '../../ui/iconFallback';
import { Pictogram } from '../../ui/Pictogram';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { TimelineTrack } from '../../ui/TimelineTrack';
import { colors, font, space } from '../../ui/theme';

export default function SupportedDayScreen() {
  const [plan, setPlan] = useState<StoredPlan | null>(null);
  const [status, setStatus] = useState('Loading…');
  const [reduceMotion, setReduceMotion] = useState(true);
  const clock = useClock();

  useEffect(() => {
    let mounted = true;
    void loadSettings().then((settings) => {
      if (mounted) {
        setReduceMotion(settings.reduce_motion);
      }
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((osOn) => {
      if (mounted && osOn) {
        setReduceMotion(true);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (osOn) => {
      if (osOn) {
        setReduceMotion(true);
      } else {
        void loadSettings().then((settings) => setReduceMotion(settings.reduce_motion));
      }
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadLatestApprovedPlan()
        .then((next) => {
          setPlan(next);
          setClockPlan(next);
          setStatus(next ? `Plan ${next.date}` : 'No approved plan on this device yet.');
        })
        .catch(() => {
          setStatus('Could not read the plan.');
        });
    }, []),
  );

  const card = clock.card;
  const markerNowMs = reduceMotion
    ? Math.floor(clock.nowMs / 60_000) * 60_000
    : clock.nowMs;
  const remainingLabel =
    card && card.remaining === 1 ? '1 minute left' : card ? `${card.remaining} minutes left` : '';

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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Column gap={space.lg}>
          <View style={styles.nowCard}>
            {card ? (
              <Column gap={space.sm} align="center">
                <View style={[styles.kindChip, card.kind === 'now' ? styles.kindNow : styles.kindNext]}>
                  <Text style={styles.kindText}>{card.kind === 'now' ? 'NOW' : 'NEXT'}</Text>
                </View>
                <Pictogram
                  size={128}
                  label={card.item.title}
                  fallback={iconFallback(card.item.icon_id)}
                />
                <Text style={styles.nowTitle}>{card.item.title}</Text>
                <Text style={styles.remaining}>{remainingLabel}</Text>
                <Text style={styles.meta}>until {card.until}</Text>
              </Column>
            ) : (
              <Column gap={space.sm} align="center">
                <Text style={styles.emptyIcon}>🌤️</Text>
                <Text style={styles.nowTitle}>
                  {plan && plan.items.length > 0 ? 'Day is done' : 'Nothing on the strip'}
                </Text>
                <Text style={styles.meta}>{status}</Text>
              </Column>
            )}
          </View>
          {plan && plan.items.length > 0 ? (
            <TimelineTrack
              items={plan.items}
              nowMs={markerNowMs}
              reduceMotion={reduceMotion}
              currentStart={card?.item.start}
            />
          ) : (
            <Text style={styles.meta}>When a Planner approves a day, pictograms will sit on this track.</Text>
          )}
        </Column>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.lg,
  },
  nowCard: {
    backgroundColor: colors.surface,
    borderColor: colors.hairline,
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: space.lg,
    paddingHorizontal: space.md,
  },
  kindChip: {
    minHeight: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    justifyContent: 'center',
  },
  kindNow: {
    backgroundColor: colors.accent,
  },
  kindNext: {
    backgroundColor: colors.marker,
  },
  kindText: {
    color: '#FFFFFF',
    fontSize: font.title,
    fontWeight: '800',
    letterSpacing: 2,
  },
  nowTitle: {
    fontSize: font.display,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  remaining: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.accent,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
  },
  meta: {
    fontSize: font.body,
    color: colors.textDim,
    textAlign: 'center',
  },
});
