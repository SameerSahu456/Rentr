import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const tabs = ['all', 'open', 'in_progress', 'resolved', 'closed'];

const priorityColors = {
  low: 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  high: 'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  urgent: 'bg-red-500/10 text-red-400 border border-red-500/15',
};

function PriorityBadge({ priority }) {
  const classes = priorityColors[(priority || '').toLowerCase()] || 'bg-foreground/[0.05] text-foreground/60';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${classes}`}>
      {priority}
    </span>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
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
    const url = `/support/tickets${qs ? `?${qs}` : ''}`;
    api.get(url)
      .then((data) => setTickets(Array.isArray(data) ? data : data.items || data.results || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [activeTab, search]);

  const columns = [
    { key: 'ticket_number', label: 'Ticket #' },
    { key: 'subject', label: 'Subject' },
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
    { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge priority={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v?.replace(/_/g, ' ')} /> },
    { key: 'assigned_to', label: 'Assigned' },
    { key: 'created_at', label: 'Created', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Support Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Support Tickets
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH TICKETS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
          <button
            onClick={() => navigate('/support/new')}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all shadow-lg shadow-rentr-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Ticket
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
            {tab.replace(/_/g, ' ')}
          </button>
        ))}
      </motion.div>

      {/* List */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={tickets}
          loading={loading}
          emptyMessage="No tickets found."
          onRowClick={(row) => navigate(`/support/${row.id}`)}
          exportFilename="rentr-tickets"
        />
      </div>

    </motion.div>
  );
}
