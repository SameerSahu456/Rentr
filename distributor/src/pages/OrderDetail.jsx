import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="skeleton h-40 rounded-2xl">&nbsp;</div>;
  if (!data) return <p className="text-foreground/30">Order not found</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-brand font-bold">{data.order_number}</h1>
            <p className="text-foreground/30 text-sm">{data.customer_name} &middot; {data.customer_email}</p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Your Price</p>
            <p className="text-lg font-bold">₹{(data.total_monthly || 0).toLocaleString('en-IN')}/mo</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Rentr Price</p>
            <p className="text-lg font-bold">₹{(data.rentr_monthly || 0).toLocaleString('en-IN')}/mo</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Spread</p>
            <p className="text-lg font-bold text-emerald-500">₹{(data.spread || 0).toLocaleString('en-IN')}/mo</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Duration</p>
            <p className="text-lg font-bold">{data.rental_months} months</p>
          </div>
          {data.billing_start_date && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Billing Start</p>
              <p className="text-sm font-bold">{data.billing_start_date}</p>
            </div>
          )}
          {data.billing_end_date && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Billing End</p>
              <p className="text-sm font-bold">{data.billing_end_date}</p>
            </div>
          )}
        </div>

        {data.asset_uids?.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-2">Asset UIDs</p>
            <div className="flex flex-wrap gap-2">
              {data.asset_uids.map(uid => (
                <span key={uid} className="px-3 py-1 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06] text-xs font-mono">{uid}</span>
              ))}
            </div>
          </div>
        )}

        {data.notes && (
          <div className="mt-6">
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-1">Notes</p>
            <p className="text-sm text-foreground/60">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
