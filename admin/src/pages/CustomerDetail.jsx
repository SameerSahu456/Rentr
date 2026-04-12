import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, FileText, ScrollText, Mail, CreditCard, HardDrive, RotateCcw, LifeBuoy, ShieldCheck, Building2, TrendingUp, Clock, CheckCircle, XCircle, Upload, Trash2, Eye, Download } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import DetailTabs from '../components/DetailTabs';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function CustomerDetail() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [partner, setPartner] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('PAN Card');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/customers/${encodeURIComponent(email)}`).catch(() => null),
      api.get(`/partners/${encodeURIComponent(email)}`).catch(() => null),
    ]).then(([custData, partData]) => {
      setCustomer(custData);
      if (partData) {
        setPartner(partData);
        setKyc(partData.kyc || null);
      }
      // If no partner data, try to find KYC by email
      if (!partData) {
        api.get('/kyc/').then((kycData) => {
          const items = kycData.items || kycData || [];
          const match = items.find(k => k.customer_email === email);
          if (match) setKyc(match);
        }).catch(() => {});
      }
    }).catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, [email]);

  const handleApprove = async () => {
    if (!kyc) return;
    setSubmitting(true);
    try {
      const updated = await api.put(`/kyc/${kyc.id}`, { status: 'approved', credit_limit: Number(creditLimit), review_notes: reviewNotes });
      setKyc(updated);
      setApproveModal(false);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!kyc) return;
    setSubmitting(true);
    try {
      const updated = await api.put(`/kyc/${kyc.id}`, { status: 'rejected', rejection_reason: rejectionReason });
      setKyc(updated);
      setRejectModal(false);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const ensureKyc = async () => {
    if (kyc) return kyc;
    const created = await api.post('/kyc/by-email', {
      customer_email: email,
      customer_name: name || email,
      company_name: companyName || '',
    });
    setKyc(created);
    return created;
  };

  const handleUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const kycRecord = await ensureKyc();
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append('files', f));
      const updated = await api.upload(`/kyc/${kycRecord.id}/documents?document_type=${encodeURIComponent(docType)}`, formData);
      setKyc(updated);
    } catch (e) {
      console.error('Upload failed:', e);
    }
    setUploading(false);
  };

  const handleDocStatus = async (index, status) => {
    if (!kyc) return;
    try {
      const updated = await api.put(`/kyc/${kyc.id}/documents/${index}`, { status });
      setKyc(updated);
    } catch (e) {
      console.error('Failed to update doc status:', e);
    }
  };

  const handleDeleteDoc = async (index) => {
    if (!kyc) return;
    try {
      const updated = await api.delete(`/kyc/${kyc.id}/documents/${index}`);
      setKyc(updated);
    } catch (e) {
      console.error('Failed to delete document:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer && !partner) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-foreground/40 text-sm">Customer not found or no orders exist for this email.</p>
      <button onClick={() => navigate('/customers')} className="px-6 py-3 rounded-full bg-foreground/[0.05] text-foreground/60 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-all">Back to Customers</button>
    </div>
  );

  const profile = partner?.profile || {};
  const metrics = partner?.metrics || {};
  const tier = partner?.tier;
  const name = customer?.name || profile.name || email;
  const companyName = profile.company_name || kyc?.company_name || kyc?.company;
  const isPendingKyc = kyc && (kyc.status === 'pending' || kyc.status === 'under_review');
  const documents = kyc?.documents || [];

  const orders = customer?.orders || partner?.orders || [];
  const assets = customer?.assets || partner?.assets || [];
  const invoices = customer?.invoices || partner?.invoices || [];
  const contracts = customer?.contracts || partner?.contracts || [];
  const returns = customer?.returns || partner?.returns || [];
  const tickets = customer?.tickets || partner?.tickets || [];

  const ordersAssetsCount = orders.length + assets.length;
  const billingCount = invoices.length + contracts.length;
  const supportCount = returns.length + tickets.length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/customers')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Customers
        </button>
        <div className="flex items-center gap-2">
          {customer?.customer_type && (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
              customer.customer_type === 'partner'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
            }`}>
              {customer.customer_type === 'partner' ? 'Partner' : 'Customer'}
            </span>
          )}
          {tier && (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
              tier === 'Platinum' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15' :
              tier === 'Gold' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15' :
              'bg-foreground/[0.05] text-foreground/40'
            }`}>
              {tier}
            </span>
          )}
          {kyc && <StatusBadge status={kyc.status} />}
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              {partner ? 'Partner' : 'Customer'}
            </span>
            <span className="text-[10px] font-mono text-foreground/20">{email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            {companyName || name}
          </h1>
          {companyName && name !== companyName && (
            <p className="text-sm text-foreground/40 flex items-center gap-1 mt-2">
              <Mail size={14} /> {name} • {email}
            </p>
          )}
          {!companyName && (
            <p className="text-sm text-foreground/40 flex items-center gap-1 mt-2">
              <Mail size={14} /> {email}
            </p>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] overflow-hidden">
        {[
          { label: 'Orders', value: customer?.total_orders || metrics.total_orders || 0 },
          { label: 'Revenue', value: `₹${fmt(customer?.total_monthly_value || metrics.total_revenue || 0)}` },
          { label: 'Credit Limit', value: kyc?.credit_limit ? `₹${fmt(kyc.credit_limit)}` : '—' },
          { label: 'Outstanding', value: partner ? `₹${fmt(metrics.outstanding || 0)}` : `₹${fmt(customer?.total_paid || 0)}` },
        ].map((s, i) => (
          <div key={s.label} className={`p-4 sm:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700 ${i < 3 ? 'border-r border-foreground/[0.05]' : ''}`}>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20">{s.label}</span>
            <h3 className="text-3xl lg:text-4xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabbed Content */}
      <DetailTabs tabs={[
        {
          key: 'profile',
          label: 'Profile & KYC',
          content: (
            <>
              {/* Company Profile (if partner/KYC data exists) */}
              {(kyc || partner) && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6 flex items-center gap-3">
                    <Building2 size={20} className="text-rentr-primary" />
                    Company Profile & KYC
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
                    {companyName && <InfoItem label="Company" value={companyName} />}
                    <InfoItem label="Contact" value={name} />
                    <InfoItem label="Email" value={email} />
                    {(profile.account_type || kyc?.account_type) && (
                      <InfoItem label="Account Type" value={(profile.account_type || kyc?.account_type || '').replace(/_/g, ' ')} />
                    )}
                    {(profile.gstin || kyc?.gstin) && <InfoItem label="GSTIN" value={profile.gstin || kyc?.gstin || '—'} />}
                    {(profile.pan || kyc?.pan) && <InfoItem label="PAN" value={profile.pan || kyc?.pan || '—'} />}
                    {kyc?.credit_limit != null && <InfoItem label="Credit Limit" value={`₹${fmt(kyc.credit_limit)}`} />}
                    {kyc?.credit_used != null && <InfoItem label="Credit Used" value={`₹${fmt(kyc.credit_used)}`} />}
                    {kyc && <InfoItem label="Credit Available" value={`₹${fmt((kyc.credit_limit || 0) - (kyc.credit_used || 0))}`} highlight />}
                  </div>

                  {/* KYC Review Actions */}
                  {isPendingKyc && (
                    <div className="mt-8 pt-6 border-t border-foreground/[0.05] flex gap-3">
                      <button
                        onClick={() => setApproveModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
                      >
                        <CheckCircle size={16} /> Approve KYC
                      </button>
                      <button
                        onClick={() => setRejectModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-red-400 hover:border-red-500/20 transition-all duration-500"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}

                  {/* Review info (if already reviewed) */}
                  {kyc && !isPendingKyc && (kyc.reviewer || kyc.review_notes || kyc.rejection_reason) && (
                    <div className="mt-6 pt-6 border-t border-foreground/[0.05] grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      {kyc.reviewer && <InfoItem label="Reviewed By" value={kyc.reviewer} />}
                      {kyc.reviewed_at && <InfoItem label="Reviewed At" value={new Date(kyc.reviewed_at).toLocaleDateString('en-IN')} />}
                      {kyc.review_notes && <InfoItem label="Notes" value={kyc.review_notes} />}
                      {kyc.rejection_reason && <InfoItem label="Rejection Reason" value={kyc.rejection_reason} highlight />}
                    </div>
                  )}
                </div>
              )}

              {/* KYC Documents & Upload */}
              <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-rentr-primary" />
                  Documents (KYC / KYP)
                </h2>

                {/* Upload Section */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Document Type</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all"
                      >
                        {['PAN Card', 'Aadhaar Card', 'GST Certificate', 'Company PAN', 'Certificate of Incorporation', 'Bank Statement', 'Address Proof', 'Identity Proof', 'Passport', 'Utility Bill', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-rentr-primary hover:text-white transition-all duration-500">
                      <Upload size={14} />
                      {uploading ? 'Uploading...' : 'Upload Files'}
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handleUpload(e.target.files)}
                      />
                    </label>
                  </div>

                  {/* Drag & Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 ${
                      dragOver
                        ? 'border-rentr-primary bg-rentr-primary/5 text-rentr-primary'
                        : 'border-foreground/[0.08] text-foreground/20'
                    }`}
                  >
                    <Upload size={24} className="mx-auto mb-2 opacity-40" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      Drag & drop files here
                    </p>
                  </div>
                </div>

                {/* Document List */}
                {documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between py-4 px-4 bg-foreground/[0.01] rounded-2xl border border-foreground/[0.04] group">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-foreground/20" />
                          <div>
                            <span className="text-sm font-medium text-foreground">{doc.type || doc.document_type || 'Document'}</span>
                            <span className="block text-[10px] text-foreground/30">{doc.filename || doc.file_name || '—'}</span>
                            {doc.note && <span className="block text-[10px] text-foreground/30 italic mt-0.5">{doc.note}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status && <StatusBadge status={doc.status} />}
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-foreground/[0.05] text-foreground/30 hover:text-foreground transition-all"
                              title="View document"
                            >
                              <Eye size={14} />
                            </a>
                          )}
                          {doc.status !== 'approved' && (
                            <button
                              onClick={() => handleDocStatus(i, 'approved')}
                              className="p-2 rounded-lg hover:bg-emerald-500/10 text-foreground/20 hover:text-emerald-400 transition-all"
                              title="Approve document"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {doc.status !== 'rejected' && (
                            <button
                              onClick={() => handleDocStatus(i, 'rejected')}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/20 hover:text-red-400 transition-all"
                              title="Reject document"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDoc(i)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            title="Delete document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/20 text-sm text-center py-4">No documents uploaded yet. Upload KYC/KYP documents above.</p>
                )}
              </div>

              {/* Partner Performance (if partner) */}
              {partner && metrics && (
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6 flex items-center gap-3">
                    <TrendingUp size={20} className="text-rentr-primary" />
                    Performance
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] overflow-hidden">
                    {[
                      { label: 'Total Revenue', value: `₹${fmt(metrics.total_revenue)}` },
                      { label: 'Monthly Recurring', value: `₹${fmt(metrics.monthly_recurring)}` },
                      { label: 'Deployed Assets', value: metrics.deployed_assets || 0 },
                      { label: 'On-Time Payment', value: metrics.on_time_payment_rate != null ? `${metrics.on_time_payment_rate}%` : '—' },
                    ].map((s, i) => (
                      <div key={s.label} className={`p-4 sm:p-6 lg:p-8 flex flex-col gap-3 sm:gap-4 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700 ${i < 3 ? 'border-r border-foreground/[0.05]' : ''}`}>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20">{s.label}</span>
                        <h3 className="text-3xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">{s.value}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ),
        },
        {
          key: 'orders',
          label: 'Orders & Assets',
          count: ordersAssetsCount || undefined,
          content: (
            <>
              {/* Orders */}
              <Section title="Orders" data={orders}>
                <DataTable
                  columns={[
                    { key: 'order_number', label: 'Order #' },
                    { key: 'total_monthly', label: 'Monthly', render: (v) => `₹${fmt(v)}` },
                    { key: 'rental_months', label: 'Tenure', render: (v) => `${v}mo` },
                    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
                  ]}
                  data={orders}
                  loading={false}
                  onRowClick={(row) => navigate(`/orders/${row.id}`)}
                  emptyMessage="No orders."
                />
              </Section>

              {/* Assets */}
              <Section title="Assets" data={assets}>
                <DataTable
                  columns={[
                    { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-bold">{v}</span> },
                    { key: 'oem', label: 'OEM / Model', render: (_, row) => [row.oem, row.model].filter(Boolean).join(' / ') || '-' },
                    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    { key: 'condition_grade', label: 'Grade' },
                    { key: 'monthly_rate', label: 'Rate', render: (v) => v ? `₹${fmt(v)}` : '-' },
                  ]}
                  data={assets}
                  loading={false}
                  onRowClick={(row) => navigate(`/assets/${row.id}`)}
                  emptyMessage="No assets."
                />
              </Section>

              {orders.length === 0 && assets.length === 0 && (
                <p className="text-foreground/20 text-sm text-center py-8">No orders or assets found.</p>
              )}
            </>
          ),
        },
        {
          key: 'billing',
          label: 'Billing',
          count: billingCount || undefined,
          content: (
            <>
              {/* Invoices */}
              <Section title="Invoices" data={invoices}>
                <DataTable
                  columns={[
                    { key: 'invoice_number', label: 'Invoice #' },
                    { key: 'total', label: 'Amount', render: (v) => `₹${fmt(v)}` },
                    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    { key: 'due_date', label: 'Due Date', render: (v) => v || '-' },
                  ]}
                  data={invoices}
                  loading={false}
                  onRowClick={(row) => navigate(`/invoices/${row.id}`)}
                  emptyMessage="No invoices."
                />
              </Section>

              {/* Contracts */}
              <Section title="Contracts" data={contracts}>
                <DataTable
                  columns={[
                    { key: 'contract_number', label: 'Contract #' },
                    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    { key: 'start_date', label: 'Start', render: (v) => v || '-' },
                    { key: 'end_date', label: 'End', render: (v) => v || '-' },
                  ]}
                  data={contracts}
                  loading={false}
                  onRowClick={(row) => navigate(`/contracts/${row.id}`)}
                  emptyMessage="No contracts."
                />
              </Section>

              {invoices.length === 0 && contracts.length === 0 && (
                <p className="text-foreground/20 text-sm text-center py-8">No invoices or contracts found.</p>
              )}
            </>
          ),
        },
        {
          key: 'support',
          label: 'Support',
          count: supportCount || undefined,
          content: (
            <>
              {/* Returns */}
              <Section title="Returns" data={returns}>
                <DataTable
                  columns={[
                    { key: 'return_number', label: 'Return #' },
                    { key: 'reason', label: 'Reason' },
                    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                    { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
                  ]}
                  data={returns}
                  loading={false}
                  onRowClick={(row) => navigate(`/returns/${row.id}`)}
                  emptyMessage="No returns."
                />
              </Section>

              {/* Tickets */}
              <Section title="Support Tickets" data={tickets}>
                <DataTable
                  columns={[
                    { key: 'ticket_number', label: 'Ticket #' },
                    { key: 'subject', label: 'Subject' },
                    { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
                    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                  ]}
                  data={tickets}
                  loading={false}
                  onRowClick={(row) => navigate(`/support/${row.id}`)}
                  emptyMessage="No tickets."
                />
              </Section>

              {returns.length === 0 && tickets.length === 0 && (
                <p className="text-foreground/20 text-sm text-center py-8">No returns or support tickets found.</p>
              )}
            </>
          ),
        },
      ]} />

      {/* Approve Modal */}
      <Modal isOpen={approveModal} onClose={() => setApproveModal(false)} title="Approve KYC" footer={
        <>
          <button onClick={() => setApproveModal(false)} className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-all">Cancel</button>
          <button onClick={handleApprove} disabled={!creditLimit || submitting} className="px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50">{submitting ? 'Approving...' : 'Approve'}</button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Credit Limit (₹)</label>
            <input type="number" min="0" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10" placeholder="Enter credit limit" />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Review Notes</label>
            <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3} className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10" placeholder="Optional notes..." />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject KYC" footer={
        <>
          <button onClick={() => setRejectModal(false)} className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-all">Cancel</button>
          <button onClick={handleReject} disabled={!rejectionReason || submitting} className="px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50">{submitting ? 'Rejecting...' : 'Reject'}</button>
        </>
      }>
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Rejection Reason</label>
          <textarea required value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10" placeholder="Reason for rejection..." />
        </div>
      </Modal>
    </motion.div>
  );
}

function InfoItem({ label, value, highlight }) {
  return (
    <div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-emerald-400' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function Section({ title, data, children }) {
  if (!data || data.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">{title}</h2>
      <div className="border-t border-foreground/[0.05]">
        {children}
      </div>
    </div>
  );
}
