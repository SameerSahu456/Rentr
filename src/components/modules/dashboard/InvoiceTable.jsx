import { Link } from 'react-router-dom'
import { Download, Copy } from 'lucide-react'

// ─── Invoice / Payments / Credits tables ───
// variant: 'customer' | 'distributor'

export default function InvoiceTable({ variant = 'customer', invoiceSubTab, invoicesData, paymentsData, creditsData, formatCurrency }) {
  if (variant === 'distributor') {
    return (
      <>
        {invoiceSubTab === 'invoices' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Item</th>
                    <th className="hidden sm:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Item</th>
                    <th className="hidden md:table-cell text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Start Date - End Date</th>
                    <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Amount</th>
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {invoicesData.map((inv, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-dark font-medium">{inv.company}</p>
                        <p className="text-xs text-gray-3">{inv.companyId}</p>
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 text-gray-2">{inv.item}</td>
                      <td className="hidden md:table-cell px-5 py-3.5 text-gray-2 text-xs">{inv.startDate} - {inv.endDate}</td>
                      <td className="px-5 py-3.5 text-right text-dark font-semibold">{formatCurrency(inv.amount)}</td>
                      <td className="px-5 py-3.5">
                        <Link to="#" className="text-primary hover:underline font-medium text-xs flex items-center gap-1">
                          {inv.id} <Download size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {invoiceSubTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Date</th>
                    <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsData.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-2">{p.date}</td>
                      <td className="px-5 py-3.5 text-right text-dark font-semibold">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {invoiceSubTab === 'credits' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Date</th>
                    <th className="text-right px-5 py-3 text-[11px] uppercase tracking-wider text-gray-3 font-semibold">Credit Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {creditsData.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-2">{c.date}</td>
                      <td className="px-5 py-3.5 text-right text-green-500 font-semibold">{formatCurrency(c.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    )
  }

  // Customer variant
  return (
    <>
      {invoiceSubTab === 'invoices' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f8f8f8] border-y border-gray-300">
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Period</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Amount</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Invoice</th>
            </tr></thead>
            <tbody>
              {invoicesData.map((inv, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{inv.period}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{inv.amount}</td>
                  <td className="px-4 sm:px-6 py-4 flex items-center gap-2">
                    <Download size={14} className="text-gray-3" />
                    <span className="text-gray-1">{inv.id}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoiceSubTab === 'payments' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f8f8f8] border-y border-gray-300">
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Date</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Amount</th>
            </tr></thead>
            <tbody>
              {paymentsData.map((p, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{p.date}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{p.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoiceSubTab === 'credits' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#f8f8f8] border-y border-gray-300">
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Date</th>
              <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-2 uppercase">Amount</th>
            </tr></thead>
            <tbody>
              {creditsData.map((c, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{c.date}</td>
                  <td className="px-4 sm:px-6 py-4 text-gray-1">{c.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
