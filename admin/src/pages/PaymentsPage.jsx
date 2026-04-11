import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const tabs = ['all', 'completed', 'pending', 'failed'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
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
    const url = `/payments/${qs ? `?${qs}` : ''}`;
    api.get(url)
      .then((data) => setPayments(Array.isArray(data) ? data : data.items || data.results || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  const columns = [
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (v, row) => v ? (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${row.invoice_id}`); }}
          className="text-rentr-primary hover:text-rentr-primary-light font-medium hover:underline"
        >
          {v}
        </button>
      ) : '-',
    },
    { key: 'amount', label: 'Amount', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
    { key: 'method', label: 'Method', render: (v) => (v || '-').replace(/_/g, ' ') },
    { key: 'transaction_id', label: 'Transaction ID', render: (v) => v || '-' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Payment Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Payments
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH PAYMENTS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
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
            {tab}
          </button>
        ))}
      </motion.div>

      {/* List */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          onRowClick={(row) => row.invoice_id && navigate(`/invoices/${row.invoice_id}`)}
          emptyMessage="No payments found."
          exportFilename="rentr-payments"
        />
      </div>

    </motion.div>
  );
}
