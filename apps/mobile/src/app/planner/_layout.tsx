import { Tabs } from 'expo-router';

import { colors, font, tapMin } from '../../ui/theme';

/**
 * Planner Activity with three Fragments / child VCs (Ch 6): Today, Plan, Profile.
 * Supported routes live in a different stack and must not show this tab bar.
 */
export default function PlannerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: font.title, fontWeight: '600' },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#555555',
        tabBarLabelStyle: { fontSize: font.body, fontWeight: '600' },
        tabBarStyle: {
          minHeight: tapMin,
          backgroundColor: colors.bg,
          borderTopColor: colors.track,
        },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
