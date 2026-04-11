import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { DollarSign, RefreshCw, Clock, AlertTriangle, ArrowRight, Zap, TrendingUp } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] } },
};

const formatCurrency = (val) => {
  const num = Number(val || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
  return `₹${num.toLocaleString('en-IN')}`;
};

const formatDate = (val) => {
  if (!val) return '-';
  return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (val) => {
  if (!val) return '-';
  return new Date(val).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function BillingPage() {
  const [stats, setStats] = useState(null);
  const [billingRuns, setBillingRuns] = useState([]);
  const [tallyStatus, setTallyStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningBilling, setRunningBilling] = useState(false);
  const [syncingTally, setSyncingTally] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [dashData, runsData, tallyData] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/billing/runs'),
          api.get('/billing/tally-status'),
        ]);

        if (dashData.status === 'fulfilled') {
          setStats(dashData.value.stats || dashData.value);
        }
        if (runsData.status === 'fulfilled') {
          const runs = runsData.value;
          setBillingRuns(Array.isArray(runs) ? runs : runs.items || runs.results || []);
        }
        if (tallyData.status === 'fulfilled') {
          setTallyStatus(tallyData.value);
        }
      } catch {
        // graceful fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRunBilling = async () => {
    setRunningBilling(true);
    try {
      await api.post('/billing/runs');
      const runsData = await api.get('/billing/runs');
      setBillingRuns(Array.isArray(runsData) ? runsData : runsData.items || runsData.results || []);
    } catch {
      // handle error silently
    } finally {
      setRunningBilling(false);
    }
  };

  const handleSyncTally = async () => {
    setSyncingTally(true);
    try {
      await api.post('/billing/tally-sync');
      const tallyData = await api.get('/billing/tally-status');
      setTallyStatus(tallyData);
    } catch {
      // handle error silently
    } finally {
      setSyncingTally(false);
    }
  };

  // Receivables aging buckets
  const agingBuckets = [
    { label: '0-30 days', key: 'aging_0_30', color: 'bg-emerald-500' },
    { label: '31-60 days', key: 'aging_31_60', color: 'bg-amber-500' },
    { label: '61-90 days', key: 'aging_61_90', color: 'bg-orange-500' },
    { label: '90+ days', key: 'aging_90_plus', color: 'bg-red-500' },
  ];

  const agingValues = agingBuckets.map((b) => ({
    ...b,
    amount: Number(stats?.[b.key] || 0),
  }));
  const maxAging = Math.max(...agingValues.map((b) => b.amount), 1);

  // Upcoming billings from stats
  const upcomingBillings = stats?.upcoming_billings || [];

  const upcomingColumns = [
    { key: 'contract_number', label: 'Contract', render: (v) => v || '-' },
    { key: 'customer_name', label: 'Customer', render: (v) => v || '-' },
    { key: 'next_billing_date', label: 'Next Billing', render: (v) => formatDate(v) },
    { key: 'monthly_rent', label: 'Amount', render: (v) => formatCurrency(v) },
    {
      key: 'pro_rata',
      label: 'Pro-rata',
      render: (v) => v ? (
        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Pro-rata</span>
      ) : (
        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Full</span>
      ),
    },
  ];

  const billingRunColumns = [
    { key: 'run_date', label: 'Date', render: (v) => formatDateTime(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'invoices_generated', label: 'Invoices', render: (v) => v ?? '-' },
    { key: 'total_amount', label: 'Total', render: (v) => v != null ? formatCurrency(v) : '-' },
  ];

  const statCards = [
    {
      label: 'Monthly Recurring Revenue',
      value: loading ? '...' : formatCurrency(stats?.mrr || stats?.total_revenue || 0),
      icon: TrendingUp,
    },
    {
      label: 'Outstanding Amount',
      value: loading ? '...' : formatCurrency(stats?.outstanding_amount || 0),
      icon: DollarSign,
    },
    {
      label: 'Overdue Invoices',
      value: loading ? '...' : (stats?.overdue_count ?? 0),
      icon: AlertTriangle,
      alert: (stats?.overdue_count ?? 0) > 0,
    },
    {
      label: 'Next Billing Run',
      value: loading ? '...' : (stats?.next_billing_run ? formatDate(stats.next_billing_run) : 'Not scheduled'),
      icon: Clock,
    },
  ];

  const tallySyncStatus = tallyStatus?.sync_status || 'unknown';
  const tallySyncColor = tallySyncStatus === 'synced'
    ? 'text-emerald-500'
    : tallySyncStatus === 'error'
      ? 'text-red-500'
      : 'text-amber-500';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-0 -m-4 lg:-m-6 xl:-m-8">
      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 lg:pt-12 pb-8 sm:pb-12 border-b border-foreground/[0.05]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div variants={item} className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-rentr-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Billing Engine</span>
            </motion.div>
            <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
              Billing
            </motion.h1>
          </div>
          <motion.div variants={item} className="flex items-center gap-3">
            <button
              onClick={handleRunBilling}
              disabled={runningBilling}
              className="group flex items-center gap-3 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className={`w-3 h-3 ${runningBilling ? 'animate-spin' : ''}`} />
              {runningBilling ? 'Running...' : 'Run Billing Now'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-foreground/[0.05]">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={item}
            className={`p-4 sm:p-6 lg:p-12 flex flex-col gap-3 sm:gap-4 lg:gap-8 group hover:bg-foreground/[0.02] transition-colors duration-700 ${
              i < 3 ? 'border-r border-foreground/[0.05]' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">{stat.label}</span>
              <stat.icon className={`w-4 h-4 transition-colors ${stat.alert ? 'text-amber-500' : 'text-foreground/10 group-hover:text-rentr-primary'}`} />
            </div>
            <h3 className={`text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter transition-colors duration-500 ${
              stat.alert ? 'text-amber-500' : 'text-foreground group-hover:text-rentr-primary'
            }`}>
              {stat.value}
            </h3>
          </motion.div>
        ))}
      </section>

      {/* Billing Runs & Tally Sync */}
      <section className="grid grid-cols-1 lg:grid-cols-3 border-b border-foreground/[0.05]">
        {/* Billing Runs */}
        <div className="lg:col-span-2 border-r border-foreground/[0.05] p-4 sm:p-6 lg:p-12">
          <motion.div variants={item} className="flex items-center justify-between mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Billing Runs</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">{billingRuns.length} runs</span>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : billingRuns.length === 0 ? (
            <motion.div variants={item} className="py-12 text-center">
              <Zap size={32} className="mx-auto mb-3 text-foreground/[0.06]" />
              <p className="text-xs text-foreground/20 font-serif italic">No billing runs yet. Click &quot;Run Billing Now&quot; to generate invoices.</p>
            </motion.div>
          ) : (
            <div className="border-t border-foreground/[0.05]">
              <DataTable
                columns={billingRunColumns}
                data={billingRuns}
                loading={false}
                emptyMessage="No billing runs found."
              />
            </div>
          )}
        </div>

        {/* Tally Sync Status */}
        <div className="p-4 sm:p-6 lg:p-12">
          <motion.div variants={item} className="flex items-center justify-between mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Tally Sync</h2>
            <RefreshCw className="w-4 h-4 text-foreground/10" />
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 skeleton rounded-xl" />
              ))}
            </div>
          ) : !tallyStatus ? (
            <motion.div variants={item} className="py-12 text-center">
              <RefreshCw size={28} className="mx-auto mb-3 text-foreground/[0.06]" />
              <p className="text-xs text-foreground/20 font-serif italic">Tally integration not configured.</p>
            </motion.div>
          ) : (
            <motion.div variants={item} className="space-y-8">
              {/* Sync Status */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20">Status</span>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    tallySyncStatus === 'synced' ? 'bg-emerald-500' : tallySyncStatus === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <span className={`text-sm font-bold uppercase tracking-wide ${tallySyncColor}`}>
                    {tallySyncStatus}
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20">Last Synced</span>
                <p className="text-sm font-bold text-foreground">{formatDateTime(tallyStatus.last_sync_time)}</p>
              </div>

              {/* Pending Pushes */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20">Pending Pushes</span>
                <p className={`text-3xl font-brand font-black tracking-tighter ${
                  (tallyStatus.pending_count || 0) > 0 ? 'text-amber-500' : 'text-foreground'
                }`}>
                  {tallyStatus.pending_count ?? 0}
                </p>
              </div>

              {/* Sync Now Button */}
              <button
                onClick={handleSyncTally}
                disabled={syncingTally}
                className="w-full group flex items-center justify-center gap-3 px-6 py-3 rounded-full border border-foreground/[0.05] hover:border-rentr-primary/20 hover:bg-rentr-primary/5 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3 h-3 ${syncingTally ? 'animate-spin' : ''}`} />
                {syncingTally ? 'Syncing...' : 'Sync Now'}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Receivables by Aging */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-foreground/[0.05]">
        <motion.div variants={item} className="p-4 sm:p-6 lg:p-12 border-r border-foreground/[0.05]">
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Receivables Aging</h2>
            <DollarSign className="w-4 h-4 text-foreground/10" />
          </div>

          <div className="space-y-6 lg:space-y-8">
            {agingValues.map((bucket) => (
              <div key={bucket.label} className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-foreground/20">{bucket.label}</span>
                  <span className="text-foreground">{formatCurrency(bucket.amount)}</span>
                </div>
                <div className="h-[2px] w-full bg-foreground/[0.05] relative rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((bucket.amount / maxAging) * 100, 100)}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    className={`absolute inset-y-0 left-0 ${bucket.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total Outstanding */}
          <div className="mt-8 lg:mt-12 pt-6 border-t border-foreground/[0.05]">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20">Total Outstanding</span>
              <span className="text-2xl lg:text-3xl font-brand font-black tracking-tighter text-foreground">
                {formatCurrency(agingValues.reduce((sum, b) => sum + b.amount, 0))}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Pro-rata Info Card */}
        <motion.div variants={item} className="p-4 sm:p-6 lg:p-12">
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Pro-rata Billing</h2>
            <Clock className="w-4 h-4 text-foreground/10" />
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.05]">
              <p className="text-xs text-foreground/40 leading-relaxed font-serif italic mb-6">
                Pro-rata calculations are automatically applied for mid-cycle contract starts and modifications. The billing engine computes daily rates based on monthly rent and applies them proportionally.
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Calculation Method', value: 'Daily pro-rata (monthly / 30)' },
                  { label: 'Applied On', value: 'First & last billing cycles' },
                  { label: 'Rounding', value: 'Nearest rupee' },
                ].map((info) => (
                  <div key={info.label} className="flex justify-between items-center py-2 border-b border-foreground/[0.03] last:border-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">{info.label}</span>
                    <span className="text-xs font-bold text-foreground/60">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro-rata stats from billing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.05]">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/15 block mb-2">Pro-rata Invoices</span>
                <span className="text-2xl font-brand font-black tracking-tighter text-foreground">{stats?.pro_rata_count ?? 0}</span>
              </div>
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.05]">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/15 block mb-2">Pro-rata Amount</span>
                <span className="text-2xl font-brand font-black tracking-tighter text-foreground">{formatCurrency(stats?.pro_rata_amount || 0)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Upcoming Billings */}
      <section className="p-4 sm:p-6 lg:p-12">
        <motion.div variants={item} className="flex items-center justify-between mb-8 lg:mb-12">
          <div>
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Upcoming Billings</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 mt-2">Next 7 days</p>
          </div>
          <button
            onClick={() => navigate('/contracts')}
            className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors flex items-center gap-2"
          >
            View Contracts
            <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : upcomingBillings.length === 0 ? (
          <motion.div variants={item} className="py-12 text-center border-t border-foreground/[0.05]">
            <Clock size={32} className="mx-auto mb-3 text-foreground/[0.06]" />
            <p className="text-xs text-foreground/20 font-serif italic">No upcoming billings in the next 7 days.</p>
          </motion.div>
        ) : (
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={upcomingColumns}
              data={upcomingBillings}
              loading={false}
              onRowClick={(row) => row.contract_id && navigate(`/contracts/${row.contract_id}`)}
              emptyMessage="No upcoming billings."
            />
          </div>
        )}
      </section>
    </motion.div>
  );
}
