// ─── Support Tickets Table ───
// variant: 'customer' | 'distributor'

import { Badge } from './SubscriptionCard'

export default function SupportTickets({ tickets, variant = 'customer', ticketFilter, setTicketFilter, statusBadgeMap }) {
  if (variant === 'distributor') {
    const filteredTickets = tickets.filter((t) => ticketFilter === 'ongoing' ? t.status === 'Open' : t.status === 'Resolved')

    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          {['ongoing', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setTicketFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                ticketFilter === f ? 'bg-primary text-white' : 'bg-gray-100 text-gray-2 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Item</th>
                  <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Client</th>
                  <th className="hidden md:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Created By</th>
                  <th className="hidden sm:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Created On</th>
                  <th className="text-center px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Status</th>
                  <th className="hidden md:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Assigned To</th>
                  <th className="hidden sm:table-cell text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Refund</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-dark font-medium">{t.item}</td>
                    <td className="px-5 py-3.5 text-gray-2">{t.client}</td>
                    <td className="hidden md:table-cell px-5 py-3.5 text-gray-2">{t.createdBy}</td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-gray-3">{t.createdOn}</td>
                    <td className="px-5 py-3.5 text-center"><Badge status={t.status} statusBadgeMap={statusBadgeMap} /></td>
                    <td className="hidden md:table-cell px-5 py-3.5 text-gray-2">{t.assignedTo}</td>
                    <td className="hidden sm:table-cell px-5 py-3.5 text-right text-gray-2">{t.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Customer variant
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#f8f8f8] border-y border-gray-300">
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Item</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase hidden sm:table-cell">Client</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Status</th>
            <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase hidden lg:table-cell">Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="px-4 sm:px-6 py-4 text-gray-1 font-medium">{t.item}</td>
              <td className="px-4 sm:px-6 py-4 text-gray-3 hidden sm:table-cell">{t.client}</td>
              <td className="px-4 sm:px-6 py-4">
                <span className={`text-sm font-medium ${t.status === 'Open' ? 'text-[#f97316]' : 'text-[#219653]'}`}>{t.status}</span>
              </td>
              <td className="px-4 sm:px-6 py-4 text-gray-3 hidden lg:table-cell">{t.assignedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
