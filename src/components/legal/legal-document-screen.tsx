import type { LegalDocument } from '@/content/legal-content';

import {
  LegalBullet,
  LegalParagraph,
  LegalScreen,
} from '@/components/legal/legal-screen';

export function LegalDocumentScreen({
  document,
  showHeader = true,
  actions,
}: {
  document: LegalDocument;
  showHeader?: boolean;
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
      showHeader={showHeader}
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
