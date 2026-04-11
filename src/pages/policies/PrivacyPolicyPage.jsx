import PolicyPageLayout from './PolicyPageLayout'

const sections = [
  {
    title: 'Information We Collect',
    content:
      'We collect personal information that you voluntarily provide to us when registering on the platform, placing a rental order, or contacting us for support. This includes your name, email address, phone number, business details, billing address, delivery address, and KYC documentation such as PAN card, Aadhaar card, or GST certificate. We also automatically collect certain technical data including your IP address, browser type, device information, and usage patterns when you interact with our website.',
  },
  {
    title: 'How We Use Your Information',
    content:
      'We use your personal information to process and fulfill rental orders, verify your identity through KYC procedures, communicate with you about your account and orders, send promotional offers and updates (with your consent), improve our services and user experience, comply with legal obligations, and prevent fraud or unauthorised activity. We do not sell, trade, or rent your personal information to third parties for marketing purposes.',
  },
  {
    title: 'Data Sharing & Third Parties',
    content:
      'We may share your information with trusted third-party service providers who assist us in operating our platform, processing payments, delivering products, and conducting KYC verification. These partners are contractually obligated to keep your information confidential and use it only for the purposes specified by Rentr. We may also disclose your information if required by law, court order, or government regulation.',
  },
  {
    title: 'Data Security',
    content:
      'We implement industry-standard security measures to protect your personal information from unauthorised access, alteration, disclosure, or destruction. This includes SSL encryption for data transmission, secure storage with access controls, and regular security audits. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.',
  },
  {
    title: 'Cookies & Tracking Technologies',
    content:
      'Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyse site traffic, and personalise content. You can control cookie preferences through your browser settings. Disabling cookies may limit certain features of the website. We use analytics tools like Google Analytics to understand how visitors interact with our site.',
  },
  {
    title: 'Your Rights',
    content:
      'You have the right to access, update, or delete your personal information at any time by logging into your account or contacting our support team. You may also opt out of marketing communications by clicking the unsubscribe link in our emails. If you wish to have your account and associated data permanently deleted, please contact us at Support@comprint.co.in and we will process your request within 30 business days.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'We reserve the right to update this Privacy Policy at any time. Any changes will be posted on this page with a revised effective date. We encourage you to review this policy periodically to stay informed about how we are protecting your information. Continued use of our services after any changes constitutes acceptance of the updated policy.',
  },
]

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout
      title="Privacy Policy"
      subtitle="Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information."
      sections={sections}
    />
  )
}
