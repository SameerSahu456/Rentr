import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', phone: '', company_name: '', gstin: '', pan: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/customers/?search=${search}`).then(r => setCustomers(r.items || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/customers/', form);
      setShowForm(false);
      setForm({ email: '', name: '', phone: '', company_name: '', gstin: '', pan: '' });
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'company_name', label: 'Company' },
    { key: 'kyc_status', label: 'KYC', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Added', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-brand font-bold text-gradient">Customers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-rentr-primary hover:bg-rentr-primary-light text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-foreground/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30 transition-colors"
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers yet. Add your first customer to get started."
          emptyIcon={<Users className="w-16 h-16" />}
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-brand font-bold mb-6">Add Customer</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {['name', 'email', 'phone', 'company_name', 'gstin', 'pan'].map(field => (
                <div key={field}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required={field === 'name' || field === 'email'}
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-foreground/[0.08] text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rentr-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-rentr-primary-light disabled:opacity-50 transition-all">{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
