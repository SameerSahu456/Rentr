import PolicyPageLayout from './PolicyPageLayout'

const sections = [
  {
    title: 'How the Referral Program Works',
    content:
      'The Rentr Referral Program rewards you for spreading the word. When you refer a friend, colleague, or business to Rentr and they complete their first rental order, both you and the referred customer earn referral rewards. Simply share your unique referral code or link, and once the referred person places and confirms their first order, the rewards are automatically credited to both accounts.',
  },
  {
    title: 'Referral Rewards',
    content:
      'For every successful referral, you will receive a rental credit of up to Rs. 500 that can be applied towards your next monthly rental payment. The referred customer will also receive a discount of up to Rs. 500 on their first rental order. Referral credits are applied automatically to your billing cycle and are valid for 6 months from the date of issuance. There is no limit on the number of referrals you can make.',
  },
  {
    title: 'Eligibility Criteria',
    content: (
      <div>
        <p className="mb-3">
          To be eligible for referral rewards, the following conditions must be
          met:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            You must be an active Rentr customer with a current rental
            subscription
          </li>
          <li>
            The referred customer must be a new customer who has not previously
            rented from Rentr
          </li>
          <li>
            The referred customer must complete KYC verification and place a
            rental order with a minimum tenure of 3 months
          </li>
          <li>
            The referred customer must use your unique referral code at the
            time of placing their order
          </li>
          <li>
            Self-referrals or referrals to existing customers are not eligible
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'How to Share Your Referral Code',
    content:
      'You can find your unique referral code in the "Referrals" section of your Rentr dashboard. Share your code via email, WhatsApp, social media, or any other channel. You can also copy your personalised referral link and share it directly. The referred person simply needs to enter your code during checkout or sign up through your referral link.',
  },
  {
    title: 'Reward Redemption',
    content:
      'Referral credits are automatically applied to your next billing cycle once the referred customer completes their first rental payment. You will receive an email and SMS notification when a referral reward is credited to your account. Credits cannot be exchanged for cash or transferred to another account. In case of any discrepancy, please contact our support team at Support@comprint.co.in.',
  },
  {
    title: 'Program Modifications & Termination',
    content:
      'Rentr reserves the right to modify, suspend, or terminate the referral program at any time without prior notice. Any changes to the program terms will be communicated via email and updated on this page. Existing earned rewards will be honoured even if the program is modified or discontinued. Rentr reserves the right to revoke referral rewards in cases of fraud, abuse, or violation of these terms.',
  },
]

export default function ReferralPage() {
  return (
    <PolicyPageLayout
      title="Referral Terms & Conditions"
      subtitle="Earn rewards by referring friends and businesses to Rentr. Here's everything you need to know about our referral program."
      sections={sections}
    />
  )
}
