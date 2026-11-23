import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { acceptLink } from '../stores/linkStore';
import { Column } from '../ui/Column';
import { PrimaryButton } from '../ui/PrimaryButton';
import { Screen } from '../ui/Screen';
import { TextField } from '../ui/TextField';
import { colors, font, space } from '../ui/theme';

/**
 * Implicit Intent analog (Ch 6): open Camera to scan a QR.
 * PIN is the demo-safe path if camera is denied.
 */
export default function LinkDeviceScreen() {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('Type the 6-digit PIN, or scan the Planner QR.');
  const [busy, setBusy] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const handled = useRef(false);

  async function finish(input: { pin?: string; qr_payload?: string }) {
    if (busy) {
      return;
    }
    setBusy(true);
    try {
      await acceptLink(input);
      router.replace({ pathname: '/supported/day', params: { role: 'supported', from: 'link' } });
    } catch (err) {
      handled.current = false;
      setStatus(err instanceof Error ? err.message : 'Could not link. Try a new PIN.');
    } finally {
      setBusy(false);
    }
  }

  const cameraReady = permission?.granted === true;

  return (
    <Screen
      bottom={
        <PrimaryButton
          label={busy ? 'Working…' : 'Use PIN'}
          onPress={() => {
            Keyboard.dismiss();
            const digits = pin.replace(/\D/g, '');
            if (digits.length !== 6) {
              setStatus('Enter all 6 digits.');
              return;
            }
            void finish({ pin: digits });
          }}
        />
      }
    >
      <Column gap={space.md} flex={1}>
        <Text style={styles.icon}>🔗</Text>
        <Text style={styles.title} accessibilityRole="header">
          Link device
        </Text>
        <Text style={styles.body}>{status}</Text>
        <TextField
          label="6-digit PIN"
          value={pin}
          onChangeText={(text) => setPin(text.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          large
        />
        {cameraReady ? (
          <View style={styles.cameraBox}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => {
                if (handled.current || busy) {
                  return;
                }
                handled.current = true;
                void finish({ qr_payload: data });
              }}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.body}>
              Camera is off. The PIN above still works. No location.
            </Text>
            <PrimaryButton
              variant="outline"
              label="Allow camera"
              onPress={() => {
                void requestPermission();
              }}
            />
          </View>
        )}
      </Column>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 44,
    textAlign: 'center',
  },
  title: {
    fontSize: font.display,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 16,
    padding: space.md,
    gap: space.sm,
  },
  cameraBox: {
    minHeight: 220,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.hairline,
  },
  camera: {
    flex: 1,
    minHeight: 220,
  },
});
