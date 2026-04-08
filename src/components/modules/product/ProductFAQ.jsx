import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ProductFAQ({
  faqItems,
  openFaq,
  setOpenFaq,
  setShowPostQuestionModal,
}) {
  return (
    <>
      {/* ═══════ CUSTOMER Q&A ═══════ */}
      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-dark mb-4">Customer Questions & Answers</h2>
        <div className="space-y-0">
          {faqItems.map((faq, i) => (
            <div key={i} className="border-b border-gray-100">
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className={`text-sm ${i === 1 ? 'text-primary underline' : 'text-dark'} pr-4`}>
                  {faq.question}
                </span>
                {openFaq === i ? (
                  <ChevronUp size={16} className="text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="pb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════ HAVE A QUESTION ═══════ */}
      <div className="mt-8 mb-8">
        <h3 className="font-heading text-base font-bold text-dark mb-3">Have a question?</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Post your Question..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            onFocus={() => setShowPostQuestionModal(true)}
          />
        </div>
      </div>
    </>
  )
}
