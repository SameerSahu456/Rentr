import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Shield, CreditCard, ShoppingCart, HardDrive,
  FileText, ScrollText, RotateCcw, LifeBuoy,
} from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

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
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get(`/partners/${encodeURIComponent(email)}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;

  if (!data) return (
    <div className="text-center py-20">
      <p className="text-foreground/30 text-sm mb-4">Partner not found</p>
      <button onClick={() => navigate('/partners')} className="text-rentr-primary text-sm hover:underline">Back to Partners</button>
    </div>
  );

  const { profile, kyc, tier, metrics } = data;
  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

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

  const ordersAssetsCount = (data.orders?.length || 0) + (data.assets?.length || 0);
  const billingCount = (data.invoices?.length || 0) + (data.contracts?.length || 0);
  const supportCount = (data.returns?.length || 0) + (data.tickets?.length || 0);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders-assets', label: `Orders & Assets (${ordersAssetsCount})` },
    { key: 'billing', label: `Billing (${billingCount})` },
    { key: 'support', label: `Support (${supportCount})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/partners')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Partners
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-foreground/30">{profile.email}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${tierStyles[tier] || tierStyles.Silver}`}>{tier}</span>
            </div>
            <h1 className="text-2xl font-brand font-bold text-foreground">{profile.company_name || profile.name}</h1>
            {profile.name && profile.company_name && <p className="text-foreground/30 text-sm">{profile.name}</p>}
          </div>
          <StatusBadge status={kyc.status} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Revenue</p>
            <p className="text-lg font-bold">₹{fmt(metrics.total_revenue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Monthly Recurring</p>
            <p className="text-lg font-bold">₹{fmt(metrics.monthly_recurring)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Outstanding</p>
            <p className="text-lg font-bold text-amber-500">₹{fmt(metrics.outstanding)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Limit</p>
            <p className="text-sm font-bold">₹{fmt(kyc.credit_limit)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Available</p>
            <p className="text-sm font-bold text-emerald-500">₹{fmt(kyc.credit_available)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Deployed Assets</p>
            <p className="text-lg font-bold">{metrics.deployed_assets || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-foreground/[0.05] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${tab === t.key ? 'border-rentr-primary text-rentr-primary' : 'border-transparent text-foreground/25 hover:text-foreground/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-foreground/[0.05]">
              <Building2 size={16} className="text-foreground/40" />
              <h2 className="text-sm font-bold text-foreground">Profile</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Company</p>
                <p className="font-bold">{profile.company_name || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Contact Name</p>
                <p className="font-bold">{profile.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Email</p>
                <p className="font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/customers/${encodeURIComponent(profile.email)}`)}>{profile.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">GSTIN</p>
                <p className="font-bold">{profile.gstin || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">PAN</p>
                <p className="font-bold">{profile.pan || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Account Type</p>
                <p className="font-bold capitalize">{(profile.account_type || '').replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Limit</p>
                <p className="font-bold">₹{fmt(kyc.credit_limit)}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Used</p>
                <p className="font-bold">₹{fmt(kyc.credit_used)}</p>
              </div>
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Available</p>
                <p className="font-bold text-emerald-500">₹{fmt(kyc.credit_available)}</p>
              </div>
            </div>
          </div>

          {/* Performance Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${fmt(metrics.total_revenue)}` },
              { label: 'Monthly Recurring', value: `₹${fmt(metrics.monthly_recurring)}` },
              { label: 'Outstanding', value: `₹${fmt(metrics.outstanding)}` },
              { label: 'Avg Payment Days', value: metrics.avg_payment_days != null ? `${metrics.avg_payment_days} days` : '-' },
              { label: 'Total Orders', value: metrics.total_orders },
              { label: 'Deployed Assets', value: metrics.deployed_assets },
              { label: 'Active Contracts', value: data.contracts?.filter(c => c.status === 'active').length || 0 },
              { label: 'On-Time Payment', value: metrics.on_time_payment_rate != null ? `${metrics.on_time_payment_rate}%` : '-' },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-5">
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          {/* KYC Documents */}
          {documents.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 flex items-center gap-2 border-b border-foreground/[0.03]">
                <Shield size={16} className="text-foreground/40" />
                <h2 className="text-sm font-bold text-foreground">KYC Documents</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {documents.map((doc, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{doc.type || 'Document'}</p>
                      <p className="text-xs text-foreground/30">{doc.filename || ''}</p>
                    </div>
                    {doc.status && <StatusBadge status={doc.status} />}
                  </div>
                ))}
              </div>
              {(kyc.reviewer || kyc.review_notes || kyc.reviewed_at) && (
                <div className="px-6 py-4 border-t border-foreground/[0.05] text-sm text-foreground/60 space-y-1">
                  {kyc.reviewer && <div>Reviewed by: <span className="font-bold text-foreground">{kyc.reviewer}</span></div>}
                  {kyc.review_notes && <div>Notes: {kyc.review_notes}</div>}
                  {kyc.reviewed_at && <div>Reviewed: {new Date(kyc.reviewed_at).toLocaleDateString('en-IN')}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'orders-assets' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.03]">
              <h2 className="text-sm font-bold text-foreground">Orders</h2>
            </div>
            <DataTable
              columns={orderColumns}
              data={data.orders || []}
              loading={false}
              onRowClick={(row) => navigate(`/orders/${row.id}`)}
              emptyMessage="No orders."
            />
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.03]">
              <h2 className="text-sm font-bold text-foreground">Assets</h2>
            </div>
            <DataTable
              columns={assetColumns}
              data={data.assets || []}
              loading={false}
              onRowClick={(row) => navigate(`/assets/${row.id}`)}
              emptyMessage="No assets."
            />
          </div>
        </div>
      )}

      {tab === 'billing' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.03]">
              <h2 className="text-sm font-bold text-foreground">Invoices</h2>
            </div>
            <DataTable
              columns={invoiceColumns}
              data={data.invoices || []}
              loading={false}
              onRowClick={(row) => navigate(`/invoices/${row.id}`)}
              emptyMessage="No invoices."
            />
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.03]">
              <h2 className="text-sm font-bold text-foreground">Contracts</h2>
            </div>
            <DataTable
              columns={contractColumns}
              data={data.contracts || []}
              loading={false}
              onRowClick={(row) => navigate(`/contracts/${row.id}`)}
              emptyMessage="No contracts."
            />
          </div>
        </div>
      )}

      {tab === 'support' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.03]">
              <h2 className="text-sm font-bold text-foreground">Returns</h2>
            </div>
            <DataTable
              columns={returnColumns}
              data={data.returns || []}
              loading={false}
              onRowClick={(row) => navigate(`/returns/${row.id}`)}
              emptyMessage="No returns."
            />
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.03]">
              <h2 className="text-sm font-bold text-foreground">Support Tickets</h2>
            </div>
            <DataTable
              columns={ticketColumns}
              data={data.tickets || []}
              loading={false}
              onRowClick={(row) => navigate(`/support/${row.id}`)}
              emptyMessage="No tickets."
            />
          </div>
        </div>
      )}
    </div>
  );
}
