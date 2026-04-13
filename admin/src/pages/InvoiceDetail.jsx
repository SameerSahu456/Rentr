import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Send, Pencil, Check, X, ExternalLink, CreditCard, CalendarDays, Receipt, Banknote } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || '/api';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('details');
  const [paymentModal, setPaymentModal] = useState(false);
  const [payment, setPayment] = useState({ amount: '', method: 'bank_transfer', transaction_id: '' });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(setInvoice)
      .catch((err) => setError(err.message || 'Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRecordPayment = async () => {
    setSaving(true);
    try {
      await api.post(`/invoices/${id}/payments`, {
        amount: Number(payment.amount),
        method: payment.method,
        transaction_id: payment.transaction_id,
      });
      const updated = await api.get(`/invoices/${id}`);
      setInvoice(updated);
      setPaymentModal(false);
      setPayment({ amount: '', method: 'bank_transfer', transaction_id: '' });
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/invoices/${id}`, { status });
      setInvoice((prev) => ({ ...prev, status }));
    } catch { /* ignore */ }
  };

  const handleDownloadPdf = async () => {
    try {
      const token = api.getToken();
      const res = await fetch(`${BASE_URL.replace(/\/api\/v1\b/, '/api')}/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err);
    }
  };

  const handleSendInvoice = async () => {
    setSending(true);
    try {
      const res = await api.post(`/invoices/${id}/send`);
      setInvoice((prev) => ({ ...prev, status: res.status || 'sent' }));
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const handleSaveDueDate = async () => {
    if (!newDueDate) return;
    try {
      const updated = await api.patch(`/invoices/${id}`, { due_date: newDueDate });
      setInvoice((prev) => ({ ...prev, due_date: updated.due_date || newDueDate }));
      setEditingDate(false);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (error) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!invoice) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>
      <p className="text-foreground/30 text-center py-20 text-sm">Invoice not found</p>
    </div>
  );

  const amountPaid = (invoice.payments || [])
    .filter(p => p.status !== 'failed' && p.status !== 'cancelled')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const amountDue = Number(invoice.total || 0) - amountPaid;

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'items', label: `Line Items (${invoice.items?.length || 0})` },
    { key: 'payments', label: `Payments (${invoice.payments?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>

      {/* Glass card header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-brand font-bold text-foreground">{invoice.invoice_number}</h1>
            <p className="text-foreground/30 text-sm">
              {invoice.customer_name || 'Unknown Customer'}
              {invoice.customer_email ? ` \u00b7 ${invoice.customer_email}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={invoice.status} />
            <select value={invoice.status} onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-2 py-1.5 text-xs text-foreground/60">
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4">
          {(invoice.order || invoice.contract) && (
            <>
              {invoice.order && (
                <button onClick={() => navigate(`/orders/${invoice.order.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                  Order: {invoice.order.order_number} <ExternalLink size={12} />
                </button>
              )}
              {invoice.contract && (
                <button onClick={() => navigate(`/contracts/${invoice.contract.id}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                  Contract: {invoice.contract.contract_number} <ExternalLink size={12} />
                </button>
              )}
              <div className="flex-1" />
            </>
          )}
          {!(invoice.order || invoice.contract) && <div className="flex-1" />}
          <button onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foreground/[0.08] text-xs text-foreground/50 hover:text-rentr-primary hover:border-rentr-primary/30 transition-colors">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={handleSendInvoice} disabled={sending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rentr-primary text-white text-xs font-medium hover:bg-rentr-primary-light transition-colors disabled:opacity-50">
            <Send className="w-3.5 h-3.5" /> {sending ? 'Sending...' : 'Send'}
          </button>
          <button onClick={() => setPaymentModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-rentr-primary hover:text-white transition-colors">
            <CreditCard className="w-3.5 h-3.5" /> Record Payment
          </button>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Total</p>
            <p className="text-lg font-bold">{'\u20B9'}{fmt(invoice.total)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Paid</p>
            <p className="text-lg font-bold text-emerald-500">{'\u20B9'}{fmt(amountPaid)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Outstanding</p>
            <p className={`text-lg font-bold ${amountDue > 0 ? 'text-amber-500' : 'text-foreground/40'}`}>{'\u20B9'}{fmt(amountDue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Due Date</p>
            {editingDate ? (
              <div className="flex items-center gap-1 mt-0.5">
                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}
                  className="bg-foreground/[0.03] border border-foreground/[0.08] rounded px-2 py-1 text-sm w-32" />
                <button onClick={handleSaveDueDate} className="p-1 text-emerald-500 hover:text-emerald-400"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingDate(false)} className="p-1 text-foreground/30 hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <p className="text-sm font-bold inline-flex items-center gap-1.5 group cursor-pointer"
                onClick={() => { setNewDueDate(invoice.due_date || ''); setEditingDate(true); }}>
                {invoice.due_date || '-'}
                <Pencil className="w-3 h-3 text-foreground/20 group-hover:text-rentr-primary transition-colors" />
              </p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Tax</p>
            <p className="text-sm font-bold">{'\u20B9'}{fmt(invoice.tax)}</p>
          </div>
        </div>
      </div>

      {/* Inline tab buttons */}
      <div className="flex gap-1 border-b border-foreground/[0.05] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${tab === t.key ? 'border-rentr-primary text-rentr-primary' : 'border-transparent text-foreground/25 hover:text-foreground/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'details' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Customer</p>
                <p className="text-sm font-bold mt-0.5">{invoice.customer_name || '-'}</p>
              </div>
              {invoice.customer_email && (
                <button onClick={() => navigate(`/customers/${encodeURIComponent(invoice.customer_email)}`)}
                  className="inline-flex items-center gap-1 text-xs text-rentr-primary hover:underline">
                  View <ExternalLink size={12} />
                </button>
              )}
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Email</p>
              <p className="text-sm font-bold mt-0.5">{invoice.customer_email || '-'}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Invoice Number</p>
              <p className="text-sm font-bold mt-0.5">{invoice.invoice_number}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Status</p>
              <div className="mt-0.5"><StatusBadge status={invoice.status} /></div>
            </div>
            <div className="px-6 py-4">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Due Date</p>
              <p className="text-sm font-bold mt-0.5">{invoice.due_date || '-'}</p>
            </div>
            {invoice.subtotal != null && (
              <div className="px-6 py-4">
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Subtotal</p>
                <p className="text-sm font-bold mt-0.5">{'\u20B9'}{fmt(invoice.subtotal)}</p>
              </div>
            )}
            {invoice.tax != null && (
              <div className="px-6 py-4">
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Tax</p>
                <p className="text-sm font-bold mt-0.5">{'\u20B9'}{fmt(invoice.tax)}</p>
              </div>
            )}
            <div className="px-6 py-4">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Total</p>
              <p className="text-lg font-bold mt-0.5">{'\u20B9'}{fmt(invoice.total)}</p>
            </div>
            {invoice.notes && (
              <div className="px-6 py-4">
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Notes</p>
                <p className="text-sm text-foreground/60 mt-0.5">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'items' && (
        <div className="glass rounded-2xl overflow-hidden">
          {invoice.items && invoice.items.length > 0 ? (
            <>
              <div className="divide-y divide-foreground/[0.03]">
                {invoice.items.map((item, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{item.description}</p>
                      <p className="text-xs text-foreground/30">
                        Qty: {item.quantity} &times; {'\u20B9'}{fmt(item.unit_price)}
                      </p>
                    </div>
                    <p className="text-sm font-bold">{'\u20B9'}{fmt((item.quantity || 0) * (item.unit_price || 0))}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-foreground/[0.06] px-6 py-4 space-y-1 text-right">
                {invoice.subtotal != null && (
                  <p className="text-xs text-foreground/40">Subtotal: {'\u20B9'}{fmt(invoice.subtotal)}</p>
                )}
                {invoice.tax != null && (
                  <p className="text-xs text-foreground/40">Tax: {'\u20B9'}{fmt(invoice.tax)}</p>
                )}
                <p className="text-base font-bold text-foreground">Total: {'\u20B9'}{fmt(invoice.total)}</p>
              </div>
            </>
          ) : (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No line items</p>
          )}
        </div>
      )}

      {tab === 'payments' && (
        <div className="glass rounded-2xl overflow-hidden">
          {invoice.payments && invoice.payments.length > 0 ? (
            <div className="divide-y divide-foreground/[0.03]">
              {invoice.payments.map((p, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{'\u20B9'}{fmt(p.amount)}</p>
                    <p className="text-xs text-foreground/30">
                      {(p.method || '').replace(/_/g, ' ')}
                      {p.transaction_id ? ` \u00b7 ${p.transaction_id}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-foreground/30">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '-'}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No payments recorded</p>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <Modal isOpen={paymentModal} onClose={() => setPaymentModal(false)} title="Record Payment"
        footer={<>
          <button onClick={() => setPaymentModal(false)} className="px-4 py-2 rounded-lg border border-foreground/[0.08] text-sm text-foreground/50 hover:text-foreground">Cancel</button>
          <button onClick={handleRecordPayment} disabled={saving} className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-rentr-primary hover:text-white transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Record Payment'}</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-foreground/50 mb-1">Amount</label>
            <input type="number" min="0" step="0.01" value={payment.amount} onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-foreground/50 mb-1">Method</label>
            <select value={payment.method} onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2.5 text-sm text-foreground/60">
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-foreground/50 mb-1">Transaction ID (optional)</label>
            <input type="text" value={payment.transaction_id} onChange={(e) => setPayment((p) => ({ ...p, transaction_id: e.target.value }))}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2.5 text-sm" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
