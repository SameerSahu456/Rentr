import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    api.get(`/orders/${params}`)
      .then((data) => {
        const mapped = (data.items || []).map((o) => ({
          id: o.id,
          number: `#${o.order_number}`,
          source: o.source || 'website',
          customer: o.customer_name || o.customer_email,
          customerEmail: o.customer_email,
          customerType: o.customer_type || 'customer',
          items: o.items?.map((l) => `${l.product_name} x${l.quantity}`).join(', ') || '-',
          total: `₹${o.total_monthly?.toLocaleString('en-IN') || 0}/mo`,
          rentalMonths: o.rental_months,
          status: o.status,
          date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '-',
        }));
        setOrders(mapped);
      })
      .catch((err) => setError(err.message || 'Failed to fetch orders'))
      .finally(() => setLoading(false));
  }, [search]);

  const columns = [
    { key: 'number', label: 'Order #' },
    {
      key: 'source',
      label: 'Source',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
          v === 'crm'
            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
        }`}>{v === 'crm' ? 'CRM' : 'Website'}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <span
            className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors"
            onClick={(e) => { e.stopPropagation(); navigate(`/customers/${encodeURIComponent(row.customerEmail)}`); }}
          >{v}</span>
          <span className="px-2 py-0.5 rounded-md bg-foreground/[0.03] border border-foreground/[0.05] text-[9px] font-bold uppercase tracking-wider text-foreground/40">
            {row.customerType === 'partner' ? 'Partner' : 'Customer'}
          </span>
        </div>
      ),
    },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total' },
    {
      key: 'rentalMonths',
      label: 'Tenure',
      render: (v) => v ? `${v} months` : '-',
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'date', label: 'Date' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Order Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Orders
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH ORDERS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
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
          data={orders}
          loading={loading}
          onRowClick={(row) => navigate(`/orders/${row.id}`)}
          emptyMessage="No Rentr orders yet. Orders placed on rentr-india.vercel.app will appear here."
          emptyIcon={<ShoppingCart size={40} className="text-foreground/10" />}
          exportFilename="rentr-orders"
        />
      </div>

    </motion.div>
  );
}
