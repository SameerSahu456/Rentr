import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';

const REASONS = [
  'Contract End',
  'Early Return',
  'Advance Replacement Return',
  'Faulty Device',
];

export default function ReturnForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    order_id: '',
    contract_id: '',
    reason: '',
    asset_uids_text: '',
    pickup_date: '',
    pickup_time: '',
    site: '',
    special_instructions: '',
    data_wipe_requested: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const asset_uids = form.asset_uids_text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const { asset_uids_text: _, ...rest } = form;
      const result = await api.post('/returns/', { ...rest, asset_uids });
      navigate(`/returns/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create return');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate('/returns')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={14} />
          Back to Returns
        </button>
        <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">New Return Request</h1>
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
              <input type="text" required value={form.customer_name} onChange={(e) => updateField('customer_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Customer Email</label>
              <input type="email" required value={form.customer_email} onChange={(e) => updateField('customer_email', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Order ID</label>
              <input type="text" value={form.order_id} onChange={(e) => updateField('order_id', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Contract ID</label>
              <input type="text" value={form.contract_id} onChange={(e) => updateField('contract_id', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Return Details */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4">Return Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Reason</label>
              <select required value={form.reason} onChange={(e) => updateField('reason', e.target.value)} className={inputClass}>
                <option value="">Select reason...</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Site</label>
              <input type="text" value={form.site} onChange={(e) => updateField('site', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Pickup Date</label>
              <input type="date" value={form.pickup_date} onChange={(e) => updateField('pickup_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Pickup Time</label>
              <input type="time" value={form.pickup_time} onChange={(e) => updateField('pickup_time', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Asset UIDs (comma-separated)</label>
            <input
              type="text"
              required
              value={form.asset_uids_text}
              onChange={(e) => updateField('asset_uids_text', e.target.value)}
              className={inputClass}
              placeholder="UID-001, UID-002, UID-003"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Special Instructions</label>
            <textarea
              value={form.special_instructions}
              onChange={(e) => updateField('special_instructions', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Any special handling instructions..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
            <input
              type="checkbox"
              checked={form.data_wipe_requested}
              onChange={(e) => updateField('data_wipe_requested', e.target.checked)}
              className="rounded border-foreground/[0.08] text-rentr-primary focus:ring-rentr-primary"
            />
            Data Wipe Requested
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/returns')}
            className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Return'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
