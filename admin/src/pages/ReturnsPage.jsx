import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { RotateCcw, Plus, Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'received_grn', label: 'Received (GRN)' },
  { value: 'damage_review', label: 'Damage Review' },
  { value: 'completed', label: 'Completed' },
];

const reasonColors = {
  'Contract End': 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  'Early Return': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  'Advance Replacement Return': 'bg-purple-500/10 text-purple-400 border border-purple-500/15',
  'Faulty Device': 'bg-red-500/10 text-red-400 border border-red-500/15',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function ReturnsPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const qp = new URLSearchParams();
    if (statusFilter) qp.set('status', statusFilter);
    if (search) qp.set('search', search);
    const params = qp.toString() ? `?${qp.toString()}` : '';
    api.get(`/returns/${params}`)
      .then((data) => {
        const items = data.items || data || [];
        setReturns(items.map((r) => ({
          id: r.id,
          return_number: r.return_number ? `#${r.return_number}` : `#${r.id}`,
          customer: r.customer_name || r.customer || '-',
          customer_email: r.customer_email,
          asset_count: Array.isArray(r.asset_uids) ? r.asset_uids.length : 0,
          reason: r.reason || '-',
          status: r.status,
          pickup_date: r.pickup_date ? new Date(r.pickup_date).toLocaleDateString('en-IN') : '-',
          damage_charges: r.damage_charges,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '-',
        })));
      })
      .catch((err) => setError(err.message || 'Failed to fetch returns'))
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  const columns = [
    { key: 'return_number', label: 'Return #' },
    {
      key: 'customer',
      label: 'Customer',
      render: (v, row) => row.customer_email ? (
        <span
          className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors"
          onClick={(e) => { e.stopPropagation(); navigate(`/customers/${encodeURIComponent(row.customer_email)}`); }}
        >{v}</span>
      ) : v,
    },
    {
      key: 'asset_count',
      label: 'Assets',
      render: (v) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-foreground/[0.05] text-foreground/70">
          {v} asset{v !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (v) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${reasonColors[v] || 'bg-foreground/[0.05] text-foreground/70'}`}>
          {v}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'pickup_date', label: 'Pickup Date' },
    {
      key: 'damage_charges',
      label: 'Damage Charges',
      render: (v) => v ? `₹${fmt(v)}` : '-',
    },
    { key: 'date', label: 'Date' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Return Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Returns
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH RETURNS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => navigate('/returns/new')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all shadow-lg shadow-rentr-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Return
          </button>
        </motion.div>
      </div>

      {error && (
        <div className="bg-yellow-500/5 border border-yellow-500/15 text-yellow-400 text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* List */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={returns}
          loading={loading}
          onRowClick={(row) => navigate(`/returns/${row.id}`)}
          emptyMessage="No return requests found."
          emptyIcon={<RotateCcw size={40} className="text-foreground/10" />}
          exportFilename="rentr-returns"
        />
      </div>

    </motion.div>
  );
}
