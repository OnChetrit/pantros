import { legalConfig } from '@/lib/legal';

export type LegalSectionContent =
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string };

export type LegalDocument = {
  slug: 'privacy' | 'terms' | 'support';
  title: string;
  subtitle: string;
  sections: {
    title: string;
    content: LegalSectionContent[];
  }[];
};

export function getLegalDocuments(): LegalDocument[] {
  return [
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      subtitle: `Last updated ${legalConfig.lastUpdated}. This policy explains how ${legalConfig.appName} collects, uses, shares, and deletes personal data.`,
      sections: [
        {
          title: 'Information we collect',
          content: [
            {
              type: 'bullet',
              text: 'Account information such as your name, email address, authentication provider, and Supabase user ID.',
            },
            {
              type: 'bullet',
              text: 'Pantry content you create or join, including pantry names, membership, share codes, cart data, item names, barcodes, quantities, expiration dates, notes embedded in item names, and item image references.',
            },
            {
              type: 'bullet',
              text: 'Notification data such as Expo push tokens, reminder settings, time zone, and notification delivery history used to avoid duplicate daily reminders.',
            },
            {
              type: 'bullet',
              text: 'Images you choose to capture or import when using barcode or expiration scanning features.',
            },
          ],
        },
        {
          title: 'How we use information',
          content: [
            {
              type: 'bullet',
              text: 'To create and secure your account and keep you signed in.',
            },
            {
              type: 'bullet',
              text: 'To store and sync your pantry, cart, and workspace data across your devices and with pantry members you invite.',
            },
            {
              type: 'bullet',
              text: 'To send optional cart reminder notifications when you enable them.',
            },
            {
              type: 'bullet',
              text: 'To process barcode and expiration scans when you choose to use those tools.',
            },
          ],
        },
        {
          title: 'When data is shared',
          content: [
            {
              type: 'bullet',
              text: 'Supabase is used as our backend processor for authentication, database, server functions, and related application infrastructure.',
            },
            {
              type: 'bullet',
              text: 'OpenAI processes images submitted through the in-app barcode and expiration scanning features so the app can extract barcode digits or expiration dates from those images.',
            },
            {
              type: 'bullet',
              text: 'Pantry members can see shared pantry, cart, and item data for any pantry they belong to.',
            },
          ],
        },
        {
          title: 'AI-assisted image scanning',
          content: [
            {
              type: 'paragraph',
              text: 'If you use the camera or photo-library scanning flows, the selected image may be transmitted to OpenAI for barcode or expiration-date extraction. We do not need that image to use the rest of the app, and manual entry remains available.',
            },
            {
              type: 'paragraph',
              text: 'In the current app version, these AI requests are made only when you intentionally start a scan and first accept the in-app disclosure for the current consent version.',
            },
            {
              type: 'paragraph',
              text: 'The disclosure identifies OpenAI as the processor, explains that the selected image is uploaded solely to extract barcode digits or expiration dates, and can be withdrawn later from Settings.',
            },
          ],
        },
        {
          title: 'Retention and deletion',
          content: [
            {
              type: 'bullet',
              text: 'Account, pantry, item, cart, membership, and reminder data are retained until you delete them, leave a pantry, or delete your account.',
            },
            {
              type: 'bullet',
              text: 'When you delete your account from inside the app, your profile, memberships, notification preferences, push tokens, and related account data are deleted.',
            },
            {
              type: 'bullet',
              text: "Deleting your Pantry account does not automatically revoke any Apple or Google authorization you previously granted at the identity provider level. If you signed in with one of those providers, remove Pantry from that provider's connected-app settings separately if you no longer want the authorization to remain there.",
            },
            {
              type: 'bullet',
              text: 'If you own a pantry at deletion time, you must choose whether to transfer ownership to another active member or permanently delete that pantry and its related data.',
            },
            {
              type: 'bullet',
              text: 'This project does not currently rely on Supabase Storage for item image uploads in production, but the account-deletion flow is prepared to remove matching storage objects if they are added later.',
            },
            {
              type: 'bullet',
              text: 'AI scan consent records are stored on your profile with the accepted disclosure version and grant or withdrawal timestamps.',
            },
          ],
        },
        {
          title: 'Your choices',
          content: [
            {
              type: 'bullet',
              text: 'You can disable cart reminders from Settings at any time.',
            },
            {
              type: 'bullet',
              text: 'You can sign out whenever you want.',
            },
            {
              type: 'bullet',
              text: 'You can delete your account from the in-app Delete Account screen.',
            },
            {
              type: 'bullet',
              text: 'You can withdraw AI scan consent from Settings at any time. After withdrawal, enter barcode or expiration details manually instead.',
            },
          ],
        },
        {
          title: 'Security',
          content: [
            {
              type: 'paragraph',
              text: 'We use authenticated Supabase access controls, server-side account deletion logic, and provider-managed infrastructure to reduce unauthorized access. No system is perfectly secure, so you should only store information you are comfortable managing in a cloud-connected pantry app.',
            },
          ],
        },
        {
          title: "Children's privacy",
          content: [
            {
              type: 'paragraph',
              text: `${legalConfig.appName} is not directed to children under 13, and we do not knowingly collect personal information from children under 13.`,
            },
          ],
        },
        {
          title: 'Contact',
          content: [
            {
              type: 'paragraph',
              text: `For privacy questions, support requests, or deletion issues, contact ${legalConfig.supportEmail}.`,
            },
          ],
        },
      ],
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      subtitle: `${legalConfig.appName} is provided as a cloud-connected pantry management service.`,
      sections: [
        {
          title: 'Use of the service',
          content: [
            {
              type: 'bullet',
              text: 'Use the app only for lawful household, personal, or team pantry management.',
            },
            {
              type: 'bullet',
              text: 'Keep your sign-in credentials secure and do not access pantries you are not authorized to use.',
            },
            {
              type: 'bullet',
              text: 'Do not upload content that is unlawful, infringes rights, or attempts to interfere with the app or its infrastructure.',
            },
          ],
        },
        {
          title: 'Shared pantry responsibilities',
          content: [
            {
              type: 'paragraph',
              text: 'Pantry content may be visible to other members of the same pantry. If you invite others, you are responsible for the shared information you add to that pantry.',
            },
          ],
        },
        {
          title: 'AI features',
          content: [
            {
              type: 'paragraph',
              text: 'Barcode and expiration scanning are assistive tools. Extracted values can be wrong, incomplete, or unavailable, and you remain responsible for confirming important product details before saving or acting on them.',
            },
          ],
        },
        {
          title: 'Availability and changes',
          content: [
            {
              type: 'bullet',
              text: 'The app may change, be updated, or be interrupted without notice while the product is still evolving.',
            },
            {
              type: 'bullet',
              text: 'Some features depend on third-party providers including Supabase, Expo, Apple, Google, and OpenAI.',
            },
          ],
        },
        {
          title: 'Termination',
          content: [
            {
              type: 'paragraph',
              text: 'You may stop using the app at any time by signing out or deleting your account. We may restrict abusive or harmful use of the service if needed to protect the product or other users.',
            },
          ],
        },
        {
          title: 'Contact',
          content: [
            {
              type: 'paragraph',
              text: `Questions about these terms can be sent to ${legalConfig.supportEmail}.`,
            },
          ],
        },
      ],
    },
    {
      slug: 'support',
      title: 'Support',
      subtitle: `Need help with ${legalConfig.appName}? Use the contact details below.`,
      sections: [
        {
          title: 'Contact',
          content: [
            {
              type: 'paragraph',
              text: `Support email: ${legalConfig.supportEmail}`,
            },
            {
              type: 'paragraph',
              text: `Target response time: ${legalConfig.supportResponseWindow}`,
            },
          ],
        },
        {
          title: 'What to include',
          content: [
            {
              type: 'bullet',
              text: 'The account email you use in the app.',
            },
            {
              type: 'bullet',
              text: 'The device platform and app version.',
            },
            {
              type: 'bullet',
              text: 'A short description of the issue and what you expected to happen.',
            },
          ],
        },
        {
          title: 'Account deletion help',
          content: [
            {
              type: 'paragraph',
              text: 'If the in-app deletion flow fails, contact support and include the email address tied to your account so the request can be reviewed.',
            },
          ],
        },
      ],
    },
  ];
}

export function getLegalDocument(slug: LegalDocument['slug']) {
  return getLegalDocuments().find((document) => document.slug === slug) ?? null;
}
