import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'When does the product need to be serviced? Will servicing be charged additionally?',
    answer: 'Products are serviced as per the schedule defined in your rental agreement. Servicing is included in your rental plan at no additional cost.',
  },
  {
    question: 'How many months warranty does the product come with?',
    answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
  {
    question: 'Why are rentals changing with tenure?',
    answer: 'Longer rental tenures offer better monthly rates because the total cost is spread over a longer period, reducing the per-month expense for you.',
  },
  {
    question: 'How many port does the server comprise of?',
    answer: 'The number of ports varies by server model. Please check the individual product specifications page for detailed port information.',
  },
  {
    question: 'When does the product need to be serviced? Will servicing be charged additionally?',
    answer: 'Regular servicing is included in all rental plans. Emergency repairs are also covered under the Rentr warranty.',
  },
  {
    question: 'Is the RAM build in?',
    answer: 'RAM specifications depend on the product configuration you choose. All details are listed on each product page.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(1)

  return (
    <section className="py-16 md:py-24 bg-white" id="faqs">
      <div className="section-container max-w-4xl mx-auto">
        <h2 className="font-heading text-[20px] md:text-[24px] font-bold text-gray-secondary mb-10">
          Customer Questions & Answers
        </h2>

        {/* FAQ Items */}
        <div className="divide-y divide-gray-200">
          {faqs.map((faq, i) => (
            <div key={i} className="py-5">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className={`text-sm font-medium transition-colors ${
                  openIndex === i ? 'text-primary' : 'text-gray-secondary group-hover:text-primary'
                }`}>
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 ml-6 text-gray-400 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="mt-3 text-gray-3 text-sm leading-relaxed pr-0 sm:pr-8">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
