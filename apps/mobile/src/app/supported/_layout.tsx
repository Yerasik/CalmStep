import { Stack } from 'expo-router';

import { colors, font } from '../../ui/theme';

/**
 * Supported Navigation Controller (Ch 1). Swipe-back, header Back, no Planner tab bar, no menus.
 */
export default function SupportedLayout() {
  return (
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
      <Stack.Screen name="day" options={{ title: 'Day' }} />
      <Stack.Screen name="break" options={{ title: 'Break' }} />
    </Stack>
  );
}
