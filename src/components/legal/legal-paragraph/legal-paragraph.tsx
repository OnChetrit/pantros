import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';

import { styles } from '../legal-screen/legal-screen.styles';

export function LegalParagraph({children}: PropsWithChildren) {
  return <Text style={styles.paragraph}>{children}</Text>;
}
