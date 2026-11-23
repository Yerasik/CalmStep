import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { PlanItem } from '@calmstep/shared';

import { wakingProgress } from '../clock/waking';
import { Pictogram } from './Pictogram';
import { iconFallback } from './iconFallback';
import { colors, font, space } from './theme';

const MARKER_WIDTH = 8;
const ICON = 64;

type TimelineTrackProps = {
  items: PlanItem[];
  nowMs: number;
  reduceMotion: boolean;
  currentStart?: string;
};

/**
 * Day Strip (Ch 10 ImageView analog + moving marker).
 * Marker x = (now - 06:00) / (22:00 - 06:00) * trackWidth.
 * Expo Go SDK 58 crashes when Reanimated 4.7 writes animated styles
 * (`keysLastWrittenByAnimatedStyle` is missing natively), so the marker
 * uses React Native Animated. Reduce motion snaps; otherwise 1s linear.
 */
export function TimelineTrack({ items, nowMs, reduceMotion, currentStart }: TimelineTrackProps) {
  const progress = useRef(new Animated.Value(wakingProgress(new Date(nowMs)))).current;
  const [barWidth, setBarWidth] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    setBarWidth(event.nativeEvent.layout.width);
  }

  useEffect(() => {
    const next = wakingProgress(new Date(nowMs));
    if (reduceMotion) {
      progress.setValue(next);
      return;
    }
    Animated.timing(progress, {
      toValue: next,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [nowMs, reduceMotion, progress]);

  const travel = Math.max(0, barWidth - MARKER_WIDTH);
  const markerStyle = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, travel],
        }),
      },
    ],
  };

  return (
    <View style={styles.wrap} accessibilityLabel="Day timeline">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {items.map((item) => {
          const active = item.start === currentStart;
          return (
            <View key={`${item.start}-${item.title}`} style={[styles.slot, active && styles.slotActive]}>
              <Pictogram size={ICON} label={item.title} fallback={iconFallback(item.icon_id)} />
              <Text style={[styles.title, active && styles.timeActive]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.time, active && styles.timeActive]}>{item.start}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.barWrap} onLayout={onLayout}>
        <View style={styles.bar} />
        <Animated.View accessibilityLabel="You are here" style={[styles.marker, markerStyle]} />
      </View>
      <Text style={styles.here}>you are here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    justifyContent: 'center',
    gap: space.sm,
  },
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.sm,
    minWidth: '100%',
  },
  slot: {
    alignItems: 'center',
    width: 96,
    padding: 6,
    borderRadius: 16,
  },
  slotActive: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.marker,
  },
  title: {
    marginTop: 6,
    fontSize: font.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  time: {
    marginTop: 2,
    fontSize: font.body,
    color: colors.text,
  },
  timeActive: {
    fontWeight: '700',
    color: colors.marker,
  },
  barWrap: {
    height: 28,
    justifyContent: 'center',
  },
  bar: {
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.track,
  },
  marker: {
    position: 'absolute',
    width: MARKER_WIDTH,
    height: 28,
    borderRadius: 4,
    backgroundColor: colors.marker,
  },
  here: {
    fontSize: font.body,
    color: colors.marker,
    fontWeight: '600',
  },
});
