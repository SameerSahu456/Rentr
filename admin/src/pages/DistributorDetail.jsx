import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ShoppingCart, ScrollText, FileText, TrendingUp, CreditCard } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function DistributorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get(`/distributors/${id}`).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (!data) return <p className="text-foreground/30">Distributor not found</p>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'customers', label: `Customers (${data.customers?.length || 0})` },
    { key: 'orders', label: `Orders (${data.orders?.length || 0})` },
    { key: 'contracts', label: `Contracts (${data.contracts?.length || 0})` },
    { key: 'invoices', label: `Invoices (${data.invoices?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/distributors')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Distributors
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-brand font-bold text-foreground">{data.company_name}</h1>
            <p className="text-foreground/30 text-sm truncate">{data.name} &middot; {data.email}</p>
            {data.phone && <p className="text-foreground/40 text-xs mt-1">{data.phone}</p>}
          </div>
          <StatusBadge status={data.is_active ? 'active' : 'cancelled'} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Revenue</p>
            <p className="text-lg font-bold">₹{(data.total_revenue || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Outstanding</p>
            <p className="text-lg font-bold text-amber-500">₹{(data.total_outstanding || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Monthly Spread</p>
            <p className="text-lg font-bold text-emerald-500">₹{(data.monthly_spread || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Limit</p>
            <p className="text-sm font-bold">₹{(data.credit_limit || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">GSTIN</p>
            <p className="text-sm font-bold">{data.gstin || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Partner Email</p>
            <p className="text-sm font-bold">{data.partner_email || '-'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-foreground/[0.05] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${tab === t.key ? 'border-rentr-primary text-rentr-primary' : 'border-transparent text-foreground/25 hover:text-foreground/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <Users className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{data.customers?.length || 0}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">End Customers</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <ShoppingCart className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{data.orders?.length || 0}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Orders</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <ScrollText className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{data.contracts?.length || 0}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Contracts</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <FileText className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{data.invoices?.length || 0}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Invoices</p>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {(data.customers || []).map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{c.name}</p>
                  <p className="text-xs text-foreground/30">{c.email} {c.company_name ? `- ${c.company_name}` : ''}</p>
                </div>
                <StatusBadge status={c.kyc_status} />
              </div>
            ))}
            {(!data.customers || data.customers.length === 0) && (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No customers</p>
            )}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {(data.orders || []).map(o => (
              <div key={o.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{o.order_number}</p>
                  <p className="text-xs text-foreground/30">{o.customer_name}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm">₹{(o.total_monthly || 0).toLocaleString('en-IN')}/mo</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Spread: ₹{(o.spread || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
            {(!data.orders || data.orders.length === 0) && (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No orders</p>
            )}
          </div>
        </div>
      )}

      {tab === 'contracts' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {(data.contracts || []).map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{c.contract_number}</p>
                  <p className="text-xs text-foreground/30">{c.customer_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-foreground/30">{c.start_date} - {c.end_date}</p>
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
            {(!data.contracts || data.contracts.length === 0) && (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No contracts</p>
            )}
          </div>
        </div>
      )}

      {tab === 'invoices' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {(data.invoices || []).map(i => (
              <div key={i.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{i.invoice_number}</p>
                  <p className="text-xs text-foreground/30">{i.customer_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm">₹{(i.total || 0).toLocaleString('en-IN')}</p>
                  <StatusBadge status={i.status} />
                </div>
              </div>
            ))}
            {(!data.invoices || data.invoices.length === 0) && (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No invoices</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
