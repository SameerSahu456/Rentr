import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [payment, setPayment] = useState({ amount: '', method: 'bank_transfer', transaction_id: '' });
  const [saving, setSaving] = useState(false);

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

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!invoice) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-foreground/[0.06]">
        <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={invoice.status} />
          <select value={invoice.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={() => setPaymentModal(true)}
            className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-rentr-primary hover:text-white transition-colors">
            Record Payment
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-rentr-primary/10 text-rentr-primary">Invoice</span>
            <span className="font-mono text-sm text-foreground/40">{invoice.invoice_number}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground cursor-pointer hover:text-rentr-primary transition-colors"
            onClick={() => invoice.customer_email && navigate(`/customers/${encodeURIComponent(invoice.customer_email)}`)}>
            {invoice.customer_name || 'Invoice'}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-foreground/40">Total</span>
          <div className="text-2xl font-bold text-foreground">₹{fmt(invoice.total)}</div>
        </div>
      </div>

      {/* Quick Links */}
      {(invoice.order || invoice.contract) && (
        <div className="flex flex-wrap gap-2">
          {invoice.order && (
            <button onClick={() => navigate(`/orders/${invoice.order.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
              Order: {invoice.order.order_number} <ExternalLink size={12} />
            </button>
          )}
          {invoice.contract && (
            <button onClick={() => navigate(`/contracts/${invoice.contract.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
              Contract: {invoice.contract.contract_number} <ExternalLink size={12} />
            </button>
          )}
        </div>
      )}

      {/* Details */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <Field label="Customer" value={invoice.customer_name} />
          <Field label="Email" value={invoice.customer_email} />
          <Field label="Due Date" value={invoice.due_date} />
          <Field label="Status" value={invoice.status?.replace(/_/g, ' ')} />
        </div>

        {/* Line Items */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="border-t border-foreground/[0.06] pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Line Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-foreground/[0.06]">
                  <th className="text-xs text-foreground/40 pb-2">Description</th>
                  <th className="text-xs text-foreground/40 pb-2">Qty</th>
                  <th className="text-xs text-foreground/40 pb-2">Unit Price</th>
                  <th className="text-xs text-foreground/40 pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-foreground/[0.04] last:border-0">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">₹{fmt(item.unit_price)}</td>
                    <td className="py-2 text-right">₹{fmt((item.quantity || 0) * (item.unit_price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-sm space-y-1 text-right border-t border-foreground/[0.06] pt-3">
              {invoice.subtotal != null && <div className="text-foreground/50">Subtotal: ₹{fmt(invoice.subtotal)}</div>}
              {invoice.tax != null && <div className="text-foreground/50">Tax: ₹{fmt(invoice.tax)}</div>}
              <div className="font-bold text-foreground text-base">Total: ₹{fmt(invoice.total)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Payment History</h2>
        <DataTable
          columns={[
            { key: 'amount', label: 'Amount', render: (v) => `₹${fmt(v)}` },
            { key: 'method', label: 'Method', render: (v) => (v || '').replace(/_/g, ' ') },
            { key: 'transaction_id', label: 'Transaction ID' },
            { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
          ]}
          data={invoice.payments || []}
          loading={false}
          emptyMessage="No payments recorded."
        />
      </div>

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
    </motion.div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-xs text-foreground/40 block mb-0.5">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || '-'}</span>
    </div>
  );
}
