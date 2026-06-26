import { LegalBullet, LegalParagraph, LegalScreen } from '@/components/legal/legal-screen';
import { legalConfig } from '@/lib/legal';

export default function TermsScreen() {
  return (
    <LegalScreen
      title="Terms of Service"
      subtitle={`${legalConfig.appName} is provided as a cloud-connected pantry management service.`}
    >
      <LegalScreen.Section title="Use of the service">
        <LegalBullet>
          Use the app only for lawful household, personal, or team pantry
          management.
        </LegalBullet>
        <LegalBullet>
          Keep your sign-in credentials secure and do not access pantries you
          are not authorized to use.
        </LegalBullet>
        <LegalBullet>
          Do not upload content that is unlawful, infringes rights, or attempts
          to interfere with the app or its infrastructure.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="Shared pantry responsibilities">
        <LegalParagraph>
          Pantry content may be visible to other members of the same pantry. If
          you invite others, you are responsible for the shared information you
          add to that pantry.
        </LegalParagraph>
      </LegalScreen.Section>

      <LegalScreen.Section title="AI features">
        <LegalParagraph>
          Barcode and expiration scanning are assistive tools. Extracted values
          can be wrong, incomplete, or unavailable, and you remain responsible
          for confirming important product details before saving or acting on
          them.
        </LegalParagraph>
      </LegalScreen.Section>

      <LegalScreen.Section title="Availability and changes">
        <LegalBullet>
          The app may change, be updated, or be interrupted without notice while
          the product is still evolving.
        </LegalBullet>
        <LegalBullet>
          Some features depend on third-party providers including Supabase,
          Expo, Apple, Google, and OpenAI.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="Termination">
        <LegalParagraph>
          You may stop using the app at any time by signing out or deleting your
          account. We may restrict abusive or harmful use of the service if
          needed to protect the product or other users.
        </LegalParagraph>
      </LegalScreen.Section>

      <LegalScreen.Section title="Contact">
        <LegalParagraph>
          Questions about these terms can be sent to {legalConfig.supportEmail}.
        </LegalParagraph>
      </LegalScreen.Section>
    </LegalScreen>
  );
}
