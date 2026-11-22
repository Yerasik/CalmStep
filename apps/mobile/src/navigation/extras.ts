/**
 * Intent extras analog (Ch 6): typed route params, not SharedPreferences.
 * Screens read these via Expo Router. No persistence in Stage 2.
 */
export type RoleExtra = 'planner' | 'supported';

export function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

export function readRole(value: string | string[] | undefined): RoleExtra {
  return readParam(value) === 'supported' ? 'supported' : 'planner';
}
