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

export async function saveProfile(profile: Profile, id: string = SEED_PROFILE_ID): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO profiles (id, json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
    id,
    JSON.stringify(profile),
    nowLocalIso(),
  );
}
