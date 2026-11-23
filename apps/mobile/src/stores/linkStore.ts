import type { DayPlan, Profile } from '@calmstep/shared';

import { apiRequest } from '../api/client';
import { cacheApprovedPlan, loadLatestApprovedPlan } from './planStore';
import { loadProfile, saveProfile } from './profileStore';
import { loadSettings, saveSettings } from './settingsStore';

export type LinkOffer = {
  pin: string;
  qr_payload: string;
  expires_at: string;
};

type AcceptOut = {
  profile_id: string;
  profile: Profile;
  plan: DayPlan | null;
  token: string;
};

export async function startLinkOffer(): Promise<LinkOffer> {
  const profile = await loadProfile();
  const stored = await loadLatestApprovedPlan();
  const plan = stored
    ? { date: stored.date, items: stored.items, supports: stored.supports }
    : null;
  const data = await apiRequest<LinkOffer>('/link/start', {
    method: 'POST',
    body: { profile, plan },
  });
  if (!data.pin || !data.qr_payload) {
    throw new Error('Link start did not return a PIN.');
  }
  return data;
}

export async function acceptLink(input: { pin?: string; qr_payload?: string }): Promise<void> {
  const data = await apiRequest<AcceptOut>('/link/accept', {
    method: 'POST',
    body: input,
  });
  if (!data.profile || !data.profile_id) {
    throw new Error('Link did not return a profile.');
  }
  await saveProfile(data.profile);
  if (data.plan && Array.isArray(data.plan.items)) {
    await cacheApprovedPlan(data.profile_id, data.plan);
  }
  const settings = await loadSettings();
  await saveSettings({ ...settings, linked_token: data.token, active_role: 'supported' });
}
