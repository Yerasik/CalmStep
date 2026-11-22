import type { DayPlan, PlanItem } from '@calmstep/shared';

import { getDb, localHm, nowLocalIso } from '../db/database';

type PlanRow = { id: string; date: string; approved: number; json: string };

export type StoredPlan = DayPlan & { id: string; approved: boolean };

export type DraftPlan = { id: string; plan: DayPlan };

let lastDraft: DraftPlan | null = null;

export function setLastDraft(draft: DraftPlan): void {
  lastDraft = draft;
}

export function getLastDraft(): DraftPlan | null {
  return lastDraft;
}

export async function cacheApprovedPlan(id: string, plan: DayPlan): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO plans (id, date, approved, json, updated_at)
     VALUES (?, ?, 1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       date = excluded.date,
       approved = 1,
       json = excluded.json,
       updated_at = excluded.updated_at`,
    id,
    plan.date,
    JSON.stringify(plan),
    nowLocalIso(),
  );
}

export async function loadLatestApprovedPlan(): Promise<StoredPlan | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PlanRow>(
    'SELECT id, date, approved, json FROM plans WHERE approved = 1 ORDER BY date DESC, updated_at DESC LIMIT 1',
  );
  if (!row) {
    return null;
  }
  const plan = JSON.parse(row.json) as DayPlan;
  return { ...plan, id: row.id, approved: row.approved === 1 };
}

export function pickCurrentItem(plan: DayPlan, now = new Date()): PlanItem | null {
  if (plan.items.length === 0) {
    return null;
  }
  const t = localHm(now);
  const match = plan.items.find((item) => item.start <= t && t < item.end);
  return match ?? plan.items[0];
}
