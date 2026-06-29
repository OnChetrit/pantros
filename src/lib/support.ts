import { Alert, Linking } from 'react-native';

import { buildMailtoUrl, legalConfig } from '@/lib/legal';

export async function contactSupport() {
  const url = buildMailtoUrl('Pantros support');
  const supported = await Linking.canOpenURL(url);

  if (!supported) {
    Alert.alert(
      'Email unavailable',
      `Email ${legalConfig.supportEmail} from another device or mail app.`
    );
    return;
  }

  await Linking.openURL(url);
}
