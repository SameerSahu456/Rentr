import PolicyPageLayout from './PolicyPageLayout'

const sections = [
  {
    title: 'Corporate Rental Solutions',
    content:
      'Rentr offers tailored IT rental solutions for corporates, startups, and enterprises of all sizes. Whether you need 10 laptops for a new team or 500 workstations for a large-scale deployment, we have the capacity, expertise, and product range to meet your requirements. Our corporate plans come with dedicated account management, priority support, and customised pricing based on volume and tenure.',
  },
  {
    title: 'Bulk Order Benefits',
    content: (
      <div>
        <p className="mb-3">
          Corporate clients enjoy several exclusive benefits:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Volume-based discounted rental rates</li>
          <li>Dedicated account manager for all orders</li>
          <li>Priority delivery and installation services</li>
          <li>Flexible tenure options and custom billing cycles</li>
          <li>Complimentary on-site technical support</li>
          <li>Asset management dashboard for tracking all rented equipment</li>
          <li>Custom configuration and branding options</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'How to Place a Corporate Enquiry',
    content:
      'To place a corporate enquiry, simply send an email to sales@comprint.co.in with your company name, contact details, and a brief description of your IT requirements including product type, quantity, and desired tenure. Our corporate sales team will get back to you within 24 hours with a customised quote and proposal. You can also call our sales helpline or fill out the enquiry form on our website.',
  },
  {
    title: 'Industries We Serve',
    content:
      'Rentr serves a wide range of industries including Information Technology, BFSI (Banking, Financial Services, and Insurance), Education, Healthcare, Manufacturing, Media & Entertainment, E-commerce, Government, and Co-working spaces. Our flexible rental models are designed to adapt to the unique needs and compliance requirements of each industry.',
  },
  {
    title: 'Service Level Agreements',
    content:
      'For corporate clients, we offer comprehensive Service Level Agreements (SLAs) that guarantee uptime, response times, and replacement timelines. Our standard SLA includes next-business-day replacement for faulty equipment, 4-hour response time for critical support tickets, and dedicated escalation paths. Custom SLAs can be negotiated based on your specific requirements and order volume.',
  },
  {
    title: 'Payment & Billing',
    content:
      'Corporate clients benefit from flexible payment terms including monthly billing with net-15 or net-30 payment cycles, quarterly advance payment with additional discounts, and annual prepayment options. We accept payments via bank transfer (NEFT/RTGS), cheque, and corporate credit cards. GST-compliant invoices are generated automatically for every billing cycle.',
  },
]

export default function CorporateEnquiriesPage() {
  return (
    <PolicyPageLayout
      title="Corporate Enquiries"
      subtitle="Looking to equip your team with the latest IT infrastructure? Rentr offers customised corporate rental plans to match your business needs."
      sections={sections}
    />
  )
}
