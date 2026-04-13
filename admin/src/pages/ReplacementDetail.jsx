import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, HardDrive, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ReplacementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rpl, setRpl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('details');

  useEffect(() => {
    api.get(`/replacements/${id}`)
      .then(setRpl)
      .catch((err) => setError(err.message || 'Failed to load replacement'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.put(`/replacements/${id}`, { status });
      setRpl((prev) => ({ ...prev, ...updated }));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (error) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/replacements')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Replacements</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!rpl) return <p className="text-foreground/30">Replacement not found</p>;

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'assets', label: 'Assets' },
    { key: 'timeline', label: `Timeline (${rpl.timeline?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/replacements')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Replacements
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-foreground/30">{rpl.replacement_number}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${rpl.replacement_type === 'advance' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>{rpl.replacement_type} replacement</span>
            </div>
            <h1 className="text-2xl font-brand font-bold text-foreground">{rpl.customer_name}</h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={rpl.status} />
            <select value={rpl.status} onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60">
              <option value="initiated">Initiated</option>
              <option value="approved">Approved</option>
              <option value="dispatched">Dispatched</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Order</p>
            {rpl.order_id ? <p className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${rpl.order_id}`)}>#{rpl.order_id}</p> : <p className="text-sm font-bold">-</p>}
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Reason</p>
            <p className="text-sm font-bold capitalize">{(rpl.faulty_reason || '-').replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Type</p>
            <p className="text-sm font-bold capitalize">{rpl.replacement_type || '-'}</p>
          </div>
          {rpl.ticket_id && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Ticket</p>
              <p className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/support/${rpl.ticket_id}`)}>#{rpl.ticket_id}</p>
            </div>
          )}
          {rpl.damage_charges > 0 && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Damage Charges</p>
              <p className="text-lg font-bold text-amber-500">₹{Number(rpl.damage_charges).toLocaleString('en-IN')}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Faulty Asset</p>
            <p className="text-sm font-bold font-mono">{rpl.faulty_asset?.uid || rpl.faulty_asset_uid || '-'}</p>
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
      {tab === 'details' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">Replacement Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-foreground/25 uppercase tracking-widest block mb-0.5">Order</span>
                {rpl.order_id ? <span className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${rpl.order_id}`)}>#{rpl.order_id}</span> : <span className="text-sm text-foreground/40">-</span>}
              </div>
              <Field label="Reason" value={(rpl.faulty_reason || '').replace(/_/g, ' ')} />
              {rpl.ticket_id && <div><span className="text-[10px] text-foreground/25 uppercase tracking-widest block mb-0.5">Ticket</span><span className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/support/${rpl.ticket_id}`)}>#{rpl.ticket_id}</span></div>}
              {rpl.damage_charges > 0 && <Field label="Damage Charges" value={`₹${Number(rpl.damage_charges).toLocaleString('en-IN')}`} />}
            </div>
            {rpl.fault_description && (
              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-sm text-foreground/60">
                <AlertTriangle size={14} className="text-red-500 inline mr-2" />{rpl.fault_description}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5 border border-red-500/10">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><HardDrive size={14} className="text-red-500" /> Faulty Asset</h3>
            {rpl.faulty_asset ? (
              <div className="space-y-1 text-sm cursor-pointer hover:opacity-80" onClick={() => navigate(`/assets/${rpl.faulty_asset.id}`)}>
                <div className="font-mono font-bold text-red-500">{rpl.faulty_asset.uid}</div>
                <div className="text-foreground/70">{rpl.faulty_asset.oem} {rpl.faulty_asset.model}</div>
                {rpl.faulty_asset.serial_number && <div className="text-foreground/40">S/N: {rpl.faulty_asset.serial_number}</div>}
                <StatusBadge status={rpl.faulty_asset.status} />
              </div>
            ) : (
              <span className="font-mono text-sm text-red-500">{rpl.faulty_asset_uid || '-'}</span>
            )}
          </div>
          <div className="glass rounded-2xl p-5 border border-emerald-500/10">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><HardDrive size={14} className="text-emerald-500" /> Replacement Asset</h3>
            {rpl.replacement_asset ? (
              <div className="space-y-1 text-sm cursor-pointer hover:opacity-80" onClick={() => navigate(`/assets/${rpl.replacement_asset.id}`)}>
                <div className="font-mono font-bold text-emerald-500">{rpl.replacement_asset.uid}</div>
                <div className="text-foreground/70">{rpl.replacement_asset.oem} {rpl.replacement_asset.model}</div>
                {rpl.replacement_asset.serial_number && <div className="text-foreground/40">S/N: {rpl.replacement_asset.serial_number}</div>}
                <StatusBadge status={rpl.replacement_asset.status} />
              </div>
            ) : (
              <span className="text-sm text-foreground/30 italic">Not yet assigned</span>
            )}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <>
          {rpl.timeline && rpl.timeline.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-foreground/[0.03]">
                {[...rpl.timeline].reverse().map((event, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rentr-primary shrink-0" />
                    <StatusBadge status={event.status} />
                    <span className="text-xs text-foreground/40">{new Date(event.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No timeline events yet.</p>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-[10px] text-foreground/25 uppercase tracking-widest block mb-0.5">{label}</span>
      <span className="text-sm font-bold text-foreground capitalize">{value || '-'}</span>
    </div>
  );
}
