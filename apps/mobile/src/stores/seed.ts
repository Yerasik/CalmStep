import type { DayPlan, Profile } from '@calmstep/shared';

import { localMondayIsoDate } from '../db/database';

export const SEED_PROFILE_ID = 'seed-profile';
export const SEED_PLAN_ID = 'seed-monday';

export function seedProfile(): Profile {
  return {
    display_name: 'Kit',
    answered_by: 'guardian',
    age_band: '7-10',
    communication: ['short sentences', 'pictograms'],
    sensory_triggers: ['loud bells', 'crowded halls'],
    overload_signs: ['covers ears', 'goes quiet'],
    coping_strategies: ['headphones', 'quiet corner', 'water'],
    transition_warnings_min: [5, 10],
    motivators: ['trains', 'stickers'],
    must_stay_fixed: ['lunch at 12:00'],
  };
}

export function seedMondayPlan(): DayPlan {
  return {
    date: localMondayIsoDate(),
    items: [
      { start: '08:00', end: '08:30', title: 'Breakfast', icon_id: 'eat', load: 'low' },
      { start: '08:30', end: '12:00', title: 'School', icon_id: 'school', load: 'high' },
      { start: '12:00', end: '12:30', title: 'Lunch', icon_id: 'lunch', load: 'low' },
      { start: '12:30', end: '13:00', title: 'Quiet time', icon_id: 'quiet', load: 'low' },
      { start: '15:30', end: '16:00', title: 'Snack', icon_id: 'snack', load: 'low' },
      { start: '18:00', end: '18:30', title: 'Dinner', icon_id: 'eat', load: 'mid' },
    ],
    supports: [
      {
        type: 'break',
        after_item: 1,
        reason: 'School is high load; quiet time after lunch is already on the card.',
      },
    ],
  };
}
