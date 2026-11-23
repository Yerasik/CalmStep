import { ImageSourcePropType } from 'react-native';

const ASSETS: Record<string, ImageSourcePropType> = {
  eat: require('../../assets/icons/eat.png'),
  school: require('../../assets/icons/school.png'),
  lunch: require('../../assets/icons/lunch.png'),
  quiet: require('../../assets/icons/quiet.png'),
  snack: require('../../assets/icons/snack.png'),
  dinner: require('../../assets/icons/dinner.png'),
  break: require('../../assets/icons/break.png'),
  dentist: require('../../assets/icons/dentist.png'),
  swim: require('../../assets/icons/swim.png'),
  bus: require('../../assets/icons/bus.png'),
  sleep: require('../../assets/icons/sleep.png'),
  home: require('../../assets/icons/home.png'),
  homework: require('../../assets/icons/homework.png'),
  park: require('../../assets/icons/park.png'),
  bath: require('../../assets/icons/bath.png'),
  play: require('../../assets/icons/play.png'),
  walk: require('../../assets/icons/walk.png'),
  shop: require('../../assets/icons/shop.png'),
};

export function iconAsset(iconId: string): ImageSourcePropType | undefined {
  return ASSETS[iconId];
}
