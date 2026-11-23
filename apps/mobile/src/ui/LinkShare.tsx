import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect } from 'expo-router';

import { startLinkOffer, type LinkOffer } from '../stores/linkStore';
import { Column } from './Column';
import { PrimaryButton } from './PrimaryButton';
import { colors, font, space } from './theme';

/** Planner-side PIN + QR. Token is only inside the QR bits; we never print it. */
export function LinkShare() {
  const [offer, setOffer] = useState<LinkOffer | null>(null);
  const [status, setStatus] = useState('Making a PIN…');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const next = await startLinkOffer();
      setOffer(next);
      setStatus('PIN lasts 10 minutes. QR is the camera feature. PIN is the demo-safe path.');
    } catch (err) {
      setOffer(null);
      setStatus(
        err instanceof Error
          ? err.message
          : 'Cannot make a PIN until the planner server is on. Cached day still works.',
      );
    } finally {
      setBusy(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={styles.card}>
      <Column gap={space.md}>
        <Text style={styles.label}>Link a Supported device</Text>
        <Text style={styles.body}>{status}</Text>
        {offer ? (
          <View style={styles.qrWrap}>
            <QRCode value={offer.qr_payload} size={180} backgroundColor="#FFFFFF" color={colors.text} />
          </View>
        ) : null}
        {offer ? <Text style={styles.pin}>{offer.pin}</Text> : null}
        <PrimaryButton
          variant="outline"
          label={busy ? 'Working…' : 'New PIN'}
          onPress={() => {
            if (!busy) {
              void refresh();
            }
          }}
        />
      </Column>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 18,
    padding: space.lg,
  },
  label: {
    fontSize: font.title,
    fontWeight: '800',
    color: colors.text,
  },
  body: {
    fontSize: font.body,
    lineHeight: 24,
    color: colors.textDim,
  },
  qrWrap: {
    alignSelf: 'center',
    padding: space.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.hairline,
    borderRadius: 18,
  },
  pin: {
    fontSize: font.display,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 10,
    textAlign: 'center',
  },
});
