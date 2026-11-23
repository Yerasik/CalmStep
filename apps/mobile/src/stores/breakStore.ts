import * as Haptics from 'expo-haptics';

import { loadProfile } from './profileStore';
import { loadSettings } from './settingsStore';

/** Stage 8 locked: fallback if the cached profile has no coping_strategies. */
export const DEFAULT_COPING = ['deep breaths', 'quiet corner', 'drink water'];

/** Stage 8 locked: no bundled chime. Sound stays off unless a later stage adds a file. */
export const CHIME_BUNDLED = false;

/** Stage 8 locked. Skipped when reduce_motion is on. */
export const HAPTIC_ON_BREAK = true;

export type CopingStep = {
  label: string;
  icon_id: string;
};

let lastBreakAt: Date | null = null;

export function getLastBreakAt(): Date | null {
  return lastBreakAt;
}

export function noteBreakUsed(): void {
  lastBreakAt = new Date();
}

function iconForCoping(label: string): string {
  const text = label.toLowerCase();
  if (text.includes('walk')) {
    return 'walk';
  }
  if (text.includes('home')) {
    return 'home';
  }
  if (text.includes('water') || text.includes('drink')) {
    return 'snack';
  }
  if (text.includes('quiet') || text.includes('corner') || text.includes('breath') || text.includes('headphone')) {
    return 'quiet';
  }
  return 'break';
}

export function stepsFromStrategies(strategies: string[]): CopingStep[] {
  const source = strategies.length > 0 ? strategies : DEFAULT_COPING;
  return source.map((label) => ({ label, icon_id: iconForCoping(label) }));
}

export async function loadBreakSteps(): Promise<CopingStep[]> {
  const profile = await loadProfile();
  return stepsFromStrategies(profile?.coping_strategies ?? []);
}

/**
 * On opening Break: memory stamp, optional haptic.
 * Chime is not bundled (CHIME_BUNDLED = false). Never loop. Never surprise-play.
 */
export async function onOpenBreak(): Promise<void> {
  noteBreakUsed();
  const settings = await loadSettings();
  if (HAPTIC_ON_BREAK && !settings.reduce_motion) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  if (settings.sound_enabled && CHIME_BUNDLED) {
    return;
  }
}
