import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { RefreshCw, Search, Plus } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

const tabs = ['all', 'initiated', 'replacement_staged', 'shipped', 'deployed', 'completed', 'cancelled'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function AdvanceReplacementsPage() {
  const navigate = useNavigate();
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, initiated: 0, shipped: 0, completed: 0 });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('status', activeTab);
    if (search) params.set('search', search);
    const qs = params.toString();
    const url = `/advance-replacements/${qs ? `?${qs}` : ''}`;
    api.get(url)
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items || data.results || [];
        setReplacements(items);
        // Compute stats from full list (when no filter)
        if (activeTab === 'all' && !search) {
          setStats({
            total: items.length,
            initiated: items.filter((r) => r.status === 'initiated').length,
            shipped: items.filter((r) => r.status === 'shipped').length,
            completed: items.filter((r) => r.status === 'completed').length,
          });
        }
      })
      .catch(() => setReplacements([]))
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'faulty_uid',
      label: 'Faulty Asset UID',
      render: (v) => (
        <span className="font-mono font-bold text-red-400">{v || '-'}</span>
      ),
    },
    {
      key: 'replacement_uid',
      label: '\u2192 Replacement UID',
      render: (v) => (
        <span className="font-mono font-bold text-green-400">{v || '-'}</span>
      ),
    },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v?.replace(/_/g, ' ')} /> },
    {
      key: 'created_at',
      label: 'Created Date',
      render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-',
    },
  ];

  const statCards = [
    { label: 'Total', value: fmt(stats.total), color: 'text-foreground' },
    { label: 'Initiated', value: fmt(stats.initiated), color: 'text-yellow-400' },
    { label: 'Shipped', value: fmt(stats.shipped), color: 'text-blue-400' },
    { label: 'Completed', value: fmt(stats.completed), color: 'text-green-400' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Asset Operations</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Advance Replacements
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH BY UID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
          <button
            onClick={() => navigate('/advance-replacements/new')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all shadow-lg shadow-rentr-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Replacement
          </button>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30 mb-2">{s.label}</p>
            <p className={`text-2xl font-brand font-black tracking-tight ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors ${
              activeTab === tab
                ? 'bg-rentr-primary text-white'
                : 'text-foreground/20 hover:text-foreground'
            }`}
          >
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </motion.div>

      {/* List */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={replacements}
          loading={loading}
          emptyMessage="No advance replacements found."
          emptyIcon={<RefreshCw size={40} className="text-foreground/10" />}
          onRowClick={(row) => navigate(`/advance-replacements/${row.id}`)}
          exportFilename="rentr-advance-replacements"
        />
      </div>
    </motion.div>
  );
}
