const ICONS: Record<string, string> = {
  eat: '🍽',
  school: '🏫',
  lunch: '🥪',
  quiet: '📖',
  snack: '🍎',
  dinner: '🍲',
  break: '☕',
  dentist: '🦷',
  swim: '🏊',
  bus: '🚌',
  sleep: '🌙',
  home: '🏠',
  homework: '✏️',
  park: '🌳',
  bath: '🛁',
  play: '🧸',
  walk: '🚶',
  shop: '🛒',
};

export function iconFallback(iconId: string): string {
  return ICONS[iconId] ?? '■';
}
