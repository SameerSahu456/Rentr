import PolicyPageLayout from './PolicyPageLayout'

const sections = [
  {
    title: 'Agreement Overview',
    content:
      'These Rental Terms & Conditions constitute a legally binding agreement between the renter ("You") and Rentr ("We", "Us", "Our"). By placing a rental order on our platform, you acknowledge that you have read, understood, and agree to be bound by these terms. These terms govern the rental of all IT equipment and related services offered through the Rentr platform.',
  },
  {
    title: 'Rental Tenure & Pricing',
    content:
      'Rental plans are available for tenures ranging from 3 months to 36 months. Monthly rental charges are determined based on the product category, configuration, and chosen tenure. Longer tenures offer lower monthly rates. Rental charges are billed on a monthly basis and are due on the billing date specified in your rental agreement. Late payments may attract a penalty of up to 2% per month on the outstanding amount.',
  },
  {
    title: 'Security Deposit',
    content:
      'Rentr operates on a zero security deposit model for approved customers. Approval is subject to successful KYC verification and creditworthiness assessment. In certain cases, a refundable security deposit may be required based on the order value or customer profile. Any security deposit collected will be refunded within 15 business days of the successful return of rented equipment at the end of the tenure.',
  },
  {
    title: 'Equipment Usage & Care',
    content:
      'All rented equipment remains the property of Rentr throughout the rental tenure. You are responsible for the proper care and maintenance of the equipment during the rental period. The equipment must be used only for its intended purpose and in accordance with the manufacturer guidelines. Any damage caused by misuse, negligence, or unauthorised modifications will be charged to the renter.',
  },
  {
    title: 'Equipment Return',
    content:
      'At the end of the rental tenure, you must return the equipment in the same condition as received, subject to normal wear and tear. Our logistics team will coordinate the pickup of equipment from your registered address. Failure to return the equipment within 7 days of tenure expiry may result in additional rental charges and penalties. All original accessories, cables, and packaging must be returned along with the equipment.',
  },
  {
    title: 'Early Termination',
    content:
      'You may terminate your rental agreement before the committed tenure by providing 30 days written notice. Early termination will attract a closure fee equivalent to the remaining rental for a specified period as outlined in your rental agreement. The early closure fee varies based on the product, tenure, and the time elapsed since the start of the rental. Contact our support team for specific early closure calculations.',
  },
  {
    title: 'Damage & Loss',
    content:
      'In the event of equipment damage beyond normal wear and tear, repair or replacement costs will be borne by the renter. In case of theft or total loss of equipment, the renter is liable to pay the current market value of the equipment or the amount specified in the rental agreement, whichever is lower. We strongly recommend obtaining appropriate insurance coverage for all rented equipment.',
  },
  {
    title: 'Dispute Resolution',
    content:
      'Any disputes arising out of or in connection with this rental agreement shall be resolved through mutual discussion and negotiation. If a resolution cannot be reached amicably, the dispute shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in Mumbai, and the decision of the arbitrator shall be final and binding on both parties.',
  },
]

export default function RentalTermsPage() {
  return (
    <PolicyPageLayout
      title="Rental Terms & Conditions"
      subtitle="Please read these rental terms carefully before placing an order. These terms outline your rights and responsibilities as a renter."
      sections={sections}
    />
  )
}
