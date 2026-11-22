import { getDb, nowLocalIso } from '../db/database';
import { SEED_PLAN_ID, SEED_PROFILE_ID, seedMondayPlan, seedProfile } from './seed';

/**
 * Open SQLite, seed once. Called from root layout, not from screens' SQL.
 */
export async function bootstrapLocalData(): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM profiles');
  if (!existing || existing.n === 0) {
    const profile = seedProfile();
    const plan = seedMondayPlan();
    const stamp = nowLocalIso();
    await db.runAsync(
      'INSERT INTO profiles (id, json, updated_at) VALUES (?, ?, ?)',
      SEED_PROFILE_ID,
      JSON.stringify(profile),
      stamp,
    );
    await db.runAsync(
      'INSERT INTO plans (id, date, approved, json, updated_at) VALUES (?, ?, ?, ?, ?)',
      SEED_PLAN_ID,
      plan.date,
      1,
      JSON.stringify(plan),
      stamp,
    );
  }

  await db.runAsync(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('active_role', 'planner')",
  );
  await db.runAsync(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('reduce_motion', '1')",
  );
  await db.runAsync(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('sound_enabled', '0')",
  );
  await db.runAsync(
    "INSERT OR IGNORE INTO settings (key, value) VALUES ('linked_token', '')",
  );
}
