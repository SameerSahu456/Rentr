import PolicyPageLayout from './PolicyPageLayout'

const sections = [
  {
    title: 'How can I cancel my existing order?',
    content:
      'You can cancel an order up until one day before the agreed date of delivery without any extra cost. Once delivered, an existing order cannot be cancelled. However, you can opt for the 7-day free trial for your rented products. During this trial period, if the product does not meet your expectations, you may return it without any penalty. After the trial period expires, the rental agreement terms will apply in full.',
  },
  {
    title: 'Returns',
    content:
      'You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must have a manufacturing defect or must not match the specifications mentioned at the time of placing the order. The item must be in the same condition that you received it, with all original packaging, accessories, and documentation intact. Items that show signs of misuse, physical damage, or unauthorised modifications will not be eligible for return.',
  },
  {
    title: 'Refunds',
    content:
      'Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your original method of payment. You will receive the credit within 7-10 business days, depending on your card issuer or bank policies.',
  },
  {
    title: 'Shipping',
    content:
      'You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund. We recommend using a trackable shipping service or purchasing shipping insurance for items being returned, as we cannot guarantee that we will receive your returned item.',
  },
  {
    title: 'Can I close my rental subscription prior to the committed tenure?',
    content:
      'Yes, you can. In case of early termination of the rental agreement before the committed tenure, an early closure fee will be applicable. The early closure fee is calculated based on the remaining months of your rental tenure and the product category. Please contact our support team at Support@comprint.co.in for the exact early closure charges applicable to your rental plan. We recommend completing the full tenure to avoid any additional costs.',
  },
]

export default function CancellationReturnPage() {
  return (
    <PolicyPageLayout
      title="Cancellation and Return"
      subtitle="Anything you don't like about the order? If you are not entirely satisfied with your purchase, we're here to help."
      sections={sections}
    />
  )
}
