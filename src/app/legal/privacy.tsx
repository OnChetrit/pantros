import { LegalBullet, LegalParagraph, LegalScreen } from '@/components/legal/legal-screen';
import { legalConfig } from '@/lib/legal';

export default function PrivacyPolicyScreen() {
  return (
    <LegalScreen
      title="Privacy Policy"
      subtitle={`Last updated ${legalConfig.lastUpdated}. This policy explains how ${legalConfig.appName} collects, uses, shares, and deletes personal data.`}
    >
      <LegalScreen.Section title="Information we collect">
        <LegalBullet>
          Account information such as your name, email address, authentication
          provider, and Supabase user ID.
        </LegalBullet>
        <LegalBullet>
          Pantry content you create or join, including pantry names, membership,
          share codes, cart data, item names, barcodes, quantities, expiration
          dates, notes embedded in item names, and item image references.
        </LegalBullet>
        <LegalBullet>
          Notification data such as Expo push tokens, reminder settings, time
          zone, and notification delivery history used to avoid duplicate daily
          reminders.
        </LegalBullet>
        <LegalBullet>
          Images you choose to capture or import when using barcode or
          expiration scanning features.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="How we use information">
        <LegalBullet>
          To create and secure your account and keep you signed in.
        </LegalBullet>
        <LegalBullet>
          To store and sync your pantry, cart, and workspace data across your
          devices and with pantry members you invite.
        </LegalBullet>
        <LegalBullet>
          To send optional cart reminder notifications when you enable them.
        </LegalBullet>
        <LegalBullet>
          To process barcode and expiration scans when you choose to use those
          tools.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="When data is shared">
        <LegalBullet>
          Supabase is used as our backend processor for authentication,
          database, server functions, and related application infrastructure.
        </LegalBullet>
        <LegalBullet>
          OpenAI processes images submitted through the in-app barcode and
          expiration scanning features so the app can extract barcode digits or
          expiration dates from those images.
        </LegalBullet>
        <LegalBullet>
          Pantry members can see shared pantry, cart, and item data for any
          pantry they belong to.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="AI-assisted image scanning">
        <LegalParagraph>
          If you use the camera or photo-library scanning flows, the selected
          image may be transmitted to OpenAI for barcode or expiration-date
          extraction. We do not need that image to use the rest of the app, and
          manual entry remains available.
        </LegalParagraph>
        <LegalParagraph>
          In the current app version, these AI requests are made only when you
          intentionally start a scan. The project release plan also tracks a
          dedicated consent prompt that should be completed before App Store
          submission.
        </LegalParagraph>
      </LegalScreen.Section>

      <LegalScreen.Section title="Retention and deletion">
        <LegalBullet>
          Account, pantry, item, cart, membership, and reminder data are
          retained until you delete them, leave a pantry, or delete your
          account.
        </LegalBullet>
        <LegalBullet>
          When you delete your account from inside the app, your profile,
          memberships, notification preferences, push tokens, and related
          account data are deleted.
        </LegalBullet>
        <LegalBullet>
          If you own a pantry at deletion time, you must choose whether to
          transfer ownership to another active member or permanently delete that
          pantry and its related data.
        </LegalBullet>
        <LegalBullet>
          This project does not currently rely on Supabase Storage for item
          image uploads in production, but the account-deletion flow is prepared
          to remove matching storage objects if they are added later.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="Your choices">
        <LegalBullet>
          You can disable cart reminders from Settings at any time.
        </LegalBullet>
        <LegalBullet>
          You can sign out whenever you want.
        </LegalBullet>
        <LegalBullet>
          You can delete your account from the in-app Delete Account screen.
        </LegalBullet>
        <LegalBullet>
          If you do not want image data sent to OpenAI, do not use the AI scan
          flows and enter barcode or expiration details manually instead.
        </LegalBullet>
      </LegalScreen.Section>

      <LegalScreen.Section title="Security">
        <LegalParagraph>
          We use authenticated Supabase access controls, server-side account
          deletion logic, and provider-managed infrastructure to reduce
          unauthorized access. No system is perfectly secure, so you should only
          store information you are comfortable managing in a cloud-connected
          pantry app.
        </LegalParagraph>
      </LegalScreen.Section>

      <LegalScreen.Section title="Children's privacy">
        <LegalParagraph>
          {legalConfig.appName} is not directed to children under 13, and we do
          not knowingly collect personal information from children under 13.
        </LegalParagraph>
      </LegalScreen.Section>

      <LegalScreen.Section title="Contact">
        <LegalParagraph>
          For privacy questions, support requests, or deletion issues, contact{' '}
          {legalConfig.supportEmail}.
        </LegalParagraph>
      </LegalScreen.Section>
    </LegalScreen>
  );
}
