/** Device-local waking window. Matches backend validator 06:00–22:00. No UTC conversion. */

export const WAKE_START_MIN = 6 * 60;
export const WAKE_END_MIN = 22 * 60;
export const WAKE_SPAN_MIN = WAKE_END_MIN - WAKE_START_MIN;

export function hmToMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function minutesSinceMidnight(now: Date): number {
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

/** 0–1 along the Day Strip. Clamped so the marker stays on the bar. */
export function wakingProgress(now: Date): number {
  const t = minutesSinceMidnight(now);
  const raw = (t - WAKE_START_MIN) / WAKE_SPAN_MIN;
  if (raw < 0) {
    return 0;
  }
  if (raw > 1) {
    return 1;
  }
  return raw;
}

export function remainingMinutesUntil(hhmm: string, now: Date): number {
  return Math.ceil(remainingSecondsUntil(hhmm, now) / 60);
}

export function remainingSecondsUntil(hhmm: string, now: Date): number {
  const target = hmToMinutes(hhmm) * 60;
  const current = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return Math.max(0, target - current);
}
