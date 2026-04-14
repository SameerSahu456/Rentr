import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function DistributorsPage() {
  const navigate = useNavigate();
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: '', name: '', password: '', phone: '', company_name: '', gstin: '', pan: '',
    partner_email: '', commission_rate: 0, credit_limit: 0,
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/distributors/?search=${search}`).then(r => setDistributors(r.items || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/distributors/', form);
      setShowForm(false);
      setForm({ email: '', name: '', password: '', phone: '', company_name: '', gstin: '', pan: '', partner_email: '', commission_rate: 0, credit_limit: 0 });
      load();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'name', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'total_customers', label: 'Customers' },
    { key: 'total_orders', label: 'Orders' },
    { key: 'total_revenue', label: 'Revenue', render: (v) => `₹${(v || 0).toLocaleString('en-IN')}` },
    { key: 'monthly_spread', label: 'Spread/mo', render: (v) => <span className="text-emerald-500 font-bold">₹{(v || 0).toLocaleString('en-IN')}</span> },
    { key: 'is_active', label: 'Status', render: (v) => <StatusBadge status={v ? 'active' : 'cancelled'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-brand font-bold text-gradient">Distributors</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-rentr-primary hover:bg-rentr-primary-light text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Distributor
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-foreground/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
            <input type="text" placeholder="Search distributors..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30 transition-colors" />
          </div>
        </div>
        <DataTable columns={columns} data={distributors} loading={loading}
          emptyMessage="No distributors yet. Create one to get started."
          emptyIcon={<Building2 className="w-16 h-16" />}
          onRowClick={(row) => navigate(`/distributors/${row.id}`)} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl p-5 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-brand font-bold mb-6">Add Distributor</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Company Name</label>
                <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Partner Email (link)</label>
                  <input type="email" value={form.partner_email} onChange={(e) => setForm({ ...form, partner_email: e.target.value })}
                    placeholder="Their customer email in orders"
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Credit Limit (₹)</label>
                  <input type="number" value={form.credit_limit} onChange={(e) => setForm({ ...form, credit_limit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/30" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-foreground/[0.08] text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rentr-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-rentr-primary-light disabled:opacity-50">{saving ? 'Creating...' : 'Create Distributor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
