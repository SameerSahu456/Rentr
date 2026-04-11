import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Package } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(false);
  const [payment, setPayment] = useState({ amount: '', method: 'bank_transfer', transaction_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(setInvoice)
      .catch(() => navigate('/invoices'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

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
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/invoices/${id}`, { status });
      setInvoice((prev) => ({ ...prev, status }));
    } catch {
      // handle error
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!invoice) return null;

  const paymentColumns = [
    { key: 'amount', label: 'Amount', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
    { key: 'method', label: 'Method', render: (v) => (v || '').replace(/_/g, ' ') },
    { key: 'transaction_id', label: 'Transaction ID' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/invoices')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Invoices
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={invoice.status} />
          <select
            value={invoice.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => setPaymentModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
          >
            Record Payment
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              Invoice
            </span>
            <span className="text-[10px] font-mono text-foreground/20">{invoice.invoice_number}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            {invoice.customer_email ? <span className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(invoice.customer_email)}`)}>{invoice.customer_name || 'Invoice'}</span> : (invoice.customer_name || 'Invoice')}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Total</span>
          <div className="text-3xl font-brand font-black tracking-tighter text-foreground">₹${Number(invoice.total || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Related Links */}
      {(invoice.order || invoice.contract || invoice.customer_email) && (
        <div className="flex flex-wrap gap-2">
          {invoice.order && (
            <button
              onClick={() => navigate(`/orders/${invoice.order.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15 hover:bg-blue-500/20 transition-colors"
            >
              Order: {invoice.order.order_number}
              <ExternalLink size={12} />
            </button>
          )}
          {invoice.contract && (
            <button
              onClick={() => navigate(`/contracts/${invoice.contract.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20 transition-colors"
            >
              Contract: {invoice.contract.contract_number}
              <ExternalLink size={12} />
            </button>
          )}
          {invoice.customer_email && (
            <button
              onClick={() => navigate(`/customers/${encodeURIComponent(invoice.customer_email)}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15 hover:bg-purple-500/20 transition-colors"
            >
              Customer: {invoice.customer_name || invoice.customer_email}
              <ExternalLink size={12} />
            </button>
          )}
        </div>
      )}

      {/* Invoice details */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span><span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(invoice.customer_email)}`)}>{invoice.customer_name}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Email</span><span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(invoice.customer_email)}`)}>{invoice.customer_email}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Due Date</span><span className="font-medium text-foreground">{invoice.due_date}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Total</span><span className="font-medium text-foreground text-lg">₹${Number(invoice.total || 0).toLocaleString('en-IN')}</span></div>
        </div>

        {/* Items */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="mt-6 border-t border-foreground/[0.05] pt-4">
            <h3 className="text-lg font-brand font-black uppercase tracking-tight text-foreground/70 mb-2">Line Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-foreground/[0.05]">
                  <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3">Description</th>
                  <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3">Qty</th>
                  <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3">Unit Price</th>
                  <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-b border-foreground/[0.04] last:border-0">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2">₹${Number(item.unit_price || 0).toLocaleString('en-IN')}</td>
                    <td className="py-2 text-right">₹${(item.quantity * item.unit_price).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-sm space-y-1 text-right">
              <div className="text-foreground/40">Subtotal: ₹${Number(invoice.subtotal || 0).toLocaleString('en-IN')}</div>
              <div className="text-foreground/40">Tax: ₹${Number(invoice.tax || 0).toLocaleString('en-IN')}</div>
              {invoice.discount > 0 && <div className="text-foreground/40">Discount: -₹${Number(invoice.discount).toLocaleString('en-IN')}</div>}
              <div className="font-bold text-foreground text-base">Total: ₹${Number(invoice.total || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        {invoice.notes && (
          <div className="mt-4 border-t border-foreground/[0.05] pt-4">
            <h3 className="text-lg font-brand font-black uppercase tracking-tight text-foreground/70 mb-1">Notes</h3>
            <p className="text-sm text-foreground/60">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Payment History</h2>
        <div className="border-t border-foreground/[0.05]">
          <DataTable
            columns={paymentColumns}
            data={invoice.payments || []}
            loading={false}
            emptyMessage="No payments recorded."
          />
        </div>
      </div>

      {/* Linked Assets */}
      {invoice.assets && invoice.assets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Assets</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-bold">{v}</span> },
                { key: 'oem', label: 'OEM / Model', render: (_, row) => [row.oem, row.model].filter(Boolean).join(' / ') || '-' },
                { key: 'category', label: 'Category' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'monthly_rate', label: 'Monthly Rate', render: (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '-' },
              ]}
              data={invoice.assets}
              loading={false}
              onRowClick={(row) => navigate(`/assets/${row.id}`)}
              emptyMessage="No assets."
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        title="Record Payment"
        footer={
          <>
            <button onClick={() => setPaymentModal(false)} className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all">Cancel</button>
            <button onClick={handleRecordPayment} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50">{saving ? 'Saving...' : 'Record Payment'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={payment.amount}
              onChange={(e) => setPayment((p) => ({ ...p, amount: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Method</label>
            <select
              value={payment.method}
              onChange={(e) => setPayment((p) => ({ ...p, method: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Transaction ID</label>
            <input
              type="text"
              value={payment.transaction_id}
              onChange={(e) => setPayment((p) => ({ ...p, transaction_id: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional"
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
