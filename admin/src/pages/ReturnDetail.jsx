import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import DetailTabs from '../components/DetailTabs';

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

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/returns')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!ret) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-foreground/[0.06]">
        <button onClick={() => navigate('/returns')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={ret.status} />
          <select value={ret.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-rentr-primary/10 text-rentr-primary">Return</span>
          <span className="font-mono text-sm text-foreground/40">#{ret.return_number || ret.id}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground cursor-pointer hover:text-rentr-primary transition-colors"
          onClick={() => ret.customer_email && navigate(`/customers/${encodeURIComponent(ret.customer_email)}`)}>
          {ret.customer_name || 'Return'}
        </h1>
      </div>

      {/* Tabs */}
      <DetailTabs tabs={[
        {
          key: 'overview',
          label: 'Overview',
          content: (
            <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
              <h2 className="text-base font-semibold text-foreground mb-4">Return Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Reason" value={ret.reason} />
                <Field label="Pickup Date" value={ret.pickup_date ? new Date(ret.pickup_date).toLocaleDateString('en-IN') : null} />
                <div>
                  <span className="text-xs text-foreground/40 block mb-0.5">Contract</span>
                  {ret.contract_id ? <span className="text-sm font-medium text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/contracts/${ret.contract_id}`)}>#{ret.contract_id}</span> : <span className="text-sm text-foreground/40">-</span>}
                </div>
                <Field label="GRN #" value={ret.grn_number} />
              </div>
            </div>
          ),
        },
        {
          key: 'assets',
          label: 'Assets & Damage',
          count: ret.linked_assets?.length || ret.asset_uids?.length || 0,
          content: (
            <>
              {ret.linked_assets && ret.linked_assets.length > 0 ? (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-4">Assets ({ret.linked_assets.length})</h2>
                  <DataTable
                    columns={[
                      { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-medium">{v}</span> },
                      { key: 'oem', label: 'OEM / Model', render: (_, row) => [row.oem, row.model].filter(Boolean).join(' / ') || '-' },
                      { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                      { key: 'condition_grade', label: 'Grade', render: (v) => v ? <span className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[v] || ''}`}>Grade {v}</span> : '-' },
                    ]}
                    data={ret.linked_assets}
                    loading={false}
                    onRowClick={(row) => navigate(`/assets/${row.id}`)}
                    emptyMessage="No assets."
                  />
                </div>
              ) : ret.asset_uids && ret.asset_uids.length > 0 && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-3">Asset UIDs</h2>
                  <div className="flex flex-wrap gap-2">
                    {ret.asset_uids.map((uid, i) => <span key={i} className="px-3 py-1 rounded-lg text-sm font-mono bg-foreground/[0.05]">{uid}</span>)}
                  </div>
                </div>
              )}

              {(ret.damage_charges > 0 || ret.damage_report) && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-orange-500" /> Damage Assessment</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div><span className="text-xs text-foreground/40 block mb-0.5">Damage Charges</span><span className="text-lg font-bold text-red-500">₹{Number(ret.damage_charges || 0).toLocaleString('en-IN')}</span></div>
                  </div>
                </div>
              )}

              {(!ret.linked_assets || ret.linked_assets.length === 0) && (!ret.asset_uids || ret.asset_uids.length === 0) && !ret.damage_charges && !ret.damage_report && (
                <div className="text-center py-12 text-foreground/30 text-sm">No assets or damage data.</div>
              )}
            </>
          ),
        },
        {
          key: 'related',
          label: 'Related',
          count: (ret.invoices?.length || 0) + (ret.tickets?.length || 0),
          content: (
            <>
              {ret.invoices && ret.invoices.length > 0 && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-4">Linked Invoices</h2>
                  <DataTable
                    columns={[
                      { key: 'invoice_number', label: 'Invoice #' },
                      { key: 'total', label: 'Total', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
                      { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    ]}
                    data={ret.invoices}
                    loading={false}
                    onRowClick={(row) => navigate(`/invoices/${row.id}`)}
                  />
                </div>
              )}

              {ret.tickets && ret.tickets.length > 0 && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-4">Linked Tickets</h2>
                  <DataTable
                    columns={[
                      { key: 'ticket_number', label: 'Ticket #' },
                      { key: 'subject', label: 'Subject' },
                      { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    ]}
                    data={ret.tickets}
                    loading={false}
                    onRowClick={(row) => navigate(`/support/${row.id}`)}
                  />
                </div>
              )}

              {(!ret.invoices || ret.invoices.length === 0) && (!ret.tickets || ret.tickets.length === 0) && (
                <div className="text-center py-12 text-foreground/30 text-sm">No related items.</div>
              )}
            </>
          ),
        },
      ]} />
    </motion.div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <span className="text-xs text-foreground/40 block mb-0.5">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || '-'}</span>
    </div>
  );
}
