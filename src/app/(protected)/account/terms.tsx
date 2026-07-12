import { LegalDocumentScreen } from '@/components/legal/legal-document-screen/legal-document-screen';
import { getLegalDocument } from '@/content/legal-content';

export default function AccountTermsScreen() {
  const document = getLegalDocument('terms');

  if (!document) {
    return null;
  }

  return <LegalDocumentScreen document={document} />;
}
