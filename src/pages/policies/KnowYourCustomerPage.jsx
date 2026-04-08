import PolicyPageLayout from './PolicyPageLayout'

const sections = [
  {
    title: 'Why KYC is Required',
    content:
      'Know Your Customer (KYC) verification is a mandatory process that helps us verify your identity and ensure the security of our rental services. KYC verification protects both you and Rentr from fraud, identity theft, and misuse of rented equipment. Completing KYC is a one-time process, and once approved, you can place multiple orders without repeating the verification.',
  },
  {
    title: 'Documents Required for Individuals',
    content: (
      <div>
        <p className="mb-3">
          Individual renters are required to submit the following documents for
          KYC verification:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Identity Proof:</strong> PAN Card (mandatory), Aadhaar
            Card, Passport, or Voter ID
          </li>
          <li>
            <strong>Address Proof:</strong> Aadhaar Card, Utility Bill (not
            older than 3 months), Rent Agreement, or Passport
          </li>
          <li>
            <strong>Photograph:</strong> Recent passport-size photograph
          </li>
          <li>
            <strong>Bank Statement:</strong> Latest 3 months bank statement or
            salary slips
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Documents Required for Businesses',
    content: (
      <div>
        <p className="mb-3">
          Business entities are required to submit the following documents:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>GST Certificate:</strong> Valid GST registration
            certificate
          </li>
          <li>
            <strong>Company PAN Card:</strong> PAN card of the business entity
          </li>
          <li>
            <strong>Certificate of Incorporation:</strong> For Private Limited
            and LLP companies
          </li>
          <li>
            <strong>Authorised Signatory ID:</strong> PAN and Aadhaar of the
            authorised signatory
          </li>
          <li>
            <strong>Business Address Proof:</strong> Utility bill or lease
            agreement for the registered office
          </li>
          <li>
            <strong>Bank Statement:</strong> Latest 6 months business bank
            account statement
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Verification Process',
    content:
      'Once you submit your KYC documents, our verification team will review them within 24-48 business hours. You will receive an email and SMS notification once your KYC is approved or if additional documents are required. In some cases, we may conduct a video verification call or request a physical visit to your registered address for high-value orders. The entire process is designed to be quick, secure, and hassle-free.',
  },
  {
    title: 'Data Privacy & Security',
    content:
      'All KYC documents submitted to Rentr are stored securely using industry-standard encryption and access controls. Your documents are used solely for the purpose of identity verification and credit assessment. We do not share your KYC documents with any third party except our authorised verification partners who are bound by strict confidentiality agreements. You may request deletion of your KYC data by contacting our support team.',
  },
  {
    title: 'Re-verification',
    content:
      'KYC approval is typically valid for the duration of your rental relationship with Rentr. However, we may request re-verification in certain cases such as a change in your registered address, updates to your business structure, or as required by regulatory compliance. We will notify you well in advance if re-verification is needed and guide you through the process.',
  },
]

export default function KnowYourCustomerPage() {
  return (
    <PolicyPageLayout
      title="Know Your Customer"
      subtitle="Complete your KYC verification to start renting. It's a simple one-time process that ensures a safe and secure rental experience."
      sections={sections}
    />
  )
}
