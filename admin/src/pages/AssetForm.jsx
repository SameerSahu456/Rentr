import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  { value: 'SVR', label: 'Server (SVR)' },
  { value: 'LP', label: 'Laptop (LP)' },
  { value: 'DT', label: 'Desktop (DT)' },
  { value: 'WS', label: 'Workstation (WS)' },
  { value: 'STR', label: 'Storage (STR)' },
  { value: 'GPU', label: 'GPU (GPU)' },
  { value: 'NW', label: 'Networking (NW)' },
  { value: 'AV', label: 'AV Equipment (AV)' },
  { value: 'CP', label: 'Components (CP)' },
  { value: 'MB', label: 'Mobile (MB)' },
];

const GRADES = ['A', 'B', 'C', 'D', 'E'];

export default function AssetForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: '',
    oem: '',
    model: '',
    specs: '',
    serial_number: '',
    acquisition_cost: '',
    acquisition_date: '',
    monthly_rate: '',
    warranty_expiry: '',
    warranty_provider: '',
    support_included: false,
    condition_grade: 'A',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        acquisition_cost: form.acquisition_cost ? Number(form.acquisition_cost) : null,
        monthly_rate: form.monthly_rate ? Number(form.monthly_rate) : null,
      };
      const result = await api.post('/assets/', payload);
      navigate(`/assets/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create asset');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate('/assets')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={14} />
          Back to Assets
        </button>
        <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">New Asset</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Device Info */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4">Device Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Category</label>
              <select
                required
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className={inputClass}
              >
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">OEM</label>
              <input type="text" required value={form.oem} onChange={(e) => updateField('oem', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Model</label>
              <input type="text" required value={form.model} onChange={(e) => updateField('model', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Serial Number</label>
              <input type="text" value={form.serial_number} onChange={(e) => updateField('serial_number', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Specs</label>
            <textarea
              value={form.specs}
              onChange={(e) => updateField('specs', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="RAM, CPU, Storage, etc."
            />
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4">Financial Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Acquisition Cost ({'\u20B9'})</label>
              <input type="number" min="0" step="0.01" value={form.acquisition_cost} onChange={(e) => updateField('acquisition_cost', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Acquisition Date</label>
              <input type="date" value={form.acquisition_date} onChange={(e) => updateField('acquisition_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Monthly Rate ({'\u20B9'})</label>
              <input type="number" min="0" step="0.01" value={form.monthly_rate} onChange={(e) => updateField('monthly_rate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Condition Grade</label>
              <select value={form.condition_grade} onChange={(e) => updateField('condition_grade', e.target.value)} className={inputClass}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Warranty */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4">Warranty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Warranty Expiry</label>
              <input type="date" value={form.warranty_expiry} onChange={(e) => updateField('warranty_expiry', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Warranty Provider</label>
              <input type="text" value={form.warranty_provider} onChange={(e) => updateField('warranty_provider', e.target.value)} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
            <input
              type="checkbox"
              checked={form.support_included}
              onChange={(e) => updateField('support_included', e.target.checked)}
              className="rounded border-foreground/[0.08] text-rentr-primary focus:ring-rentr-primary"
            />
            Support Included
          </label>
        </div>

        {/* Notes */}
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4">Notes</h2>
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Additional notes..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Asset'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
