import { Alert, Linking } from 'react-native';

import { LegalBullet, LegalParagraph, LegalScreen } from '@/components/legal/legal-screen';
import { getLegalDocument } from '@/content/legal-content';
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
  const document = getLegalDocument('support');

  if (!document) {
    return null;
  }

  return (
    <LegalScreen
      title={document.title}
      subtitle={document.subtitle}
      actions={[
        {
          label: 'Email Support',
          onPress: () => {
            void contactSupport();
          },
        },
      ]}
    >
      {document.sections.map((section) => (
        <LegalScreen.Section key={section.title} title={section.title}>
          {section.content.map((item, index) =>
            item.type === 'bullet' ? (
              <LegalBullet key={`${section.title}-${index}`}>{item.text}</LegalBullet>
            ) : (
              <LegalParagraph key={`${section.title}-${index}`}>{item.text}</LegalParagraph>
            )
          )}
        </LegalScreen.Section>
      ))}
    </LegalScreen>
  );
}
