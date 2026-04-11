import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function KYCPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/kyc/stats').then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = statusFilter ? `?status=${statusFilter}` : '';
    api.get(`/kyc/${params}`)
      .then((data) => {
        const items = data.items || data || [];
        setRecords(items.map((k) => ({
          id: k.id,
          company: k.company_name || k.company || '-',
          customer_name: k.customer_name || '-',
          customer_email: k.customer_email || '-',
          account_type: k.account_type || '-',
          gstin: k.gstin || '-',
          status: k.status,
          credit_limit: k.credit_limit,
          submitted: k.created_at ? new Date(k.created_at).toLocaleDateString('en-IN') : '-',
        })));
      })
      .catch((err) => setError(err.message || 'Failed to fetch KYC records'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const accountTypeBadge = (type) => {
    if (type === 'channel_partner') return 'bg-purple-500/10 text-purple-400 border border-purple-500/15';
    if (type === 'direct_enterprise') return 'bg-blue-500/10 text-blue-400 border border-blue-500/15';
    return 'bg-foreground/[0.05] text-foreground/70';
  };

  const columns = [
    { key: 'company', label: 'Company' },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (v, row) => (
        <div>
          <span className="font-medium text-foreground">{v}</span>
          <span className="block text-xs text-foreground/40">{row.customer_email}</span>
        </div>
      ),
    },
    {
      key: 'account_type',
      label: 'Account Type',
      render: (v) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${accountTypeBadge(v)}`}>
          {v === 'channel_partner' ? 'Channel Partner' : v === 'direct_enterprise' ? 'Direct Enterprise' : v}
        </span>
      ),
    },
    { key: 'gstin', label: 'GSTIN' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'credit_limit',
      label: 'Credit Limit',
      render: (v) => v ? `₹${fmt(v)}` : '-',
    },
    { key: 'submitted', label: 'Submitted' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Verification Management</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            KYC
          </motion.h1>
        </div>

        <motion.div variants={item} className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 border border-foreground/[0.05] rounded-2xl overflow-hidden">
          {[
            { label: 'Pending', value: stats.pending || 0, icon: Clock },
            { label: 'Under Review', value: stats.under_review || 0, icon: Search },
            { label: 'Approved', value: stats.approved || 0, icon: CheckCircle },
            { label: 'Rejected', value: stats.rejected || 0, icon: XCircle },
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
          data={records}
          loading={loading}
          onRowClick={(row) => navigate(`/kyc/${row.id}`)}
          emptyMessage="No KYC submissions found."
          emptyIcon={<ShieldCheck size={40} className="text-foreground/10" />}
        />
      </div>

      {/* Footer */}
      {records.length > 0 && (
        <div className="flex items-center justify-between pt-8 border-t border-foreground/[0.05]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
            Showing {records.length} Records
          </p>
        </div>
      )}
    </motion.div>
  );
}
