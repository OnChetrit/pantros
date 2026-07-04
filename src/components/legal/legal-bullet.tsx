import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';

import { styles } from './legal-screen.styles';

export function LegalBullet({children}: PropsWithChildren) {
  return <Text style={styles.bullet}>{`\u2022 ${children}`}</Text>;
}
