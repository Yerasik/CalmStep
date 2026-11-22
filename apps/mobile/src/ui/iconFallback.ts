const ICONS: Record<string, string> = {
  eat: '🍽',
  school: '🏫',
  lunch: '🥪',
  quiet: '📖',
  snack: '🍎',
  dinner: '🍲',
  break: '☕',
};

export function iconFallback(iconId: string): string {
  return ICONS[iconId] ?? '■';
}
