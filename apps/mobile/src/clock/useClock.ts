import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { readClock, subscribeClock, type ClockSnapshot } from './clockService';

/** Bind to the clock while this screen is focused (Ch 2 onResume / onPause analog). */
export function useClock(): ClockSnapshot {
  const [snap, setSnap] = useState<ClockSnapshot>(readClock);

  useFocusEffect(
    useCallback(() => {
      const unbind = subscribeClock(setSnap);
      return unbind;
    }, []),
  );

  return snap;
}
