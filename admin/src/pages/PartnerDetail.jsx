import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Shield, CreditCard, ShoppingCart, HardDrive,
  FileText, ScrollText, RotateCcw, LifeBuoy, TrendingUp, Clock, CheckCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import DetailTabs from '../components/DetailTabs';

const tierStyles = {
  Silver: 'bg-foreground/[0.05] text-foreground/70',
  Gold: 'bg-yellow-500/10 text-yellow-400',
  Platinum: 'bg-purple-500/10 text-purple-400',
};

export default function PartnerDetail() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/partners/${encodeURIComponent(email)}`)
      .then(setData)
      .catch(() => navigate('/partners'))
      .finally(() => setLoading(false));
  }, [email, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { profile, kyc, tier, metrics } = data;
  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  // -- Column definitions ────────────────────────────────────────────────
  const orderColumns = [
    { key: 'order_number', label: 'Order #' },
    { key: 'total_monthly', label: 'Monthly', render: (v) => `\u20B9${fmt(v)}` },
    { key: 'rental_months', label: 'Tenure', render: (v) => `${v}mo` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
  ];

  const assetColumns = [
    { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-bold">{v}</span> },
    { key: 'oem', label: 'OEM / Model', render: (_, row) => [row.oem, row.model].filter(Boolean).join(' / ') || '-' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'condition_grade', label: 'Grade' },
    { key: 'monthly_rate', label: 'Monthly Rate', render: (v) => v ? `\u20B9${fmt(v)}` : '-' },
  ];

  const invoiceColumns = [
    { key: 'invoice_number', label: 'Invoice #' },
    { key: 'total', label: 'Amount', render: (v) => `\u20B9${fmt(v)}` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'due_date', label: 'Due Date', render: (v) => v || '-' },
  ];

  const contractColumns = [
    { key: 'contract_number', label: 'Contract #' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'start_date', label: 'Start', render: (v) => v || '-' },
    { key: 'end_date', label: 'End', render: (v) => v || '-' },
  ];

  const returnColumns = [
    { key: 'return_number', label: 'Return #' },
    { key: 'reason', label: 'Reason', render: (v) => v || '-' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
  ];

  const ticketColumns = [
    { key: 'ticket_number', label: 'Ticket #' },
    { key: 'subject', label: 'Subject' },
    { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
  ];

  const documents = kyc.documents || [];

  const perfStats = [
    { label: 'Total Revenue', value: `\u20B9${fmt(metrics.total_revenue)}` },
    { label: 'Monthly Recurring', value: `\u20B9${fmt(metrics.monthly_recurring)}` },
    { label: 'Outstanding', value: `\u20B9${fmt(metrics.outstanding)}` },
    { label: 'Avg Payment Days', value: metrics.avg_payment_days != null ? `${metrics.avg_payment_days} days` : '-' },
    { label: 'Total Orders', value: metrics.total_orders },
    { label: 'Deployed Assets', value: metrics.deployed_assets },
    { label: 'Active Contracts', value: data.contracts?.filter(c => c.status === 'active').length || 0 },
    { label: 'On-Time Payment', value: metrics.on_time_payment_rate != null ? `${metrics.on_time_payment_rate}%` : '-' },
  ];

  const ordersAssetsCount = (data.orders?.length || 0) + (data.assets?.length || 0);
  const billingCount = (data.invoices?.length || 0) + (data.contracts?.length || 0);
  const supportCount = (data.returns?.length || 0) + (data.tickets?.length || 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/partners')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Partners
        </button>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${tierStyles[tier] || tierStyles.Silver}`}>
            {tier}
          </span>
          <StatusBadge status={kyc.status} />
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              Partner
            </span>
            <span className="text-[10px] font-mono text-foreground/20">{profile.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            {profile.company_name || profile.name}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <DetailTabs tabs={[
        {
          key: 'overview',
          label: 'Overview',
          content: (
            <>
              {/* Profile Card */}
              <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
                  <Building2 size={18} className="text-foreground/40" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Profile</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Company</div>
                    <div className="font-medium text-foreground">{profile.company_name || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Contact Name</div>
                    <div className="font-medium text-foreground">{profile.name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Email</div>
                    <div className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(profile.email)}`)}>{profile.email}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">GSTIN</div>
                    <div className="font-medium text-foreground">{profile.gstin || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">PAN</div>
                    <div className="font-medium text-foreground">{profile.pan || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Account Type</div>
                    <div className="font-medium text-foreground capitalize">{(profile.account_type || '').replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Credit Limit</div>
                    <div className="font-medium text-foreground">{`\u20B9${fmt(kyc.credit_limit)}`}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Credit Used</div>
                    <div className="font-medium text-foreground">{`\u20B9${fmt(kyc.credit_used)}`}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Credit Available</div>
                    <div className="font-medium text-green-600">{`\u20B9${fmt(kyc.credit_available)}`}</div>
                  </div>
                </div>
              </div>

              {/* Performance Dashboard */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Performance</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] overflow-hidden">
                  {perfStats.map((s, i) => (
                    <div key={s.label} className={`p-4 sm:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700 ${i < perfStats.length - 1 ? 'border-r border-foreground/[0.05]' : ''} ${i >= 4 ? 'border-t border-foreground/[0.05]' : ''}`}>
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20">{s.label}</span>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">{s.value}</h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* KYC Documents */}
              {documents.length > 0 && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
                    <Shield size={18} className="text-foreground/40" />
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">KYC Documents</h2>
                  </div>
                  <div className="space-y-2">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between py-6 px-4 bg-foreground/[0.02] rounded-2xl text-sm hover:bg-foreground/[0.01] transition-colors">
                        <div>
                          <span className="font-medium text-foreground">{doc.type || 'Document'}</span>
                          <span className="ml-2 text-foreground/40">{doc.filename || ''}</span>
                        </div>
                        {doc.status && <StatusBadge status={doc.status} />}
                      </div>
                    ))}
                  </div>
                  {(kyc.reviewer || kyc.review_notes || kyc.reviewed_at) && (
                    <div className="mt-4 pt-4 border-t border-foreground/[0.05] text-sm text-foreground/60 space-y-1">
                      {kyc.reviewer && <div>Reviewed by: <span className="font-medium text-foreground">{kyc.reviewer}</span></div>}
                      {kyc.review_notes && <div>Notes: {kyc.review_notes}</div>}
                      {kyc.reviewed_at && <div>Reviewed: {new Date(kyc.reviewed_at).toLocaleDateString('en-IN')}</div>}
                    </div>
                  )}
                </div>
              )}
            </>
          ),
        },
        {
          key: 'orders-assets',
          label: 'Orders & Assets',
          count: ordersAssetsCount,
          content: (
            <>
              {/* Orders */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Orders</h2>
                <div className="border-t border-foreground/[0.05]">
                  <DataTable
                    columns={orderColumns}
                    data={data.orders || []}
                    loading={false}
                    onRowClick={(row) => navigate(`/orders/${row.id}`)}
                    emptyMessage="No orders."
                  />
                </div>
              </div>

              {/* Assets */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Assets</h2>
                <div className="border-t border-foreground/[0.05]">
                  <DataTable
                    columns={assetColumns}
                    data={data.assets || []}
                    loading={false}
                    onRowClick={(row) => navigate(`/assets/${row.id}`)}
                    emptyMessage="No assets."
                  />
                </div>
              </div>
            </>
          ),
        },
        {
          key: 'billing',
          label: 'Billing',
          count: billingCount,
          content: (
            <>
              {/* Invoices */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Invoices</h2>
                <div className="border-t border-foreground/[0.05]">
                  <DataTable
                    columns={invoiceColumns}
                    data={data.invoices || []}
                    loading={false}
                    onRowClick={(row) => navigate(`/invoices/${row.id}`)}
                    emptyMessage="No invoices."
                  />
                </div>
              </div>

              {/* Contracts */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Contracts</h2>
                <div className="border-t border-foreground/[0.05]">
                  <DataTable
                    columns={contractColumns}
                    data={data.contracts || []}
                    loading={false}
                    onRowClick={(row) => navigate(`/contracts/${row.id}`)}
                    emptyMessage="No contracts."
                  />
                </div>
              </div>
            </>
          ),
        },
        {
          key: 'support',
          label: 'Support',
          count: supportCount,
          content: (
            <>
              {/* Returns */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Returns</h2>
                <div className="border-t border-foreground/[0.05]">
                  <DataTable
                    columns={returnColumns}
                    data={data.returns || []}
                    loading={false}
                    onRowClick={(row) => navigate(`/returns/${row.id}`)}
                    emptyMessage="No returns."
                  />
                </div>
              </div>

              {/* Support Tickets */}
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Support Tickets</h2>
                <div className="border-t border-foreground/[0.05]">
                  <DataTable
                    columns={ticketColumns}
                    data={data.tickets || []}
                    loading={false}
                    onRowClick={(row) => navigate(`/support/${row.id}`)}
                    emptyMessage="No tickets."
                  />
                </div>
              </div>
            </>
          ),
        },
      ]} />
    </motion.div>
  );
}
