import type { Profile } from '@calmstep/shared';

import { getDb, nowLocalIso } from '../db/database';
import { SEED_PROFILE_ID } from './seed';

type ProfileRow = { id: string; json: string };

export async function loadProfile(): Promise<Profile | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT id, json FROM profiles WHERE id = ?',
    SEED_PROFILE_ID,
  );
  if (!row) {
    return null;
  }
  return JSON.parse(row.json) as Profile;
}

export async function saveProfile(profile: Profile): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE profiles SET json = ?, updated_at = ? WHERE id = ?',
    JSON.stringify(profile),
    nowLocalIso(),
    SEED_PROFILE_ID,
  );
}
