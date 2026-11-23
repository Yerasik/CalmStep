import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { bootstrapLocalData } from '../stores/bootstrap';
import { Screen } from '../ui/Screen';
import { colors, font } from '../ui/theme';

/**
 * Root Navigation Controller analog (Ch 1 / Ch 6).
 * Bootstrap SQLite off the UI thread (Ch 8) before screens read stores.
 */
export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void bootstrapLocalData()
      .then(() => setReady(true))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not open local storage.');
      });
  }, []);

  if (error) {
    return (
      <Screen>
        <Text style={styles.message}>{error}</Text>
      </Screen>
    );
  }

  if (!ready) {
    return (
      <Screen>
        <Text style={styles.message}>Loading…</Text>
      </Screen>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: font.title, fontWeight: '600' },
          contentStyle: { backgroundColor: colors.bg },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'CalmStep' }} />
        <Stack.Screen name="interview" options={{ title: 'Interview' }} />
        <Stack.Screen name="plan-review" options={{ title: 'Plan review' }} />
        <Stack.Screen name="link-device" options={{ title: 'Link device' }} />
        <Stack.Screen name="planner" options={{ headerShown: false, title: 'Planner' }} />
        <Stack.Screen name="supported" options={{ headerShown: false, title: 'Supported' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: font.body,
    color: colors.text,
  },
});
