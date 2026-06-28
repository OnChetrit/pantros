import { Alert } from 'react-native';

import { AI_CONSENT_VERSION, hasActiveAiConsent } from '@/lib/ai-consent';
import { useAppContext } from '@/state/app-context';

export function useAiConsent() {
  const { grantAiConsent, hasAiConsent, profile } = useAppContext();

  const ensureAiConsent = async () => {
    if (hasAiConsent) {
      return true;
    }

    const decision = await new Promise<boolean>((resolve) => {
      Alert.alert(
        'Allow AI image scanning?',
        'Pantros sends the selected image to OpenAI to extract barcode digits or expiration dates. The image is uploaded only for that scan, manual entry stays available, and you can withdraw consent later in Settings.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Accept',
            onPress: () => resolve(true),
          },
        ]
      );
    });

    if (!decision) {
      return false;
    }

    await grantAiConsent(AI_CONSENT_VERSION);
    return hasActiveAiConsent({
      aiConsentVersion: AI_CONSENT_VERSION,
      aiConsentGrantedAt: profile?.aiConsentGrantedAt ?? new Date().toISOString(),
      aiConsentWithdrawnAt: null,
    });
  };

  return {
    ensureAiConsent,
  };
}
