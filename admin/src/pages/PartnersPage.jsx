import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Handshake, Search, Filter } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const tierStyles = {
  Silver: 'bg-foreground/[0.05] text-foreground/70',
  Gold: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  Platinum: 'bg-purple-500/10 text-purple-400 border border-purple-500/15',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const url = search ? `/partners/?search=${encodeURIComponent(search)}` : '/partners/';
    api.get(url)
      .then((data) => setPartners(data.items || []))
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, [search]);

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  const columns = [
    {
      key: 'company_name',
      label: 'Partner',
      render: (v, row) => (
        <div>
          <div className="font-semibold text-foreground">{v || '-'}</div>
          <div className="text-xs text-foreground/60">{row.name}</div>
          <div className="text-xs text-foreground/30">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'tier',
      label: 'Tier',
      render: (v) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${tierStyles[v] || tierStyles.Silver}`}>
          {v}
        </span>
      ),
    },
    { key: 'gstin', label: 'GSTIN', render: (v) => v || '-' },
    {
      key: 'kyc_status',
      label: 'KYC Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'monthly_revenue',
      label: 'Monthly Revenue',
      render: (v) => `₹${fmt(v)}`,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      render: (v) => (
        <span className={v > 0 ? 'text-red-600 font-medium' : ''}>
          {`₹${fmt(v)}`}
        </span>
      ),
    },
    { key: 'total_assets', label: 'Assets' },
    { key: 'open_tickets', label: 'Open Tickets' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Partner Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Know Your Partner
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH PARTNERS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
          <button className="p-3 rounded-full bg-foreground/[0.02] border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* List */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={partners}
          loading={loading}
          onRowClick={(row) => navigate(`/partners/${encodeURIComponent(row.email)}`)}
          emptyMessage="No channel partners found."
          emptyIcon={<Handshake size={40} className="text-foreground/10" />}
        />
      </div>

      {/* Footer */}
      {partners.length > 0 && (
        <div className="flex items-center justify-between pt-8 border-t border-foreground/[0.05]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
            Showing {partners.length} Partners
          </p>
        </div>
      )}
    </motion.div>
  );
}
