import { Alert, Linking } from 'react-native';

import { LegalBullet, LegalParagraph, LegalScreen } from '@/components/legal/legal-screen';
import { buildMailtoUrl, legalConfig } from '@/lib/legal';

async function contactSupport() {
  const url = buildMailtoUrl('Pantry support');
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

export default function SupportScreen() {
  return (
    <LegalScreen
      title="Support"
      subtitle={`Need help with ${legalConfig.appName}? Use the contact details below.`}
      actions={[
        {
          label: 'Email Support',
          onPress: () => {
            void contactSupport();
          },
        },
      ]}
    >
      <LegalScreen.Section title="Contact">
        <LegalParagraph>
          Support email: {legalConfig.supportEmail}
        </LegalParagraph>
        <LegalParagraph>
          Target response time: {legalConfig.supportResponseWindow}
        </LegalParagraph>
      </LegalScreen.Section>

      <LegalScreen.Section title="What to include">
        <LegalBullet>
          The account email you use in the app.
        </LegalBullet>
        <LegalBullet>
          The device platform and app version.
        </LegalBullet>
        <LegalBullet>
          A short description of the issue and what you expected to happen.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="Account deletion help">
        <LegalParagraph>
          If the in-app deletion flow fails, contact support and include the
          email address tied to your account so the request can be reviewed.
        </LegalParagraph>
      </LegalScreen.Section>
    </LegalScreen>
  );
}
