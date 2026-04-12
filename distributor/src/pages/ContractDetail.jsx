import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/contracts/${id}`).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="skeleton h-40 rounded-2xl">&nbsp;</div>;
  if (!data) return <p className="text-foreground/30">Contract not found</p>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/contracts')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Contracts
      </button>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-brand font-bold">{data.contract_number}</h1>
            <p className="text-foreground/30 text-sm">{data.customer_name} &middot; {data.customer_email}</p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Type</p>
            <p className="text-sm font-bold capitalize">{data.type}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Start Date</p>
            <p className="text-sm font-bold">{data.start_date || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">End Date</p>
            <p className="text-sm font-bold">{data.end_date || '-'}</p>
          </div>
          {data.signed_at && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Signed At</p>
              <p className="text-sm font-bold">{new Date(data.signed_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {data.terms && (
          <div className="mt-6">
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-1">Terms</p>
            <p className="text-sm text-foreground/60 whitespace-pre-wrap">{data.terms}</p>
          </div>
        )}
      </div>

      {data.invoices?.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/[0.05]">
            <h2 className="text-sm font-bold font-brand">Invoices ({data.invoices.length})</h2>
          </div>
          <div className="divide-y divide-foreground/[0.03]">
            {data.invoices.map(i => (
              <div key={i.id} onClick={() => navigate(`/invoices/${i.id}`)} className="px-6 py-4 flex items-center justify-between hover:bg-foreground/[0.01] cursor-pointer">
                <p className="text-sm font-bold">{i.invoice_number}</p>
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
