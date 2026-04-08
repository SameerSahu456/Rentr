import { Trash2, CreditCard } from 'lucide-react'

// ─── Saved Cards ───
// variant: 'customer' | 'distributor'

export default function SavedCards({ cards, variant = 'customer', onAddPayment }) {
  if (variant === 'distributor') {
    if (!cards.length) return null
    return (
      <div>
        <h4 className="font-heading text-sm font-bold text-dark uppercase tracking-wide mb-3">Saved Cards</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase">{card.type}</span>
                </div>
                <button className="text-gray-3 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
              <p className="font-heading text-lg text-dark tracking-widest mb-1">**** **** **** {card.last4}</p>
              <div className="flex justify-between text-xs text-gray-3 mt-2">
                <span>{card.name}</span>
                <span>Exp {card.expiry}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Customer variant
  return (
    <div>
      <h3 className="font-heading text-base font-bold text-gray-1">Your saved credit and debit cards</h3>
      <div className="w-10 h-0.5 bg-primary mt-1 mb-4" />
      <div className="space-y-3">
        {cards.map((card) => (
          <div key={card.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 sm:px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="bg-[#FFD700] text-[10px] font-bold px-2 py-1 rounded text-gray-1 shrink-0">RuPay</span>
              <p className="text-sm text-gray-1 truncate"><span className="font-semibold">{card.bank}</span> ending in {card.last4}</p>
            </div>
            <button className="text-[#eb5757] hover:text-red-700 transition-colors shrink-0 ml-2 cursor-pointer"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <button onClick={onAddPayment}
        className="mt-4 bg-[#eb5757] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer">
        Add Payment Mode
      </button>
    </div>
  )
}
