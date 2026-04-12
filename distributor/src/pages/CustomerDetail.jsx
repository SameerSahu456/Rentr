import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/customers/${id}`).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (!data) return <p className="text-foreground/30">Customer not found</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-brand font-bold text-foreground">{data.name}</h1>
            <p className="text-foreground/30 text-sm">{data.email}</p>
            {data.company_name && <p className="text-foreground/40 text-sm mt-1">{data.company_name}</p>}
          </div>
          <StatusBadge status={data.kyc_status} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {data.gstin && <div><p className="text-[10px] text-foreground/25 uppercase tracking-widest">GSTIN</p><p className="text-sm font-bold">{data.gstin}</p></div>}
          {data.pan && <div><p className="text-[10px] text-foreground/25 uppercase tracking-widest">PAN</p><p className="text-sm font-bold">{data.pan}</p></div>}
          {data.phone && <div><p className="text-[10px] text-foreground/25 uppercase tracking-widest">Phone</p><p className="text-sm font-bold">{data.phone}</p></div>}
        </div>
      </div>

      {/* Orders */}
      {data.orders?.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/[0.05]">
            <h2 className="text-sm font-bold font-brand">Orders ({data.orders.length})</h2>
          </div>
          <div className="divide-y divide-foreground/[0.03]">
            {data.orders.map(o => (
              <div key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="px-6 py-4 flex items-center justify-between hover:bg-foreground/[0.01] cursor-pointer">
                <div>
                  <p className="text-sm font-bold">{o.order_number}</p>
                  <p className="text-xs text-foreground/30">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm">₹{(o.total_monthly || 0).toLocaleString('en-IN')}/mo</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contracts */}
      {data.contracts?.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/[0.05]">
            <h2 className="text-sm font-bold font-brand">Contracts ({data.contracts.length})</h2>
          </div>
          <div className="divide-y divide-foreground/[0.03]">
            {data.contracts.map(c => (
              <div key={c.id} onClick={() => navigate(`/contracts/${c.id}`)} className="px-6 py-4 flex items-center justify-between hover:bg-foreground/[0.01] cursor-pointer">
                <p className="text-sm font-bold">{c.contract_number}</p>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      {data.invoices?.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/[0.05]">
            <h2 className="text-sm font-bold font-brand">Invoices ({data.invoices.length})</h2>
          </div>
          <div className="divide-y divide-foreground/[0.03]">
            {data.invoices.map(i => (
              <div key={i.id} onClick={() => navigate(`/invoices/${i.id}`)} className="px-6 py-4 flex items-center justify-between hover:bg-foreground/[0.01] cursor-pointer">
                <div>
                  <p className="text-sm font-bold">{i.invoice_number}</p>
                  <p className="text-xs text-foreground/30">Due: {i.due_date || '-'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm">₹{(i.total || 0).toLocaleString('en-IN')}</p>
                  <StatusBadge status={i.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
