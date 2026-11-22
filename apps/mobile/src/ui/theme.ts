/**
 * CalmStep visual language (Ch 1 UX, Ch 4 layout).
 *
 * Ch 4 mapping (Android lecture name -> this file):
 * - View = a single node (Text, Image, the inner bar in TimelineTrack)
 * - ViewGroup = parent that lays out children
 * - LinearLayout vertical = Column
 * - LinearLayout horizontal = Row
 * - FrameLayout / Constraint overlay = Screen stacking a body column over a bottom-third action
 * - ImageView = Pictogram (square Image; asset wired later)
 *
 * Stage 3 does not animate (Stage 7). reduceMotionDefault is on so later motion stays opt-in.
 * Honour iOS Reduce Motion when a later stage reads AccessibilityInfo.
 */

export const colors = {
  bg: '#F4F0E6',
  surface: '#FFFcf7',
  text: '#1A1A1A',
  accent: '#1A4A3A',
  danger: '#8B2E2E',
  track: '#D4CDBF',
  marker: '#9A3412',
} as const;

export const font = {
  body: 16,
  title: 20,
  display: 28,
} as const;

export const space = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const tapMin = 56;

export const reduceMotionDefault = true;
