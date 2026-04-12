import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function KYCPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer_id: '', gstin: '', pan: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/kyc/?search=${search}`).then(r => setRecords(r.items || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const openForm = async () => {
    const res = await api.get('/customers/');
    setCustomers(res.items || []);
    setShowForm(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/kyc/', { ...form, customer_id: parseInt(form.customer_id) });
      setShowForm(false);
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'customer_name', label: 'Customer' },
    { key: 'company_name', label: 'Company' },
    { key: 'gstin', label: 'GSTIN', render: (v) => v || '-' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'credit_limit', label: 'Credit Limit', render: (v) => v ? `₹${v.toLocaleString('en-IN')}` : '-' },
    { key: 'created_at', label: 'Submitted', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-brand font-bold text-gradient">KYC</h1>
        <button onClick={openForm} className="flex items-center gap-2 bg-rentr-primary hover:bg-rentr-primary-light text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
          <Plus className="w-4 h-4" /> Submit KYC
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-foreground/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
            <input type="text" placeholder="Search KYC records..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
          </div>
        </div>
        <DataTable columns={columns} data={records} loading={loading}
          emptyMessage="No KYC submissions yet" emptyIcon={<ShieldCheck className="w-16 h-16" />} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-brand font-bold mb-6">Submit KYC</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Customer</label>
                <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30">
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">GSTIN</label>
                <input type="text" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">PAN</label>
                <input type="text" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })}
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-foreground/[0.08] text-xs font-bold uppercase tracking-widest text-foreground/40">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rentr-primary text-white text-xs font-bold uppercase tracking-widest disabled:opacity-50">{saving ? 'Submitting...' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
