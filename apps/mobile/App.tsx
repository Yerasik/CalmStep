import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/**
 * Stage 1 skeleton Activity (Ch 6 analog: one foreground screen / UIViewController).
 * No navigation, stores, LLM, or SQLite. Safe area covers notch / Dynamic Island / home indicator (Ch 1).
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen} edges={['top', 'right', 'bottom', 'left']}>
        <Text style={styles.title} accessibilityRole="header">
          CalmStep
        </Text>
        <Text style={styles.subtitle}>Stage 1 skeleton</Text>
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F4EC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
  },
});
