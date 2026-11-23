/**
 * CalmStep visual language (Ch 1 UX, Ch 4 layout).
 *
 * Ch 4 mapping (Android lecture name -> this file):
 * - View = a single node (Text, Image, the inner bar in TimelineTrack)
 * - ViewGroup = parent that lays out children
 * - LinearLayout vertical = Column
 * - LinearLayout horizontal = Row
 * - FrameLayout / Constraint overlay = Screen stacking a body column over a bottom action
 * - ImageView = Pictogram (glyph in a rounded card; Day Strip in Stage 7)
 *
 * The Day Strip marker uses React Native Animated (Expo Go). Reduce motion default is on.
 * SupportedDay also honours iOS Reduce Motion (AccessibilityInfo).
 */

export const colors = {
  bg: '#F3EFE6',
  surface: '#FFFDF8',
  surfaceTint: '#EBF2EE',
  text: '#1F2421',
  textDim: '#5B6660',
  accent: '#2C5F4A',
  accentSoft: '#D9E8E0',
  danger: '#8B2E2E',
  dangerSoft: '#F0DCDC',
  track: '#D9D2C4',
  marker: '#B45309',
  hairline: '#E3DCCF',
} as const;

export const font = {
  caption: 14,
  body: 16,
  title: 20,
  display: 28,
  hero: 34,
} as const;

export const space = {
  xs: 6,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const tapMin = 56;

export const reduceMotionDefault = true;
