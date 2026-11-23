import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { readParam, readRole } from '../../navigation/extras';
import { setClockPlan } from '../../clock/clockService';
import { useClock } from '../../clock/useClock';
import { getLastBreakAt } from '../../stores/breakStore';
import { loadLatestApprovedPlan } from '../../stores/planStore';
import { checkHealth, type ServerStatus } from '../../stores/serverStore';
import { Column } from '../../ui/Column';
import { LinkShare } from '../../ui/LinkShare';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { colors, font, space } from '../../ui/theme';

export default function PlannerTodayScreen() {
  const params = useLocalSearchParams<{ role?: string | string[]; from?: string | string[] }>();
  const role = readRole(params.role);
  const from = readParam(params.from);
  const [server, setServer] = useState<ServerStatus>('checking');
  const [breakNote, setBreakNote] = useState('');
  const clock = useClock();

  useEffect(() => {
    void checkHealth().then((ok) => setServer(ok ? 'connected' : 'offline'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      const at = getLastBreakAt();
      if (!at) {
        setBreakNote('');
      } else {
        const pad = (n: number) => String(n).padStart(2, '0');
        setBreakNote(`Break used ${pad(at.getHours())}:${pad(at.getMinutes())} (this session only).`);
      }
      void loadLatestApprovedPlan().then((plan) => setClockPlan(plan));
    }, []),
  );

  const chipLabel =
    server === 'checking' ? 'Server: …' : server === 'connected' ? 'Server: connected' : 'Server: offline';

  return (
    <Screen
      bottom={
        <Column gap={space.md}>
          <PrimaryButton
            label="Open Supported day"
            onPress={() => {
              router.push({
                pathname: '/supported/day',
                params: { role: 'supported', from: 'planner-today' },
              });
            }}
          />
          <PrimaryButton
            variant="outline"
            label="Link a device"
            onPress={() => {
              router.push({ pathname: '/link-device', params: { role } });
            }}
          />
        </Column>
      }
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Column gap={space.md}>
          <View style={[styles.chip, server === 'offline' ? styles.chipOff : styles.chipOn]}>
            <Text style={styles.chipText}>{chipLabel}</Text>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Today
          </Text>
          <Text style={styles.body}>
            Approved plans stay on this device if the server is down.
            {from ? ' Came from: ' + from + '.' : ''}
          </Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Clock</Text>
            {clock.currentItem ? (
              <Text style={styles.body}>
                {clock.currentItem.title} · {clock.remainingSeconds}s left
              </Text>
            ) : (
              <Text style={styles.body}>Bound while this tab is open. No current item.</Text>
            )}
          </View>
          {breakNote ? (
            <View style={styles.card}>
              <Text style={styles.body}>{breakNote}</Text>
            </View>
          ) : null}
          <LinkShare />
        </Column>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.md,
  },
  chip: {
    alignSelf: 'flex-start',
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.accent,
  },
  chipOff: {
    backgroundColor: colors.danger,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: font.body,
    fontWeight: '700',
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 16,
    padding: space.md,
    gap: space.xs,
  },
  cardTitle: {
    fontSize: font.caption,
    fontWeight: '800',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
