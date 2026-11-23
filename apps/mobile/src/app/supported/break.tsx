import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { loadBreakSteps, onOpenBreak, type CopingStep } from '../../stores/breakStore';
import { Column } from '../../ui/Column';
import { Pictogram } from '../../ui/Pictogram';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Screen } from '../../ui/Screen';
import { iconFallback } from '../../ui/iconFallback';
import { colors, font, space } from '../../ui/theme';

export default function BreakScreen() {
  const [steps, setSteps] = useState<CopingStep[]>([]);
  const [status, setStatus] = useState('Loading…');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        try {
          const next = await loadBreakSteps();
          if (active) {
            setSteps(next);
            setStatus('');
          }
          await onOpenBreak();
        } catch {
          if (active) {
            setStatus('Could not load coping steps.');
          }
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen
      bottom={
        <PrimaryButton
          label="Done"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace({ pathname: '/supported/day', params: { role: 'supported' } });
          }}
        />
      }
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Column gap={space.md}>
          <Text style={styles.breathIcon}>🍃</Text>
          <Text style={styles.title} accessibilityRole="header">
            I need a break
          </Text>
          <Text style={styles.body}>Take your time. These steps come from this profile.</Text>
          {status ? <Text style={styles.body}>{status}</Text> : null}
          {steps.map((step, index) => (
            <View key={step.label} style={styles.stepCard}>
              <Pictogram size={64} label={step.label} fallback={iconFallback(step.icon_id)} />
              <Column gap={4} flex={1}>
                <Text style={styles.stepNumber}>Step {index + 1}</Text>
                <Text style={styles.step}>{step.label}</Text>
              </Column>
            </View>
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
  breathIcon: {
    fontSize: 56,
    textAlign: 'center',
  },
  title: {
    fontSize: font.display,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.textDim,
    textAlign: 'center',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 18,
    padding: space.md,
  },
  stepNumber: {
    fontSize: font.caption,
    fontWeight: '700',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  step: {
    fontSize: font.title,
    fontWeight: '700',
    color: colors.text,
  },
});
