import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function TicketForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general_inquiry',
    order_id: '',
    asset_uid: '',
    contract_id: '',
    invoice_id: '',
    return_id: '',
    assigned_to: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/support/tickets', form);
      navigate('/support');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
      <div>
        <button onClick={() => navigate('/support')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={14} />
          Back to Support
        </button>
        <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">New Support Ticket</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 space-y-4">
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

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Subject</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Description</label>
          <textarea
            required
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={5}
            className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            placeholder="Describe the issue..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => updateField('priority', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            >
              <option value="hardware_failure">Hardware failure</option>
              <option value="software_issue">Software issue</option>
              <option value="performance_degradation">Performance degradation</option>
              <option value="physical_damage">Physical damage</option>
              <option value="preventive_maintenance">Preventive maintenance</option>
              <option value="upgrade_request">Upgrade request</option>
              <option value="general_inquiry">General inquiry</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Assigned To</label>
          <input
            type="text"
            value={form.assigned_to}
            onChange={(e) => updateField('assigned_to', e.target.value)}
            className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            placeholder="Agent or team name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Order ID</label>
            <input
              type="text"
              value={form.order_id}
              onChange={(e) => updateField('order_id', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Asset UID</label>
            <input
              type="text"
              value={form.asset_uid}
              onChange={(e) => updateField('asset_uid', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Contract ID</label>
            <input
              type="text"
              value={form.contract_id}
              onChange={(e) => updateField('contract_id', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Invoice ID</label>
            <input
              type="text"
              value={form.invoice_id}
              onChange={(e) => updateField('invoice_id', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Return ID</label>
            <input
              type="text"
              value={form.return_id}
              onChange={(e) => updateField('return_id', e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/support')}
            className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
