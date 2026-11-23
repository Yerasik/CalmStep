import type { DayPlan, Profile } from '@calmstep/shared';

import { apiRequest } from '../api/client';
import { INTERVIEW_TIMEOUT_MS, LLM_REQUEST_TIMEOUT_MS } from '../api/config';
import { cacheApprovedPlan, setLastDraft, type PlanValidation } from './planStore';

export type ServerStatus = 'checking' | 'connected' | 'offline';

type HealthOut = { ok: boolean };
type GenerateOut = {
  id: string;
  plan: DayPlan;
  validation: PlanValidation;
  source?: 'llm' | 'template';
  attempts?: number;
  planner_notes?: string;
};
type ApproveOut = { id: string; approved: boolean };

export type InterviewTurnOut = {
  session_id: string;
  question: string;
  turn_index: number;
  done: boolean;
  profile: Profile | null;
  source: 'llm' | 'fixture';
};

export async function checkHealth(): Promise<boolean> {
  try {
    const data = await apiRequest<HealthOut>('/health');
    return data.ok === true;
  } catch {
    return false;
  }
}

export async function interviewTurn(input: {
  session_id?: string;
  reply?: string;
  turn_index: number;
}): Promise<InterviewTurnOut> {
  const data = await apiRequest<InterviewTurnOut>('/interview/turn', {
    method: 'POST',
    timeoutMs: INTERVIEW_TIMEOUT_MS,
    body: {
      session_id: input.session_id,
      reply: input.reply,
      turn_index: input.turn_index,
    },
  });
  if (!data.question || typeof data.turn_index !== 'number') {
    throw new Error('Interview response was not a question.');
  }
  return data;
}

export async function generatePlan(dayText: string, profile: Profile | null): Promise<GenerateOut> {
  const data = await apiRequest<GenerateOut>('/plans/generate', {
    method: 'POST',
    timeoutMs: LLM_REQUEST_TIMEOUT_MS,
    body: { day_text: dayText, profile },
  });
  if (!data.id || !data.plan || !Array.isArray(data.plan.items)) {
    throw new Error('Generate response was not a plan.');
  }
  setLastDraft({
    id: data.id,
    plan: data.plan,
    validation: data.validation ?? { ok: false, violations: ['No validation payload.'] },
    source: data.source ?? 'template',
    attempts: data.attempts ?? 0,
    planner_notes: data.planner_notes ?? '',
  });
  return data;
}

export async function approvePlanOnServer(planId: string, plan: DayPlan): Promise<void> {
  const data = await apiRequest<ApproveOut>(`/plans/${planId}/approve`, { method: 'POST' });
  if (data.approved !== true) {
    throw new Error('Approve did not return approved=true.');
  }
  await cacheApprovedPlan(planId, plan);
}
