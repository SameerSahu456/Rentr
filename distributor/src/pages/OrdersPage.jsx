import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer_id: '', items: [], total_monthly: 0, rentr_monthly: 0, rental_months: 12, asset_uids: [], notes: '',
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get(`/orders/?search=${search}`).then(r => setOrders(r.items || [])).catch(console.error).finally(() => setLoading(false));
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
      await api.post('/orders/', { ...form, customer_id: parseInt(form.customer_id) });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'order_number', label: 'Order #' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'total_monthly', label: 'Monthly', render: (v) => `₹${(v || 0).toLocaleString('en-IN')}` },
    { key: 'spread', label: 'Spread', render: (v) => <span className="text-emerald-500 font-bold">₹{(v || 0).toLocaleString('en-IN')}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-brand font-bold text-gradient">Orders</h1>
        <button onClick={openForm} className="flex items-center gap-2 bg-rentr-primary hover:bg-rentr-primary-light text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-foreground/[0.05]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30" />
          </div>
        </div>
        <DataTable columns={columns} data={orders} loading={loading}
          emptyMessage="No orders yet" emptyIcon={<ShoppingCart className="w-16 h-16" />}
          onRowClick={(row) => navigate(`/orders/${row.id}`)} />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-background border border-foreground/[0.08] rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-brand font-bold mb-6">New Order</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Customer</label>
                <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} required
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30">
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Your Price (₹/mo)</label>
                  <input type="number" value={form.total_monthly} onChange={(e) => setForm({ ...form, total_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Rentr Price (₹/mo)</label>
                  <input type="number" value={form.rentr_monthly} onChange={(e) => setForm({ ...form, rentr_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30" />
                </div>
              </div>
              {form.total_monthly > 0 && form.rentr_monthly > 0 && (
                <p className="text-sm text-emerald-500 font-bold">Spread: ₹{(form.total_monthly - form.rentr_monthly).toLocaleString('en-IN')}/mo</p>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Rental Months</label>
                <input type="number" value={form.rental_months} onChange={(e) => setForm({ ...form, rental_months: parseInt(e.target.value) || 12 })}
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-foreground/[0.08] text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rentr-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-rentr-primary-light disabled:opacity-50">{saving ? 'Creating...' : 'Create Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
