import type { AnsweredBy, Profile } from '@calmstep/shared';
import { useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';

import { loadProfile, saveProfile } from '../../stores/profileStore';
import { loadSettings, saveSettings } from '../../stores/settingsStore';
import { Column } from '../../ui/Column';
import { LinkShare } from '../../ui/LinkShare';
import { PrimaryButton } from '../../ui/PrimaryButton';
import { Row } from '../../ui/Row';
import { Screen } from '../../ui/Screen';
import { TextField } from '../../ui/TextField';
import { colors, font, space } from '../../ui/theme';

function joinList(items: string[]): string {
  return items.join(', ');
}

function splitList(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export default function PlannerProfileScreen() {
  const [status, setStatus] = useState('Loading…');
  const [displayName, setDisplayName] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [answeredBy, setAnsweredBy] = useState<AnsweredBy>('guardian');
  const [communication, setCommunication] = useState('');
  const [triggers, setTriggers] = useState('');
  const [signs, setSigns] = useState('');
  const [coping, setCoping] = useState('');
  const [motivators, setMotivators] = useState('');
  const [fixed, setFixed] = useState('');
  const [warnings, setWarnings] = useState<number[]>([5, 10]);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [role, setRole] = useState<'planner' | 'supported'>('planner');
  const [token, setToken] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const profile = await loadProfile();
        const settings = await loadSettings();
        if (profile) {
          setDisplayName(profile.display_name);
          setAgeBand(profile.age_band);
          setAnsweredBy(profile.answered_by);
          setCommunication(joinList(profile.communication));
          setTriggers(joinList(profile.sensory_triggers));
          setSigns(joinList(profile.overload_signs));
          setCoping(joinList(profile.coping_strategies));
          setMotivators(joinList(profile.motivators));
          setFixed(joinList(profile.must_stay_fixed));
          setWarnings(profile.transition_warnings_min);
        }
        setReduceMotion(settings.reduce_motion);
        setSoundEnabled(settings.sound_enabled);
        setRole(settings.active_role);
        setToken(settings.linked_token);
        setStatus('Nickname only. No diagnosis.');
      } catch {
        setStatus('Could not load the profile.');
      }
    })();
  }, []);

  async function onSave() {
    Keyboard.dismiss();
    setStatus('Saving…');
    const profile: Profile = {
      display_name: displayName.trim() || 'Kit',
      answered_by: answeredBy,
      age_band: ageBand.trim(),
      communication: splitList(communication),
      sensory_triggers: splitList(triggers),
      overload_signs: splitList(signs),
      coping_strategies: splitList(coping),
      transition_warnings_min: warnings,
      motivators: splitList(motivators),
      must_stay_fixed: splitList(fixed),
    };
    try {
      await saveProfile(profile);
      await saveSettings({
        active_role: role,
        reduce_motion: reduceMotion,
        sound_enabled: soundEnabled,
        linked_token: token,
      });
      setStatus('Saved on this device.');
    } catch {
      setStatus('Could not save. Try again.');
    }
  }

  return (
    <Screen bottom={<PrimaryButton label="Save profile" onPress={() => void onSave()} />}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <Column gap={space.md}>
          <Text style={styles.title} accessibilityRole="header">
            Profile
          </Text>
          <Text style={styles.note}>{status}</Text>
          <TextField label="Nickname" value={displayName} onChangeText={setDisplayName} />
          <TextField label="Age band" value={ageBand} onChangeText={setAgeBand} />
          <Text style={styles.section}>Answered by</Text>
          <Row>
            <PrimaryButton
              flex={1}
              label="Guardian"
              variant={answeredBy === 'guardian' ? 'accent' : 'outline'}
              onPress={() => setAnsweredBy('guardian')}
            />
            <PrimaryButton
              flex={1}
              label="Self"
              variant={answeredBy === 'self' ? 'accent' : 'outline'}
              onPress={() => setAnsweredBy('self')}
            />
          </Row>
          <TextField
            label="Communication (comma list)"
            value={communication}
            onChangeText={setCommunication}
            multiline
          />
          <TextField label="Sensory triggers" value={triggers} onChangeText={setTriggers} multiline />
          <TextField label="Overload signs" value={signs} onChangeText={setSigns} multiline />
          <TextField label="Coping strategies" value={coping} onChangeText={setCoping} multiline />
          <TextField label="Motivators" value={motivators} onChangeText={setMotivators} multiline />
          <TextField label="Must stay fixed" value={fixed} onChangeText={setFixed} multiline />
          <Text style={styles.section}>Comfort</Text>
          <PrimaryButton
            label={reduceMotion ? 'Reduce motion: on' : 'Reduce motion: off'}
            variant={reduceMotion ? 'accent' : 'outline'}
            onPress={() => setReduceMotion((value) => !value)}
          />
          <PrimaryButton
            label={soundEnabled ? 'Sound: on' : 'Sound: off'}
            variant={soundEnabled ? 'accent' : 'outline'}
            onPress={() => setSoundEnabled((value) => !value)}
          />
          <LinkShare />
        </Column>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: space.lg,
  },
  title: {
    fontSize: font.display,
    fontWeight: '800',
    color: colors.text,
  },
  note: {
    fontSize: font.body,
    color: colors.textDim,
  },
  section: {
    fontSize: font.caption,
    fontWeight: '800',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
