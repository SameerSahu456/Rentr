import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, FileText, Package, Shield, CreditCard, AlertTriangle, HardDrive, LifeBuoy } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

const gradeColors = {
  A: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  B: 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  C: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  D: 'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  E: 'bg-red-500/10 text-red-400 border border-red-500/15',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const STATUS_OPTIONS = [
  'pending', 'approved', 'pickup_scheduled', 'in_transit', 'received_grn', 'damage_review', 'completed',
];

export default function ReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get(`/returns/${id}`)
      .then(setRet)
      .catch(() => navigate('/returns'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      const updated = await api.put(`/returns/${id}`, { status: newStatus });
      setRet(updated);
      setNewStatus('');
    } catch { /* ignore */ }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ret) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/returns')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Returns
        </button>
        <StatusBadge status={ret.status} />
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              Return
            </span>
            <span className="text-[10px] font-mono text-foreground/20">#{ret.return_number || ret.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            {ret.customer_email ? <span className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(ret.customer_email)}`)}>{ret.customer_name || ret.customer || 'Return'}</span> : (ret.customer_name || ret.customer || 'Return')}
          </h1>
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div className="flex items-start gap-2">
            <User size={16} className="text-foreground/30 mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span>
              <span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(ret.customer_email)}`)}>{ret.customer_name || ret.customer || '-'}</span>
            </div>
          </div>
          <InfoItem icon={Package} label="Order" value={ret.order_id || '-'} />
          <InfoItem icon={FileText} label="Contract" value={ret.contract_id || '-'} />
          <InfoItem icon={FileText} label="Reason" value={ret.reason || '-'} />
          <InfoItem icon={Calendar} label="Pickup Date" value={ret.pickup_date ? new Date(ret.pickup_date).toLocaleDateString('en-IN') : '-'} />
          <InfoItem icon={Calendar} label="Pickup Time" value={ret.pickup_time || '-'} />
          <InfoItem icon={MapPin} label="Site" value={ret.site || '-'} />
          <div className="flex items-start gap-2">
            <Shield size={16} className="text-foreground/30 mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Data Wipe Requested</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                ret.data_wipe_requested ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-foreground/[0.05] text-foreground/60'
              }`}>
                {ret.data_wipe_requested ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      {(ret.order || ret.contract || ret.customer_email) && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            {ret.order && (
              <button
                onClick={() => navigate(`/orders/${ret.order.id}`)}
                className="flex items-center gap-3 bg-foreground/[0.02] rounded-xl sm:rounded-[2rem] border border-foreground/[0.05] p-4 sm:p-6 hover:border-rentr-primary/20 hover:bg-rentr-primary/[0.02] transition-all duration-500 text-left"
              >
                <Package size={18} className="text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">Order {ret.order.order_number}</div>
                  <StatusBadge status={ret.order.status} />
                </div>
              </button>
            )}
            {ret.contract && (
              <button
                onClick={() => navigate(`/contracts/${ret.contract.id}`)}
                className="flex items-center gap-3 bg-foreground/[0.02] rounded-xl sm:rounded-[2rem] border border-foreground/[0.05] p-4 sm:p-6 hover:border-rentr-primary/20 hover:bg-rentr-primary/[0.02] transition-all duration-500 text-left"
              >
                <FileText size={18} className="text-green-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">Contract {ret.contract.contract_number}</div>
                  <StatusBadge status={ret.contract.status} />
                </div>
              </button>
            )}
            {ret.customer_email && (
              <button
                onClick={() => navigate(`/customers/${encodeURIComponent(ret.customer_email)}`)}
                className="flex items-center gap-3 bg-foreground/[0.02] rounded-xl sm:rounded-[2rem] border border-foreground/[0.05] p-4 sm:p-6 hover:border-rentr-primary/20 hover:bg-rentr-primary/[0.02] transition-all duration-500 text-left"
              >
                <User size={18} className="text-purple-500" />
                <div className="text-sm font-medium text-foreground">Customer: {ret.customer_name || ret.customer_email}</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Linked Assets (DataTable) */}
      {ret.linked_assets && ret.linked_assets.length > 0 ? (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Assets</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-bold">{v}</span> },
                { key: 'oem', label: 'OEM / Model', render: (_, row) => [row.oem, row.model].filter(Boolean).join(' / ') || '-' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'condition_grade', label: 'Grade', render: (v) => v ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${gradeColors[v] || 'bg-foreground/[0.05] text-foreground/60'}`}>Grade {v}</span> : '-' },
              ]}
              data={ret.linked_assets}
              loading={false}
              onRowClick={(row) => navigate(`/assets/${row.id}`)}
              emptyMessage="No assets."
            />
          </div>
        </div>
      ) : ret.asset_uids && ret.asset_uids.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6">Asset UIDs</h2>
          <div className="flex flex-wrap gap-2">
            {ret.asset_uids.map((uid, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-mono font-medium bg-foreground/[0.05] text-foreground border border-foreground/[0.05]">
                {uid}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* GRN Section */}
      {(ret.status === 'received_grn' || ret.status === 'damage_review' || ret.status === 'completed') && (ret.grn_date || ret.grn_data) && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6">GRN (Goods Received Note)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">GRN Date</span>
              <span className="font-medium text-foreground">
                {ret.grn_date ? new Date(ret.grn_date).toLocaleDateString('en-IN') : '-'}
              </span>
            </div>
            {ret.grn_data && (
              <div className="col-span-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-1">GRN Data</span>
                <pre className="text-sm text-foreground/70 bg-foreground/[0.02] rounded-lg p-3 overflow-x-auto">
                  {typeof ret.grn_data === 'string' ? ret.grn_data : JSON.stringify(ret.grn_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Damage Section */}
      {(ret.damage_charges || ret.damage_notes || ret.pro_rata_credit) && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Damage Assessment</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Damage Charges</span>
              <span className="font-medium text-red-600">{`\u20B9${fmt(ret.damage_charges)}`}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Pro-rata Credit</span>
              <span className="font-medium text-green-600">{`\u20B9${fmt(ret.pro_rata_credit)}`}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Reviewed By</span>
              <span className="font-medium text-foreground">{ret.reviewed_by || '-'}</span>
            </div>
            {ret.damage_notes && (
              <div className="col-span-2 sm:col-span-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Damage Notes</span>
                <span className="font-medium text-foreground">{ret.damage_notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Special Instructions */}
      {ret.special_instructions && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-4">Special Instructions</h3>
          <p className="text-sm text-foreground/60">{ret.special_instructions}</p>
        </div>
      )}

      {/* Linked Invoices */}
      {ret.invoices && ret.invoices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Invoices</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'invoice_number', label: 'Invoice #' },
                { key: 'total', label: 'Total', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'due_date', label: 'Due Date', render: (v) => v || '-' },
              ]}
              data={ret.invoices}
              loading={false}
              onRowClick={(row) => navigate(`/invoices/${row.id}`)}
              emptyMessage="No invoices."
            />
          </div>
        </div>
      )}

      {/* Linked Support Tickets */}
      {ret.tickets && ret.tickets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Support Tickets</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'ticket_number', label: 'Ticket #' },
                { key: 'subject', label: 'Subject' },
                { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              ]}
              data={ret.tickets}
              loading={false}
              onRowClick={(row) => navigate(`/support/${row.id}`)}
              emptyMessage="No tickets."
            />
          </div>
        </div>
      )}

      {/* Status Update */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6">Update Status</h2>
        <div className="flex gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="flex-1 bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
          >
            <option value="">Select status...</option>
            {STATUS_OPTIONS.filter((s) => s !== ret.status).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={!newStatus || updating}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="text-foreground/30 mt-0.5 shrink-0" />
      <div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
