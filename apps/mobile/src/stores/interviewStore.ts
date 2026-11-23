import type { Profile } from '@calmstep/shared';

import { interviewTurn } from './serverStore';
import { saveProfile } from './profileStore';

export type InterviewState = {
  sessionId?: string;
  turnIndex: number;
  question: string;
  asked: number;
  total: number;
  done: boolean;
  profile: Profile | null;
  source?: 'llm' | 'fixture';
  offline?: boolean;
};

export const LOCAL_QUESTIONS = [
  'What nickname should we use? (no real name)',
  'Who is answering: guardian or self?',
  'What age band? For example 7-10.',
  'How should we tell things: short words, pictures, or both?',
  'Which sounds, lights, or crowds are hard? (sensory load only)',
  'What do you see first when overload is coming? (no diagnosis)',
  'What helps: headphones, a quiet corner, water, something else?',
  'How many minutes of warning before a change? For example 5, 10.',
  'What motivators help the day go well?',
  'What must stay at a fixed time? For example lunch at 12:00.',
];

const DEFAULT_COPING = ['deep breaths', 'quiet corner', 'drink water'];

let state: InterviewState = {
  turnIndex: 0,
  question: '',
  asked: 0,
  total: LOCAL_QUESTIONS.length,
  done: false,
  profile: null,
};

let answers: string[] = [];

export function getInterviewState(): InterviewState {
  return state;
}

export function resetInterview(): void {
  answers = [];
  state = {
    turnIndex: 0,
    question: '',
    asked: 0,
    total: LOCAL_QUESTIONS.length,
    done: false,
    profile: null,
  };
}

function listFromText(text: string, fallback: string[] = []): string[] {
  const parts = text
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts.length > 0 ? parts : [...fallback];
}

function minutesFromText(text: string): number[] {
  return text
    .split(/[,;]/)
    .map((part) => Number(part.replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 4);
}

export function profileFromAnswers(source: string[] = answers): Profile {
  const at = (index: number) => source[index]?.trim() ?? '';
  const mins = minutesFromText(at(7));
  return {
    display_name: at(0).split(/\s+/)[0]?.slice(0, 32) || 'Friend',
    answered_by: at(1).toLowerCase().includes('self') ? 'self' : 'guardian',
    age_band: at(2).slice(0, 24) || 'unspecified',
    communication: listFromText(at(3), ['pictograms']),
    sensory_triggers: listFromText(at(4)),
    overload_signs: listFromText(at(5)),
    coping_strategies: listFromText(at(6), DEFAULT_COPING),
    transition_warnings_min: mins.length > 0 ? mins : [5, 10],
    motivators: listFromText(at(8)),
    must_stay_fixed: listFromText(at(9)),
  };
}

function localFromAnswers(): InterviewState {
  const asked = answers.length;
  if (asked >= LOCAL_QUESTIONS.length) {
    const profile = profileFromAnswers();
    state = {
      turnIndex: asked,
      question: 'Interview complete. Review the Profile Card.',
      asked,
      total: LOCAL_QUESTIONS.length,
      done: true,
      profile,
      source: 'fixture',
      offline: true,
    };
    return state;
  }
  state = {
    turnIndex: asked + 1,
    question: LOCAL_QUESTIONS[asked],
    asked,
    total: LOCAL_QUESTIONS.length,
    done: false,
    profile: null,
    source: 'fixture',
    offline: true,
  };
  return state;
}

function applyServer(
  data: {
    session_id: string;
    turn_index: number;
    question: string;
    done: boolean;
    profile: Profile | null;
    source?: 'llm' | 'fixture';
  },
  offline = false,
): InterviewState {
  const asked = answers.length;
  const profile = data.done ? (data.profile ?? profileFromAnswers()) : null;
  state = {
    sessionId: data.session_id,
    turnIndex: data.turn_index,
    question: data.question,
    asked,
    total: LOCAL_QUESTIONS.length,
    done: data.done,
    profile,
    source: data.source,
    offline,
  };
  return state;
}

/** Screen talks only to this store. The store talks to FastAPI, then a local script if the server is quiet. */
export async function startInterview(): Promise<InterviewState> {
  resetInterview();
  try {
    const data = await interviewTurn({ turn_index: 0 });
    const next = applyServer(data, false);
    if (next.done && next.profile) {
      await saveProfile(next.profile);
    }
    return next;
  } catch {
    return localFromAnswers();
  }
}

export async function replyInterview(reply: string): Promise<InterviewState> {
  const text = reply.trim();
  if (!text) {
    return state;
  }
  answers.push(text);

  if (state.offline || !state.sessionId) {
    const next = localFromAnswers();
    if (next.done && next.profile) {
      await saveProfile(next.profile);
    }
    return next;
  }

  try {
    const data = await interviewTurn({
      session_id: state.sessionId,
      reply: text,
      turn_index: state.turnIndex,
    });
    const next = applyServer(data, false);
    if (next.done) {
      const profile = profileFromAnswers();
      next.profile = profile;
      state.profile = profile;
      await saveProfile(profile);
    }
    return next;
  } catch {
    const next = localFromAnswers();
    if (next.done && next.profile) {
      await saveProfile(next.profile);
    }
    return next;
  }
}
