import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, FileText, ArrowRight, RotateCcw, LifeBuoy, History, ShieldCheck, Download, ExternalLink, RefreshCw } from 'lucide-react';
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
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get(`/assets/${id}`)
      .then((data) => {
        const a = data.asset || data;
        a.lifecycle_events = data.lifecycle_events || data.events || [];
        a.order = data.order || null;
        a.contract = data.contract || null;
        a.returns = data.returns || [];
        a.tickets = data.tickets || [];
        a.replacements = data.replacements || [];
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
      a.replacements = refreshed.replacements || [];
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

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (error) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Assets</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!asset) return <p className="text-foreground/30">Asset not found</p>;

  const validStates = asset.valid_transitions || ['in_warehouse', 'staged', 'in_transit', 'deployed', 'return_initiated', 'in_repair', 'retired'];
  const events = asset.events || asset.lifecycle_events || [];
  const warrantyInfo = getWarrantyInfo(asset.warranty_expiry);
  const specsStr = asset.specs && typeof asset.specs === 'object' ? Object.entries(asset.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : (asset.specs || '-');

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'management', label: 'Management' },
    { key: 'history', label: `History (${events.length + (asset.returns?.length || 0) + (asset.tickets?.length || 0) + (asset.replacements?.length || 0)})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Assets
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-brand font-bold text-foreground">{[asset.oem, asset.model].filter(Boolean).join(' ') || asset.uid}</h1>
              {asset.condition_grade && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${gradeColors[asset.condition_grade] || ''}`}>Grade {asset.condition_grade}</span>
              )}
            </div>
            <p className="text-foreground/30 text-sm">
              <span className="font-mono">{asset.uid}</span>
              {asset.serial_number && <> &middot; SN: <span className="font-mono">{asset.serial_number}</span></>}
            </p>
            {asset.category && <p className="text-foreground/40 text-xs mt-1">{asset.category}</p>}
          </div>
          <StatusBadge status={asset.status} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Monthly Rate</p>
            <p className="text-lg font-bold text-emerald-500">{asset.monthly_rate > 0 ? `₹${fmt(asset.monthly_rate)}` : '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Acquisition Cost</p>
            <p className="text-sm font-bold">₹{fmt(asset.acquisition_cost)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Warranty</p>
            <p className={`text-sm font-bold ${warrantyInfo.color}`}>
              {warrantyInfo.label}{warrantyInfo.days !== null ? ` (${warrantyInfo.days}d)` : ''}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Warranty Expiry</p>
            <p className="text-sm font-bold">{asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Specs</p>
            <p className="text-sm font-bold truncate" title={specsStr}>{specsStr}</p>
          </div>
          {asset.customer_email && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Customer</p>
              <p className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/customers/${encodeURIComponent(asset.customer_email)}`)}>{asset.customer_name || asset.customer_email}</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        {(asset.order || asset.contract) && (
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-foreground/[0.05]">
            {asset.order && (
              <button onClick={() => navigate(`/orders/${asset.order.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 text-foreground/60 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-all">
                <Package size={14} /> Order {asset.order.order_number} <ExternalLink size={12} />
              </button>
            )}
            {asset.contract && (
              <button onClick={() => navigate(`/contracts/${asset.contract.id}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 text-foreground/60 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-all">
                <FileText size={14} /> Contract {asset.contract.contract_number} <ExternalLink size={12} />
              </button>
            )}
          </div>
        )}
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
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">OEM / Model</p>
              <p className="text-sm font-bold">{[asset.oem, asset.model].filter(Boolean).join(' / ') || '-'}</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Serial Number</p>
              <p className="text-sm font-bold font-mono">{asset.serial_number || '-'}</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Category</p>
              <p className="text-sm font-bold">{asset.category || '-'}</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Specs</p>
              <p className="text-sm font-bold max-w-[60%] text-right">{specsStr}</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Acquisition Cost</p>
              <p className="text-sm font-bold">₹{fmt(asset.acquisition_cost)}</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Monthly Rate</p>
              <p className="text-sm font-bold text-emerald-500">{asset.monthly_rate > 0 ? `₹${fmt(asset.monthly_rate)}` : '-'}</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Condition Grade</p>
              {asset.condition_grade ? (
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${gradeColors[asset.condition_grade] || ''}`}>Grade {asset.condition_grade}</span>
              ) : (
                <p className="text-sm font-bold">-</p>
              )}
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Warranty Status</p>
              <p className={`text-sm font-bold ${warrantyInfo.color}`}>
                {warrantyInfo.label}{warrantyInfo.days !== null ? ` (${warrantyInfo.days}d)` : ''}
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Warranty Expiry</p>
              <p className="text-sm font-bold">{asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
            </div>
            {asset.customer_email && (
              <div className="px-6 py-4 flex items-center justify-between">
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Customer</p>
                <p className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/customers/${encodeURIComponent(asset.customer_email)}`)}>{asset.customer_name || asset.customer_email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'management' && (
        <div className="space-y-4">
          {/* State Transition */}
          <div className="glass rounded-2xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-4">State Transition</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={nextState} onChange={(e) => setNextState(e.target.value)}
                className="flex-1 bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2.5 text-sm text-foreground/60 focus:outline-none focus:border-rentr-primary/50">
                <option value="">Select next state...</option>
                {validStates.filter(s => s !== asset.status).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <input type="text" placeholder="Notes (optional)" value={transitionNotes} onChange={(e) => setTransitionNotes(e.target.value)}
                className="flex-1 bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-rentr-primary/50" />
              <button onClick={handleTransition} disabled={!nextState || transitioning}
                className="px-4 py-2.5 rounded-lg bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary/80 transition-all disabled:opacity-50">
                {transitioning ? 'Transitioning...' : 'Transition'}
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Tags</p>
              <span className="text-[10px] text-foreground/25">{tags.length} tags</span>
            </div>
            <TagsManager tags={tags} onTagsChange={handleTagsChange} />
          </div>

          {/* Data Wipe */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-foreground/25" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Data Wipe Certificate</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusBadge status={dataWipeStatus} />
                <select value={dataWipeStatus} onChange={(e) => handleDataWipeStatusChange(e.target.value)}
                  className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60 focus:outline-none focus:border-rentr-primary/50">
                  <option value="Not Requested">Not Requested</option>
                  <option value="Requested">Requested</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Issued">Issued</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              {(dataWipeStatus === 'Issued' || dataWipeStatus === 'Delivered') && asset.data_wipe_cert_url && (
                <a href={asset.data_wipe_cert_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                  <Download size={14} /> Download
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {/* Lifecycle History */}
          {events.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <div className="flex items-center gap-2">
                  <History size={14} className="text-foreground/25" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Lifecycle Events</p>
                </div>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {events.slice(0, 10).map((event, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rentr-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{(event.from_state || '').replace(/_/g, ' ')} → {(event.to_state || '').replace(/_/g, ' ')}</p>
                      {event.triggered_by && <p className="text-[10px] text-foreground/30">by {event.triggered_by}</p>}
                    </div>
                    <span className="text-[10px] text-foreground/25 shrink-0">{event.timestamp ? new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Returns */}
          {asset.returns && asset.returns.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className="text-foreground/25" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Linked Returns</p>
                </div>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {asset.returns.map((ret) => (
                  <div key={ret.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/returns/${ret.id}`)}>
                    <p className="text-sm font-bold">#{ret.return_number || ret.id}</p>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={ret.status} />
                      <ArrowRight size={14} className="text-foreground/20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Tickets */}
          {asset.tickets && asset.tickets.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <div className="flex items-center gap-2">
                  <LifeBuoy size={14} className="text-foreground/25" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Linked Tickets</p>
                </div>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {asset.tickets.map((t) => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/support/${t.id}`)}>
                    <div>
                      <p className="text-sm font-bold">#{t.ticket_number || t.id}</p>
                      <p className="text-xs text-foreground/30">{t.subject}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={t.status} />
                      <ArrowRight size={14} className="text-foreground/20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replacements */}
          {asset.replacements && asset.replacements.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="text-foreground/25" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Replacements</p>
                </div>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {asset.replacements.map((rpl) => {
                  const isFaulty = rpl.faulty_asset_uid === asset.uid;
                  const role = isFaulty ? 'Faulty Asset' : 'Replacement Asset';
                  const otherUid = isFaulty ? rpl.replacement_asset_uid : rpl.faulty_asset_uid;
                  return (
                    <div key={rpl.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/replacements/${rpl.id}`)}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">#{rpl.replacement_number || rpl.id}</p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${isFaulty ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{role}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {otherUid && <p className="text-[10px] text-foreground/30">{isFaulty ? 'Replaced by' : 'Replaced'}: <span className="font-mono">{otherUid}</span></p>}
                          {rpl.faulty_reason && <p className="text-[10px] text-foreground/30 truncate max-w-[200px]">{rpl.faulty_reason}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {rpl.damage_charges > 0 && <span className="text-[10px] text-amber-400 font-bold">₹{fmt(rpl.damage_charges)}</span>}
                        <StatusBadge status={rpl.status} />
                        <ArrowRight size={14} className="text-foreground/20" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {events.length === 0 && (!asset.returns || asset.returns.length === 0) && (!asset.tickets || asset.tickets.length === 0) && (!asset.replacements || asset.replacements.length === 0) && (
            <div className="glass rounded-2xl overflow-hidden">
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No history or related items yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
