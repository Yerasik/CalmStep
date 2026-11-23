import type { DayPlan, PlanItem } from '@calmstep/shared';

import { remainingMinutesUntil } from '../clock/waking';
import { getDb, localHm, nowLocalIso } from '../db/database';

type PlanRow = { id: string; date: string; approved: number; json: string };

export type StoredPlan = DayPlan & { id: string; approved: boolean };

export type PlanValidation = { ok: boolean; violations: string[] };

export type DraftPlan = {
  id: string;
  plan: DayPlan;
  validation: PlanValidation;
  source: 'llm' | 'template';
  attempts: number;
  planner_notes: string;
};

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
  const card = pickNowCard(plan, now);
  return card?.item ?? null;
}

export type NowCard = {
  item: PlanItem;
  kind: 'now' | 'next';
  until: string;
  remaining: number;
};

export function pickNowCard(plan: DayPlan, now = new Date()): NowCard | null {
  if (plan.items.length === 0) {
    return null;
  }
  const t = localHm(now);
  const current = plan.items.find((item) => item.start <= t && t < item.end);
  if (current) {
    return {
      item: current,
      kind: 'now',
      until: current.end,
      remaining: remainingMinutesUntil(current.end, now),
    };
  }
  const upcoming = plan.items.find((item) => item.start > t);
  if (!upcoming) {
    return null;
  }
  return {
    item: upcoming,
    kind: 'next',
    until: upcoming.start,
    remaining: remainingMinutesUntil(upcoming.start, now),
  };
}
