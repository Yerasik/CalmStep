import Constants from 'expo-constants';

/** iPhone must use the Mac LAN IP. localhost on the phone is the phone. */
export const DEFAULT_API_BASE = 'http://172.20.10.4:8080';
export const REQUEST_TIMEOUT_MS = 10_000;

export function apiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  const raw = extra?.apiBaseUrl ?? DEFAULT_API_BASE;
  return raw.replace(/\/$/, '');
}
