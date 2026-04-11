import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const emptyItem = { description: '', quantity: 1, unit_price: 0 };

export default function InvoiceForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    due_date: '',
    notes: '',
    tax_rate: 0,
    discount: 0,
  });
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const taxAmount = subtotal * (form.tax_rate / 100);
  const total = subtotal + taxAmount - Number(form.discount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/invoices', {
        ...form,
        items,
        subtotal,
        tax: taxAmount,
        total,
      });
      navigate('/invoices');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate('/invoices')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={14} />
          Back to Invoices
        </button>
        <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">New Invoice</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4">Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Customer Name</label>
              <input
                type="text"
                required
                value={form.customer_name}
                onChange={(e) => updateField('customer_name', e.target.value)}
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Customer Email</label>
              <input
                type="email"
                required
                value={form.customer_email}
                onChange={(e) => updateField('customer_email', e.target.value)}
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-rentr-primary hover:text-rentr-primary-light font-medium">
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  {i === 0 && <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Description</label>}
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Qty</label>}
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                    className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Unit Price</label>}
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.unit_price}
                    onChange={(e) => updateItem(i, 'unit_price', Number(e.target.value))}
                    className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
                  />
                </div>
                <div className="col-span-2">
                  {i === 0 && <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Total</label>}
                  <div className="px-3 py-2 text-sm text-foreground/70 font-medium">
                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-2">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals & Details */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Due Date</label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) => updateField('due_date', e.target.value)}
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.tax_rate}
                  onChange={(e) => updateField('tax_rate', Number(e.target.value))}
                  className="w-24 bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm text-right focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.discount}
                  onChange={(e) => updateField('discount', Number(e.target.value))}
                  className="w-24 bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm text-right focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-foreground/[0.05] pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-foreground/40"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-foreground/40"><span>Tax ({form.tax_rate}%)</span><span>₹{taxAmount.toFixed(2)}</span></div>
            {form.discount > 0 && (
              <div className="flex justify-between text-foreground/40"><span>Discount</span><span>-₹{Number(form.discount).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-foreground/[0.05]">
              <span>Total</span><span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional notes..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
