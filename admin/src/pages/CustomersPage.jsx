import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, Search, ShieldCheck, CreditCard, ShoppingCart, HardDrive, Building2 } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [kycRecords, setKycRecords] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setLoading(true);
    const customerUrl = search ? `/customers/?search=${encodeURIComponent(search)}` : '/customers/';
    const partnerUrl = search ? `/partners/?search=${encodeURIComponent(search)}` : '/partners/';

    Promise.all([
      api.get(customerUrl).catch(() => ({ items: [] })),
      api.get(partnerUrl).catch(() => ({ items: [] })),
      api.get('/kyc/').catch(() => ({ items: [] })),
      api.get(`/distributors/?search=${search}`).catch(() => ({ items: [] })),
    ]).then(([custData, partData, kycData, distData]) => {
      setCustomers(custData.items || []);
      setPartners(partData.items || []);
      setKycRecords(kycData.items || kycData || []);
      setDistributors(distData.items || []);
    }).finally(() => setLoading(false));
  }, [search]);

  // Merge all into a single list keyed by email
  const merged = {};

  customers.forEach((c) => {
    const key = c.email;
    if (!merged[key]) merged[key] = { email: key };
    merged[key].name = c.name;
    merged[key].customer_type = c.customer_type;
    merged[key].total_orders = c.total_orders;
    merged[key].total_monthly_value = c.total_monthly_value;
    merged[key].first_order = c.first_order;
    merged[key].last_order = c.last_order;
  });

  partners.forEach((p) => {
    const key = p.email;
    if (!merged[key]) merged[key] = { email: key };
    merged[key].name = merged[key].name || p.name;
    merged[key].company_name = p.company_name;
    merged[key].tier = p.tier;
    merged[key].is_partner = true;
    merged[key].monthly_revenue = p.monthly_revenue;
    merged[key].outstanding = p.outstanding;
    merged[key].total_assets = p.total_assets;
    merged[key].kyc_status = p.kyc_status;
    merged[key].total_orders = merged[key].total_orders || p.total_orders;
  });

  kycRecords.forEach((k) => {
    const key = k.customer_email;
    if (!key) return;
    if (!merged[key]) merged[key] = { email: key };
    merged[key].kyc_id = k.id;
    merged[key].kyc_status = k.status;
    merged[key].company_name = merged[key].company_name || k.company_name || k.company;
    merged[key].account_type = k.account_type;
    merged[key].gstin = k.gstin;
    merged[key].credit_limit = k.credit_limit;
    merged[key].name = merged[key].name || k.customer_name;
  });

  const allCustomers = Object.values(merged);

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (v, row) => (
        <div>
          <div className="font-medium text-foreground">
            {row.company_name || v || row.email}
          </div>
          {row.company_name && v && v !== row.company_name && (
            <div className="text-[10px] text-foreground/30 mt-0.5">{v}</div>
          )}
          <div className="text-[10px] text-foreground/20 mt-0.5">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'customer_type',
      label: 'Type',
      render: (v, row) => (
        <div className="flex flex-wrap gap-1">
          {v && (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
              v === 'partner'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
            }`}>
              {v === 'partner' ? 'Partner' : 'Customer'}
            </span>
          )}
          {row.tier && (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
              row.tier === 'Platinum' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15' :
              row.tier === 'Gold' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15' :
              'bg-foreground/[0.05] text-foreground/40'
            }`}>
              {row.tier}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'kyc_status',
      label: 'KYC',
      render: (v, row) => v && row.kyc_id ? (
        <span
          className="cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigate(`/kyc/${row.kyc_id}`); }}
        >
          <StatusBadge status={v} />
        </span>
      ) : v ? <StatusBadge status={v} /> : <span className="text-foreground/15 text-[10px] uppercase tracking-widest">—</span>,
    },
    {
      key: 'total_orders',
      label: 'Orders',
      render: (v) => v || '0',
    },
    {
      key: 'credit_limit',
      label: 'Credit',
      render: (v) => v ? `₹${fmt(v)}` : '—',
    },
    {
      key: 'total_monthly_value',
      label: 'Revenue',
      render: (v, row) => {
        const val = v || row.monthly_revenue;
        return val ? `₹${fmt(val)}` : '—';
      },
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      render: (v) => v > 0 ? <span className="text-red-400 font-medium">₹{fmt(v)}</span> : '—',
    },
  ];

  // Stats
  const totalCustomers = allCustomers.length;
  const totalPartners = allCustomers.filter(c => c.is_partner).length;
  const kycApproved = allCustomers.filter(c => c.kyc_status === 'approved').length;
  const kycPending = allCustomers.filter(c => c.kyc_status === 'pending' || c.kyc_status === 'under_review').length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Customer Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Customers
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH CUSTOMERS"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-72 placeholder:text-foreground/10"
            />
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] overflow-hidden">
        {[
          { label: 'Total Customers', value: totalCustomers, icon: Users },
          { label: 'Partners', value: totalPartners, icon: Users },
          { label: 'KYC Approved', value: kycApproved, icon: ShieldCheck },
          { label: 'KYC Pending', value: kycPending, icon: ShieldCheck },
        ].map((s, i) => (
          <div key={s.label} className={`p-4 sm:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700 ${i < 3 ? 'border-r border-foreground/[0.05]' : ''}`}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">{s.label}</span>
              <s.icon className="w-4 h-4 text-foreground/10 group-hover:text-rentr-primary transition-colors" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">{s.value}</h3>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {[
          { key: 'all', label: 'All Customers' },
          { key: 'customers', label: 'Direct' },
          { key: 'partners', label: 'Partners' },
          { key: 'distributors', label: `Distributors (${distributors.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 sm:px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'bg-rentr-primary text-white'
                : 'text-foreground/20 hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {activeTab !== 'distributors' ? (
        <div className="border-t border-foreground/[0.05]">
          <DataTable
            columns={columns}
            data={activeTab === 'all' ? allCustomers : activeTab === 'partners' ? allCustomers.filter(c => c.is_partner || c.customer_type === 'partner') : allCustomers.filter(c => !c.is_partner && c.customer_type !== 'partner')}
            loading={loading}
            onRowClick={(row) => navigate(`/customers/${encodeURIComponent(row.email)}`)}
            emptyMessage="No customers yet."
            emptyIcon={<Users size={40} className="text-foreground/10" />}
            exportFilename="rentr-customers"
          />
        </div>
      ) : (
        <div className="border-t border-foreground/[0.05]">
          <DataTable
            columns={[
              { key: 'company_name', label: 'Company' },
              { key: 'name', label: 'Contact' },
              { key: 'email', label: 'Email' },
              { key: 'total_customers', label: 'Customers', render: (v) => v || 0 },
              { key: 'total_orders', label: 'Orders', render: (v) => v || 0 },
              { key: 'total_revenue', label: 'Revenue', render: (v) => `₹${fmt(v || 0)}` },
              { key: 'monthly_spread', label: 'Spread/mo', render: (v) => <span className="text-emerald-500 font-bold">₹{fmt(v || 0)}</span> },
              { key: 'credit_limit', label: 'Credit Limit', render: (v) => v ? `₹${fmt(v)}` : '-' },
              { key: 'is_active', label: 'Status', render: (v) => <StatusBadge status={v ? 'active' : 'cancelled'} /> },
            ]}
            data={distributors}
            loading={loading}
            onRowClick={(row) => navigate(`/distributors/${row.id}`)}
            emptyMessage="No distributors yet."
            emptyIcon={<Building2 size={40} className="text-foreground/10" />}
            exportFilename="rentr-distributors"
          />
        </div>
      )}

    </motion.div>
  );
}
