import type { DayPlan, Profile } from '@calmstep/shared';

import { apiRequest } from '../api/client';
import { cacheApprovedPlan, setLastDraft } from './planStore';

export type ServerStatus = 'checking' | 'connected' | 'offline';

type HealthOut = { ok: boolean };
type GenerateOut = {
  id: string;
  plan: DayPlan;
  validation: { ok: boolean; violations: string[] };
};
type ApproveOut = { id: string; approved: boolean };

export async function checkHealth(): Promise<boolean> {
  try {
    const data = await apiRequest<HealthOut>('/health');
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function generatePlan(dayText: string, profile: Profile | null): Promise<GenerateOut> {
  const data = await apiRequest<GenerateOut>('/plans/generate', {
    method: 'POST',
    body: { day_text: dayText, profile },
  });
  if (!data.id || !data.plan || !Array.isArray(data.plan.items)) {
    throw new Error('Generate response was not a plan.');
  }
  setLastDraft({ id: data.id, plan: data.plan });
  return data;
}

export async function approvePlanOnServer(planId: string, plan: DayPlan): Promise<void> {
  const data = await apiRequest<ApproveOut>(`/plans/${planId}/approve`, { method: 'POST' });
  if (data.approved !== true) {
    throw new Error('Approve did not return approved=true.');
  }
  await cacheApprovedPlan(planId, plan);
}
