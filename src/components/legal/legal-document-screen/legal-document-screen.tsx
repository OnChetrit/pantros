import type { LegalDocument } from '@/content/legal-content';

import {
  LegalBullet,
  LegalParagraph,
  LegalScreen,
} from '@/components/legal/legal-screen/legal-screen';

export function LegalDocumentScreen({
  document,
  actions,
}: {
  document: LegalDocument;
  actions?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  }[];
}) {
  return (
    <LegalScreen
      title={document.title}
      subtitle={document.subtitle}
      actions={actions}
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
