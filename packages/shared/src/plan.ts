export type LoadLevel = 'low' | 'mid' | 'high';

export type PlanItem = {
  start: string;
  end: string;
  title: string;
  icon_id: string;
  load: LoadLevel;
};

export type PlanSupport = {
  type: string;
  after_item: number;
  reason: string;
};

export type DayPlan = {
  date: string;
  items: PlanItem[];
  supports: PlanSupport[];
};
