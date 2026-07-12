import { LegalDocumentScreen } from '@/components/legal/legal-document-screen/legal-document-screen';
import { getLegalDocument } from '@/content/legal-content';
import { contactSupport } from '@/lib/support';

export default function SupportScreen() {
  const document = getLegalDocument('support');

  if (!document) {
    return null;
  }

  return (
    <LegalDocumentScreen
      document={document}
      actions={[
        {
          label: 'Email Support',
          onPress: () => {
            void contactSupport();
          },
        },
      ]}
    />
  );
}
