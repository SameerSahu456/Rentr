import PolicyPageLayout from './PolicyPageLayout'

const sections = [
  {
    title: 'Shipping & Delivery Overview',
    content:
      'At Rentr, we are committed to delivering your rented IT equipment safely and on time. We offer free delivery across all serviceable locations in India. Our logistics partners ensure careful handling and timely dispatch of all orders. Delivery timelines may vary based on your location and product availability.',
  },
  {
    title: 'Delivery Timelines',
    content:
      'Standard delivery typically takes 3-7 business days from the date of order confirmation and successful KYC verification. For metro cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, and Ahmedabad), delivery is usually completed within 3-5 business days. For other locations, delivery may take 5-7 business days. Express delivery options may be available for select products and locations at an additional cost.',
  },
  {
    title: 'Shipping Charges',
    content:
      'Rentr provides free shipping on all rental orders to any serviceable location across India. There are no hidden delivery charges or setup fees. However, in case of returns due to early termination or product swap requests, return shipping charges may apply as per the terms of your rental agreement.',
  },
  {
    title: 'Order Tracking',
    content:
      'Once your order is dispatched, you will receive a tracking number via email and SMS. You can use this tracking number to monitor the real-time status of your delivery on our website or through the logistics partner portal. Our support team is also available 24/7 to assist you with any delivery-related queries.',
  },
  {
    title: 'Installation & Setup',
    content:
      'For select products, Rentr offers complimentary installation and setup services at the time of delivery. Our trained technicians will ensure the equipment is properly configured and ready to use. If on-site setup is not included with your order, detailed setup guides will be provided along with remote support assistance.',
  },
  {
    title: 'Damaged or Missing Items',
    content:
      'Please inspect all delivered items carefully at the time of delivery. If you notice any damage or missing items, please report it immediately to our support team at Support@comprint.co.in within 24 hours of delivery. We will arrange a replacement or resolution at no extra cost. Always retain the original packaging until you have verified the contents.',
  },
]

export default function ShippingPolicyPage() {
  return (
    <PolicyPageLayout
      title="Shipping Policy"
      subtitle="Learn about our shipping processes, delivery timelines, and how we ensure your rented equipment reaches you safely."
      sections={sections}
    />
  )
}
