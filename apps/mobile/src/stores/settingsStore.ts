import { getDb } from '../db/database';

export type SettingsKey = 'active_role' | 'reduce_motion' | 'sound_enabled' | 'linked_token';

export type AppSettings = {
  active_role: 'planner' | 'supported';
  reduce_motion: boolean;
  sound_enabled: boolean;
  linked_token: string;
};

export async function getSetting(key: SettingsKey): Promise<string> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? '';
}

export async function setSetting(key: SettingsKey, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export async function loadSettings(): Promise<AppSettings> {
  const active_role = (await getSetting('active_role')) === 'supported' ? 'supported' : 'planner';
  const reduce_motion = (await getSetting('reduce_motion')) !== '0';
  const sound_enabled = (await getSetting('sound_enabled')) === '1';
  const linked_token = await getSetting('linked_token');
  return { active_role, reduce_motion, sound_enabled, linked_token };
}

export async function saveSettings(next: AppSettings): Promise<void> {
  await setSetting('active_role', next.active_role);
  await setSetting('reduce_motion', next.reduce_motion ? '1' : '0');
  await setSetting('sound_enabled', next.sound_enabled ? '1' : '0');
  await setSetting('linked_token', next.linked_token);
}
