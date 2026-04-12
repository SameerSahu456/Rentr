import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, FileText, Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const tabs = ['all', 'draft', 'pending_signature', 'active', 'expiring_soon', 'expired'];
const tabLabels = {
  all: 'All',
  draft: 'Draft',
  pending_signature: 'Pending Signature',
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab !== 'all') params.set('status', activeTab);
    if (search) params.set('search', search);
    const qs = params.toString();
    const url = `/contracts/${qs ? `?${qs}` : ''}`;
    api.get(url)
      .then((data) => setContracts(Array.isArray(data) ? data : data.items || data.results || []))
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  const columns = [
    { key: 'contract_number', label: 'Contract #' },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (v, row) => (
        <span
          className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors"
          onClick={(e) => { e.stopPropagation(); navigate(`/customers/${encodeURIComponent(row.customer_email)}`); }}
        >{v}</span>
      ),
    },
    {
      key: 'order_id',
      label: 'Order',
      render: (v) => v ? (
        <span
          className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors"
          onClick={(e) => { e.stopPropagation(); navigate(`/orders?search=${encodeURIComponent(v)}`); }}
        >{v}</span>
      ) : '-',
    },
    { key: 'type', label: 'Type', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'document_url', label: 'PDF', render: (v) => v ? <FileText size={16} className="text-green-600" /> : <span className="text-foreground/20">-</span> },
    { key: 'signed_at', label: 'Signed', render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Contract Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Contracts
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH CONTRACTS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
          <button
            onClick={() => navigate('/contracts/new')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all shadow-lg shadow-rentr-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Contract
          </button>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div variants={item} className="flex items-center gap-2">
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
            {tabLabels[tab] || tab}
          </button>
        ))}
      </motion.div>

      {/* List */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={contracts}
          loading={loading}
          emptyMessage="No contracts found."
          onRowClick={(row) => navigate(`/contracts/${row.id}`)}
          exportFilename="rentr-contracts"
        />
      </div>

    </motion.div>
  );
}
