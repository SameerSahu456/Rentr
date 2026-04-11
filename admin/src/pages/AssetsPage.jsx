import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { HardDrive, Plus, Search, Filter, Package, Wrench, Warehouse } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'in_warehouse', label: 'In Warehouse' },
  { value: 'staged', label: 'Staged' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'deployed', label: 'Deployed' },
  { value: 'return_initiated', label: 'Return Initiated' },
  { value: 'in_repair', label: 'In Repair' },
  { value: 'retired', label: 'Retired' },
];

const gradeColors = {
  A: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  B: 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  C: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  D: 'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  E: 'bg-red-500/10 text-red-400 border border-red-500/15',
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

export default function AssetsPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/assets/stats').then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    const qs = params.toString();
    api.get(`/assets/${qs ? `?${qs}` : ''}`)
      .then((data) => {
        const items = data.items || data || [];
        setAssets(items.map((a) => ({
          id: a.id,
          uid: a.uid,
          oem_model: [a.oem, a.model].filter(Boolean).join(' / '),
          category: a.category,
          status: a.status,
          condition_grade: a.condition_grade,
          customer: a.customer_name || a.customer || '-',
          customer_email: a.customer_email,
          monthly_rate: a.monthly_rate,
        })));
      })
      .catch((err) => setError(err.message || 'Failed to fetch assets'))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  const columns = [
    {
      key: 'uid',
      label: 'UID',
      render: (v) => <span className="font-bold font-mono">{v}</span>,
    },
    { key: 'oem_model', label: 'OEM / Model' },
    {
      key: 'category',
      label: 'Category',
      render: (v) => (
        <span className="px-2 py-1 rounded-md bg-foreground/[0.03] border border-foreground/[0.05] text-[9px] font-bold uppercase tracking-wider text-foreground/40">
          {v}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'condition_grade',
      label: 'Condition',
      render: (v) => v ? (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${gradeColors[v] || 'bg-foreground/[0.05] text-foreground/60'}`}>
          Grade {v}
        </span>
      ) : '-',
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (v, row) => v && v !== '-' && row.customer_email ? (
        <span
          className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors"
          onClick={(e) => { e.stopPropagation(); navigate(`/customers/${encodeURIComponent(row.customer_email)}`); }}
        >{v}</span>
      ) : (v || '-'),
    },
    {
      key: 'monthly_rate',
      label: 'Rate',
      render: (v) => v ? `₹${fmt(v)}/mo` : '-',
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Inventory Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Asset Registry
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="FILTER ASSETS"
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
            onClick={() => navigate('/assets/new')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all shadow-lg shadow-rentr-primary/20"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </motion.div>
      </div>

      {/* Stat Cards — border-separated grid like dashboard */}
      {stats && (
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 border border-foreground/[0.05] rounded-2xl overflow-hidden">
          {[
            { label: 'Total Assets', value: stats.total || 0, icon: HardDrive },
            { label: 'Deployed', value: stats.deployed || 0, icon: Package },
            { label: 'In Warehouse', value: stats.in_warehouse || 0, icon: Warehouse },
            { label: 'In Repair', value: stats.in_repair || 0, icon: Wrench },
          ].map((s, i) => (
            <div key={s.label} className={`p-4 sm:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700 ${i < 3 ? 'border-r border-foreground/[0.05]' : ''}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">{s.label}</span>
                <s.icon className="w-4 h-4 text-foreground/10 group-hover:text-rentr-primary transition-colors" />
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">{s.value.toLocaleString('en-IN')}</h3>
            </div>
          ))}
        </motion.div>
      )}

      {error && (
        <div className="bg-yellow-500/5 border border-yellow-500/15 text-yellow-400 text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* List */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={assets}
          loading={loading}
          onRowClick={(row) => navigate(`/assets/${row.id}`)}
          emptyMessage="No assets found. Add your first asset to get started."
          emptyIcon={<HardDrive size={40} className="text-foreground/10" />}
          exportFilename="rentr-assets"
        />
      </div>

    </motion.div>
  );
}
