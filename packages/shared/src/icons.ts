import catalog from '../icons.json';

export type IconEntry = {
  id: string;
  label: string;
  asset: string;
};

export const ICON_CATALOG: IconEntry[] = catalog.icons;
export const ICON_IDS: string[] = ICON_CATALOG.map((entry) => entry.id);
