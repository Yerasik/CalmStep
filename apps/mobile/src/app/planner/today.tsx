import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { readParam, readRole } from '../../navigation/extras';
import { checkHealth, type ServerStatus } from '../../stores/serverStore';
import { Column } from '../../ui/Column';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { colors, font, space } from '../../ui/theme';

export default function PlannerTodayScreen() {
  const params = useLocalSearchParams<{ role?: string | string[]; from?: string | string[] }>();
  const role = readRole(params.role);
  const from = readParam(params.from);
  const [server, setServer] = useState<ServerStatus>('checking');

  useEffect(() => {
    void checkHealth().then((ok) => setServer(ok ? 'connected' : 'offline'));
  }, []);

  const chipLabel = server === 'checking' ? 'Server: …' : server === 'connected' ? 'Server: connected' : 'Server: offline';

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
      <Column gap={space.md}>
        <View style={[styles.chip, server === 'offline' ? styles.chipOff : styles.chipOn]}>
          <Text style={styles.chipText}>{chipLabel}</Text>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          PlannerToday
        </Text>
        <Text style={styles.body}>
          Approved plans stay on this device if the server is down. extra role={role}
          {from ? ` from=${from}` : ''}
        </Text>
      </Column>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    minHeight: 32,
    paddingHorizontal: 12,
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
    fontWeight: '600',
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
});
