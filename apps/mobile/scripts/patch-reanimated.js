/**
 * Expo Go's native Reanimated can omit keysLastWrittenByAnimatedStyle.
 * The 4.7 JS then throws "Cannot convert undefined value to object" and the app dies.
 */
const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/react-native-reanimated/src/PropsRegistryGarbageCollector.ts',
  'node_modules/react-native-reanimated/lib/module/PropsRegistryGarbageCollector.js',
];

const from = 'for (const key of keysLastWrittenByAnimatedStyle) {';
const to = 'for (const key of keysLastWrittenByAnimatedStyle ?? []) {';

for (const rel of files) {
  const file = path.join(__dirname, '..', rel);
  if (!fs.existsSync(file)) {
    continue;
  }
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes(to) || !src.includes(from)) {
    continue;
  }
  fs.writeFileSync(file, src.replace(from, to));
  console.log('patched', rel);
}
