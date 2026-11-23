import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, View } from 'react-native';

import { readRole } from '../navigation/extras';
import { LOCAL_QUESTIONS, replyInterview, startInterview } from '../stores/interviewStore';
import { Column } from '../ui/Column';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Screen } from '../ui/Screen';
import { TextField } from '../ui/TextField';
import { colors, font, space } from '../ui/theme';

export default function InterviewScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = readRole(params.role);
  const [question, setQuestion] = useState('Loading the first question…');
  const [reply, setReply] = useState('');
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState('Nickname only. Not a legal name.');
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void startInterview()
      .then((state) => {
        if (cancelled) {
          return;
        }
        setQuestion(state.question);
        setAsked(state.asked);
        setDone(state.done);
        setStatus(
          state.offline
            ? 'Server did not answer. Questions stay on this phone.'
            : state.source === 'fixture'
              ? 'Scripted interview.'
              : 'LLM interview.',
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus(err instanceof Error ? err.message : 'Could not start the interview.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setBusy(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onNext() {
    Keyboard.dismiss();
    if (inFlight.current || busy) {
      return;
    }
    if (done) {
      router.push({ pathname: '/planner/profile', params: { role } });
      return;
    }
    const text = reply.trim();
    if (!text) {
      setStatus('Type a short answer first.');
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setStatus('One moment…');
    try {
      const state = await replyInterview(text);
      setReply('');
      setQuestion(state.question);
      setAsked(state.asked);
      setDone(state.done);
      setStatus(state.done ? 'Profile saved on this phone.' : 'One question at a time.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not send that answer.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const total = LOCAL_QUESTIONS.length;
  const answered = done ? total : asked;

  return (
    <Screen
      bottom={
        <PrimaryButton
          label={busy ? 'Working…' : done ? 'Review profile' : 'Next'}
          onPress={() => {
            void onNext();
          }}
        />
      }
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <Column gap={space.md}>
          <Text style={styles.title} accessibilityRole="header">
            Interview
          </Text>
          <View style={styles.progressRow} accessibilityLabel={`Question ${Math.min(asked + 1, total)} of ${total}`}>
            {LOCAL_QUESTIONS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index < answered && styles.dotDone,
                  !done && index === asked && styles.dotCurrent,
                ]}
              />
            ))}
            <Text style={styles.progressText}>
              {done ? `${total} of ${total}` : `${Math.min(asked + 1, total)} of ${total}`}
            </Text>
          </View>
          <Text style={styles.status}>{status}</Text>
          <View style={styles.card}>
            <Text style={styles.question}>{question}</Text>
          </View>
          {done ? null : (
            <TextField
              label="Your answer"
              value={reply}
              onChangeText={setReply}
              onSubmit={() => {
                void onNext();
              }}
            />
          )}
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
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.track,
  },
  dotDone: {
    backgroundColor: colors.accent,
  },
  dotCurrent: {
    backgroundColor: colors.marker,
    width: 22,
    borderRadius: 5,
  },
  progressText: {
    marginLeft: space.sm,
    fontSize: font.body,
    fontWeight: '700',
    color: colors.textDim,
  },
  status: {
    fontSize: font.body,
    lineHeight: 22,
    color: colors.textDim,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 18,
    padding: space.lg,
  },
  question: {
    fontSize: font.title,
    lineHeight: 30,
    color: colors.text,
    fontWeight: '700',
  },
});
