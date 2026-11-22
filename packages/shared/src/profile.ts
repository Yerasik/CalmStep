export type AnsweredBy = 'guardian' | 'self';

export type Profile = {
  display_name: string;
  answered_by: AnsweredBy;
  age_band: string;
  communication: string[];
  sensory_triggers: string[];
  overload_signs: string[];
  coping_strategies: string[];
  transition_warnings_min: number[];
  motivators: string[];
  must_stay_fixed: string[];
};
