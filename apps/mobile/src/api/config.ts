import Constants from 'expo-constants';

/**
 * HTTPS tunnel so Expo Go can reach FastAPI when the phone is not on this LAN.
 * Cleartext http://10.x or http://172.x is ignored: Expo Go often cannot open it.
 */
export const DEFAULT_API_BASE = 'https://copyright-chuck-stress-sufficient.trycloudflare.com';
export const REQUEST_TIMEOUT_MS = 10_000;
/** Generate may wait on Ollama. Interview uses a shorter cap so the first question is not stuck. */
export const LLM_REQUEST_TIMEOUT_MS = 180_000;
export const INTERVIEW_TIMEOUT_MS = 8_000;

export function apiBaseUrl(): string {
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined;
  const raw = extra?.apiBaseUrl ?? DEFAULT_API_BASE;
  if (raw.startsWith('http://')) {
    return DEFAULT_API_BASE;
  }
  return raw.replace(/\/$/, '');
}
