import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/invoices/${id}`).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="skeleton h-40 rounded-2xl">&nbsp;</div>;
  if (!data) return <p className="text-foreground/30">Invoice not found</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/invoices')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-brand font-bold">{data.invoice_number}</h1>
            <p className="text-foreground/30 text-sm">{data.customer_name} &middot; {data.customer_email}</p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Subtotal</p>
            <p className="text-lg font-bold">₹{(data.subtotal || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Tax</p>
            <p className="text-lg font-bold">₹{(data.tax || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Total</p>
            <p className="text-lg font-bold">₹{(data.total || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Due Date</p>
            <p className="text-sm font-bold">{data.due_date || '-'}</p>
          </div>
        </div>
      </div>

      {data.payments?.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/[0.05]">
            <h2 className="text-sm font-bold font-brand">Payments ({data.payments.length})</h2>
          </div>
          <div className="divide-y divide-foreground/[0.03]">
            {data.payments.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">₹{(p.amount || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-foreground/30">{p.method || 'N/A'} {p.transaction_id ? `- ${p.transaction_id}` : ''}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
