import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Package, FileText, TicketIcon } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

const STATUS_OPTIONS = ['initiated', 'pickup_scheduled', 'in_transit', 'received', 'grn_completed', 'closed'];

const gradeColors = {
  A: 'bg-emerald-500/10 text-emerald-400', B: 'bg-blue-500/10 text-blue-400',
  C: 'bg-yellow-500/10 text-yellow-400', D: 'bg-orange-500/10 text-orange-400',
  E: 'bg-red-500/10 text-red-400',
};

export default function ReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get(`/returns/${id}`)
      .then(setRet)
      .catch((err) => setError(err.message || 'Failed to load return'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.put(`/returns/${id}`, { status });
      setRet((prev) => ({ ...prev, ...updated }));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (error) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/returns')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Returns
      </button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!ret) return null;

  const assetCount = ret.linked_assets?.length || ret.asset_uids?.length || 0;
  const relatedCount = (ret.invoices?.length || 0) + (ret.tickets?.length || 0);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'assets', label: `Assets & Damage (${assetCount})` },
    { key: 'related', label: `Related (${relatedCount})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/returns')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Returns
      </button>

      {/* Header Card */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rentr-primary/10 text-rentr-primary">Return</span>
              <span className="font-mono text-xs text-foreground/25">#{ret.return_number || ret.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-brand font-bold text-foreground cursor-pointer hover:text-rentr-primary transition-colors"
              onClick={() => ret.customer_email && navigate(`/customers/${encodeURIComponent(ret.customer_email)}`)}>
              {ret.customer_name || 'Return'}
            </h1>
            {ret.customer_email && <p className="text-foreground/30 text-sm truncate">{ret.customer_email}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={ret.status} />
            <select value={ret.status} onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-xs text-foreground/60">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Reason</p>
            <p className="text-sm font-bold">{ret.reason || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Pickup Date</p>
            <p className="text-sm font-bold">{ret.pickup_date ? new Date(ret.pickup_date).toLocaleDateString('en-IN') : '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Contract</p>
            {ret.contract_id ? (
              <p className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/contracts/${ret.contract_id}`)}>#{ret.contract_id}</p>
            ) : (
              <p className="text-sm font-bold">-</p>
            )}
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">GRN #</p>
            <p className="text-sm font-bold">{ret.grn_number || '-'}</p>
          </div>
          {ret.damage_charges > 0 && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Damage Charges</p>
              <p className="text-lg font-bold text-red-500">₹{Number(ret.damage_charges || 0).toLocaleString('en-IN')}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Assets</p>
            <p className="text-sm font-bold">{assetCount}</p>
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
            <Package className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{assetCount}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Assets</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <FileText className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{ret.invoices?.length || 0}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Invoices</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <TicketIcon className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{ret.tickets?.length || 0}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Tickets</p>
          </div>
          {ret.damage_charges > 0 && (
            <div className="glass rounded-2xl p-5">
              <AlertTriangle className="w-5 h-5 text-orange-500 mb-2" />
              <p className="text-2xl font-bold text-red-500">₹{Number(ret.damage_charges).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Damage Charges</p>
            </div>
          )}
        </div>
      )}

      {tab === 'assets' && (
        <div className="space-y-6">
          {ret.linked_assets && ret.linked_assets.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.03]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Assets ({ret.linked_assets.length})</h3>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {ret.linked_assets.map((asset, i) => (
                  <div key={asset.id || i} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/assets/${asset.id}`)}>
                    <div>
                      <p className="text-sm font-bold font-mono">{asset.uid}</p>
                      <p className="text-xs text-foreground/30">{[asset.oem, asset.model].filter(Boolean).join(' / ') || '-'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {asset.condition_grade && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[asset.condition_grade] || ''}`}>
                          Grade {asset.condition_grade}
                        </span>
                      )}
                      <StatusBadge status={asset.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : ret.asset_uids && ret.asset_uids.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.03]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Asset UIDs ({ret.asset_uids.length})</h3>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {ret.asset_uids.map((uid, i) => (
                  <div key={i} className="px-6 py-4">
                    <p className="text-sm font-bold font-mono">{uid}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(ret.damage_charges > 0 || (ret.damage_report && Object.keys(ret.damage_report).length > 0)) && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.03]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-orange-500" /> Damage Assessment
                </h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Damage Charges</p>
                <p className="text-lg font-bold text-red-500">₹{Number(ret.damage_charges || 0).toLocaleString('en-IN')}</p>
                {ret.damage_report && Object.keys(ret.damage_report).length > 0 && (
                  <div className="mt-2 text-sm text-foreground/60">
                    {typeof ret.damage_report === 'string' ? ret.damage_report : (
                      <pre className="whitespace-pre-wrap text-xs bg-foreground/[0.03] p-3 rounded-lg">{JSON.stringify(ret.damage_report, null, 2)}</pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {(!ret.linked_assets || ret.linked_assets.length === 0) && (!ret.asset_uids || ret.asset_uids.length === 0) && !ret.damage_charges && (!ret.damage_report || Object.keys(ret.damage_report).length === 0) && (
            <div className="glass rounded-2xl p-8 text-center text-foreground/20 text-xs italic">No assets or damage data available for this return.</div>
          )}
        </div>
      )}

      {tab === 'related' && (
        <div className="space-y-6">
          {ret.invoices && ret.invoices.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.03]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Linked Invoices ({ret.invoices.length})</h3>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {ret.invoices.map((inv, i) => (
                  <div key={inv.id || i} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <div>
                      <p className="text-sm font-bold">{inv.invoice_number}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">₹{Number(inv.total || 0).toLocaleString('en-IN')}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ret.tickets && ret.tickets.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.03]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Linked Tickets ({ret.tickets.length})</h3>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {ret.tickets.map((tk, i) => (
                  <div key={tk.id || i} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/support/${tk.id}`)}>
                    <div>
                      <p className="text-sm font-bold">{tk.ticket_number}</p>
                      <p className="text-xs text-foreground/30">{tk.subject}</p>
                    </div>
                    <StatusBadge status={tk.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!ret.invoices || ret.invoices.length === 0) && (!ret.tickets || ret.tickets.length === 0) && (
            <div className="glass rounded-2xl p-8 text-center text-foreground/20 text-xs italic">No related items.</div>
          )}
        </div>
      )}
    </div>
  );
}
