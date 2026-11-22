import { StyleSheet, View } from 'react-native';

import { colors } from './theme';

type TimelineTrackProps = {
  flex?: number;
};

/**
 * Empty Day Strip bar (Ch 4 View inside a stretched ViewGroup).
 * Marker motion is Stage 7 — this stage only reserves the track.
 */
export function TimelineTrack({ flex = 1 }: TimelineTrackProps) {
  return (
    <View style={[styles.wrap, { flex }]} accessibilityLabel="Day timeline, empty">
      <View style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    minHeight: 48,
  },
  bar: {
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.track,
  },
});
