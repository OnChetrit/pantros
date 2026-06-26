import { LegalBullet, LegalParagraph, LegalScreen } from '@/components/legal/legal-screen';
import { getLegalDocument } from '@/content/legal-content';

export default function PrivacyPolicyScreen() {
  const document = getLegalDocument('privacy');

  if (!document) {
    return null;
  }

  return (
    <LegalScreen
      title={document.title}
      subtitle={document.subtitle}
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
