import { AppState, type NativeEventSubscription } from 'react-native';

import type { DayPlan, PlanItem } from '@calmstep/shared';

import { pickNowCard, type NowCard } from '../stores/planStore';
import { remainingSecondsUntil } from './waking';

/**
 * Clock module (COMP3330 Ch 7 / Ch 2 / Ch 8).
 *
 * Lecture (Android): a *started* service can run with no UI; a *bound* service
 * exists while clients bind and goes away when the last client unbinds.
 *
 * What we ship on iOS: this is the bound analog only. Screens subscribe on
 * focus and unsubscribe on blur. One setInterval is the owner. When the
 * subscriber count is 0, the interval is cleared. We do not use a started
 * daemon, a wake lock, or Background Fetch to keep the phone awake. iOS will
 * suspend the app; the next tick after resume uses Date() so the marker is
 * still right. No LLM work runs here.
 *
 * lead_notification is locked false (no local notification).
 */
export const LEAD_NOTIFICATION = false;

export type ClockSnapshot = {
  now: Date;
  nowMs: number;
  currentItem: PlanItem | null;
  remainingSeconds: number;
  card: NowCard | null;
};

type Listener = (snap: ClockSnapshot) => void;

const listeners = new Set<Listener>();
let intervalId: ReturnType<typeof setInterval> | null = null;
let appSub: NativeEventSubscription | null = null;
let plan: DayPlan | null = null;
let lastSnap: ClockSnapshot = emptySnapshot(new Date());

function emptySnapshot(now: Date): ClockSnapshot {
  return {
    now,
    nowMs: now.getTime(),
    currentItem: null,
    remainingSeconds: 0,
    card: null,
  };
}

export function readClock(): ClockSnapshot {
  return lastSnap;
}

export function setClockPlan(next: DayPlan | null): void {
  plan = next;
  emit();
}

export function subscribeClock(listener: Listener): () => void {
  listeners.add(listener);
  listener(compute(new Date()));
  ensureInterval();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopInterval();
    }
  };
}

function ensureInterval(): void {
  if (intervalId !== null) {
    return;
  }
  intervalId = setInterval(() => emit(), 1000);
  appSub = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      emit();
    }
  });
}

function stopInterval(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  appSub?.remove();
  appSub = null;
}

function compute(now: Date): ClockSnapshot {
  if (!plan || plan.items.length === 0) {
    return emptySnapshot(now);
  }
  const card = pickNowCard(plan, now);
  return {
    now,
    nowMs: now.getTime(),
    currentItem: card?.item ?? null,
    remainingSeconds: card ? remainingSecondsUntil(card.until, now) : 0,
    card,
  };
}

function emit(): void {
  lastSnap = compute(new Date());
  listeners.forEach((listener) => listener(lastSnap));
}
