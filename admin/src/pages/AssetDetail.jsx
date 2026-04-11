import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, FileText, ArrowRight, RotateCcw, LifeBuoy, History, ShieldCheck, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TagsManager from '../components/TagsManager';

const gradeColors = {
  A: 'bg-emerald-500/10 text-emerald-400', B: 'bg-blue-500/10 text-blue-400',
  C: 'bg-yellow-500/10 text-yellow-400', D: 'bg-orange-500/10 text-orange-400',
  E: 'bg-red-500/10 text-red-400',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

function getWarrantyInfo(warrantyExpiry) {
  if (!warrantyExpiry) return { label: 'Unknown', days: null, color: 'text-foreground/40' };
  const diffDays = Math.ceil((new Date(warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Expired', days: Math.abs(diffDays), color: 'text-red-400' };
  if (diffDays <= 90) return { label: 'Expiring Soon', days: diffDays, color: 'text-amber-400' };
  return { label: 'Active', days: diffDays, color: 'text-emerald-400' };
}

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextState, setNextState] = useState('');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [tags, setTags] = useState([]);
  const [dataWipeStatus, setDataWipeStatus] = useState('');

  useEffect(() => {
    api.get(`/assets/${id}`)
      .then((data) => {
        const a = data.asset || data;
        a.lifecycle_events = data.lifecycle_events || data.events || [];
        a.order = data.order || null;
        a.contract = data.contract || null;
        a.returns = data.returns || [];
        a.tickets = data.tickets || [];
        setAsset(a);
        setTags(a.tags || []);
        setDataWipeStatus(a.data_wipe_status || 'Not Requested');
      })
      .catch((err) => setError(err.message || 'Failed to load asset'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleTransition = async () => {
    if (!nextState) return;
    setTransitioning(true);
    try {
      await api.post(`/assets/${id}/transition`, { to_state: nextState, notes: transitionNotes });
      const refreshed = await api.get(`/assets/${id}`);
      const a = refreshed.asset || refreshed;
      a.lifecycle_events = refreshed.lifecycle_events || refreshed.events || [];
      a.order = refreshed.order || null;
      a.contract = refreshed.contract || null;
      a.returns = refreshed.returns || [];
      a.tickets = refreshed.tickets || [];
      setAsset(a);
      setNextState('');
      setTransitionNotes('');
    } catch { /* ignore */ }
    setTransitioning(false);
  };

  const handleTagsChange = async (newTags) => {
    setTags(newTags);
    try { await api.patch(`/assets/${id}`, { tags: newTags }); } catch { /* ignore */ }
  };

  const handleDataWipeStatusChange = async (newStatus) => {
    try {
      await api.patch(`/assets/${id}`, { data_wipe_status: newStatus });
      setDataWipeStatus(newStatus);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!asset) return null;

  const validStates = asset.valid_transitions || ['in_warehouse', 'staged', 'in_transit', 'deployed', 'return_initiated', 'in_repair', 'retired'];
  const events = asset.events || asset.lifecycle_events || [];
  const warrantyInfo = getWarrantyInfo(asset.warranty_expiry);
  const specsStr = asset.specs && typeof asset.specs === 'object' ? Object.entries(asset.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : (asset.specs || '-');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-foreground/[0.06]">
        <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={asset.status} />
          {asset.condition_grade && <span className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[asset.condition_grade] || ''}`}>Grade {asset.condition_grade}</span>}
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-rentr-primary/10 text-rentr-primary">{asset.category || 'Asset'}</span>
            <span className="font-mono text-sm text-foreground/40">{asset.uid}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{[asset.oem, asset.model].filter(Boolean).join(' ') || asset.uid}</h1>
        </div>
        {asset.monthly_rate > 0 && (
          <div className="text-right">
            <span className="text-xs text-foreground/40">Monthly Rate</span>
            <div className="text-xl font-bold text-rentr-primary">₹{fmt(asset.monthly_rate)}</div>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Asset Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="OEM / Model" value={[asset.oem, asset.model].filter(Boolean).join(' / ')} />
          <Field label="Serial Number" value={asset.serial_number} mono />
          <Field label="Specs" value={specsStr} />
          <Field label="Acquisition Cost" value={`₹${fmt(asset.acquisition_cost)}`} />
          <Field label="Warranty Expiry" value={asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString('en-IN') : '-'} />
          <div>
            <span className="text-xs text-foreground/40 block mb-0.5">Warranty Status</span>
            <span className={`text-sm font-medium ${warrantyInfo.color}`}>
              {warrantyInfo.label}{warrantyInfo.days !== null ? ` (${warrantyInfo.days}d)` : ''}
            </span>
          </div>
          {asset.customer_email && (
            <div>
              <span className="text-xs text-foreground/40 block mb-0.5">Customer</span>
              <span className="text-sm font-medium text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/customers/${encodeURIComponent(asset.customer_email)}`)}>{asset.customer_name || asset.customer_email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      {(asset.order || asset.contract) && (
        <div className="flex flex-wrap gap-2">
          {asset.order && (
            <button onClick={() => navigate(`/orders/${asset.order.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
              <Package size={14} /> Order {asset.order.order_number} <ExternalLink size={12} />
            </button>
          )}
          {asset.contract && (
            <button onClick={() => navigate(`/contracts/${asset.contract.id}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
              <FileText size={14} /> Contract {asset.contract.contract_number} <ExternalLink size={12} />
            </button>
          )}
        </div>
      )}

      {/* State Transition */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">State Transition</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={nextState} onChange={(e) => setNextState(e.target.value)}
            className="flex-1 bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2.5 text-sm text-foreground/60">
            <option value="">Select next state...</option>
            {validStates.filter(s => s !== asset.status).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <input type="text" placeholder="Notes (optional)" value={transitionNotes} onChange={(e) => setTransitionNotes(e.target.value)}
            className="flex-1 bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2.5 text-sm" />
          <button onClick={handleTransition} disabled={!nextState || transitioning}
            className="px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-rentr-primary hover:text-white transition-colors disabled:opacity-50">
            {transitioning ? 'Transitioning...' : 'Transition'}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Tags</h2>
          <span className="text-xs text-foreground/40">{tags.length} tags</span>
        </div>
        <TagsManager tags={tags} onTagsChange={handleTagsChange} />
      </div>

      {/* Data Wipe */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2"><ShieldCheck size={16} className="text-foreground/40" /> Data Wipe Certificate</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={dataWipeStatus} />
            <select value={dataWipeStatus} onChange={(e) => handleDataWipeStatusChange(e.target.value)}
              className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60">
              <option value="Not Requested">Not Requested</option>
              <option value="Requested">Requested</option>
              <option value="In Progress">In Progress</option>
              <option value="Issued">Issued</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          {(dataWipeStatus === 'Issued' || dataWipeStatus === 'Delivered') && asset.data_wipe_cert_url && (
            <a href={asset.data_wipe_cert_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
              <Download size={14} /> Download
            </a>
          )}
        </div>
      </div>

      {/* Lifecycle History */}
      {events.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2"><History size={16} className="text-foreground/40" /> History</h2>
          <div className="space-y-2">
            {events.slice(0, 10).map((event, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-foreground/[0.04] last:border-0">
                <div className="w-2 h-2 rounded-full bg-rentr-primary shrink-0" />
                <span className="text-sm text-foreground/70">{(event.from_state || '').replace(/_/g, ' ')} → {(event.to_state || '').replace(/_/g, ' ')}</span>
                {event.triggered_by && <span className="text-xs text-foreground/30">by {event.triggered_by}</span>}
                <span className="text-xs text-foreground/30 ml-auto">{event.timestamp ? new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Returns */}
      {asset.returns && asset.returns.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2"><RotateCcw size={16} className="text-foreground/40" /> Linked Returns</h2>
          {asset.returns.map((ret) => (
            <button key={ret.id} onClick={() => navigate(`/returns/${ret.id}`)}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-foreground/[0.03] transition-colors text-left">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">#{ret.return_number || ret.id}</span>
                <StatusBadge status={ret.status} />
              </div>
              <ArrowRight size={14} className="text-foreground/20" />
            </button>
          ))}
        </div>
      )}

      {/* Linked Tickets */}
      {asset.tickets && asset.tickets.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2"><LifeBuoy size={16} className="text-foreground/40" /> Linked Tickets</h2>
          {asset.tickets.map((t) => (
            <button key={t.id} onClick={() => navigate(`/support/${t.id}`)}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-foreground/[0.03] transition-colors text-left">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium">#{t.ticket_number || t.id}</span>
                <span className="text-foreground/60">{t.subject}</span>
                <StatusBadge status={t.status} />
              </div>
              <ArrowRight size={14} className="text-foreground/20" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <span className="text-xs text-foreground/40 block mb-0.5">{label}</span>
      <span className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
    </div>
  );
}
