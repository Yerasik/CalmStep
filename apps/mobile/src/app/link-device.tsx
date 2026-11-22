import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { readRole } from '../navigation/extras';
import { ScreenScaffold } from '../ui/ScreenScaffold';

export default function LinkDeviceScreen() {
  const params = useLocalSearchParams<{ role?: string | string[] }>();
  const role = readRole(params.role);

  return (
    <ScreenScaffold
      title="LinkDevice"
      note="QR is the phone feature. PIN is the demo-safe path. Camera is not opened in this stage."
      extras={`extra role=${role}`}
      primaryLabel="Use PIN and open day"
      onPrimary={() => {
        router.push({ pathname: '/supported/day', params: { role: 'supported', from: 'pin' } });
      }}
    >
      <View style={styles.qrBox}>
        <Text style={styles.qrLabel}>QR placeholder</Text>
      </View>
      <Text style={styles.pin}>PIN 000000</Text>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  qrBox: {
    marginTop: 24,
    width: 160,
    height: 160,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  pin: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 4,
  },
});
