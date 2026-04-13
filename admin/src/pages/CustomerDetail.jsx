import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, ShieldCheck, Building2, TrendingUp, CheckCircle, XCircle, Upload, Trash2, Eye, FileText } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function CustomerDetail() {
  const { email } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [partner, setPartner] = useState(null);
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
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

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;

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

  const tabs = [
    { key: 'profile', label: 'Profile & KYC' },
    { key: 'orders', label: `Orders & Assets (${orders.length + assets.length})` },
    { key: 'billing', label: `Billing (${invoices.length + contracts.length})` },
    { key: 'support', label: `Support (${returns.length + tickets.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Glass card header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-brand font-bold text-foreground">
              {companyName || name}
            </h1>
            <p className="text-foreground/30 text-sm">
              {companyName && name !== companyName ? `${name} \u00b7 ` : ''}{email}
            </p>
            {(profile.account_type || kyc?.account_type) && (
              <p className="text-foreground/40 text-xs mt-1 capitalize">{(profile.account_type || kyc?.account_type || '').replace(/_/g, ' ')}</p>
            )}
          </div>
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

        {/* Metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Orders</p>
            <p className="text-lg font-bold">{customer?.total_orders || metrics.total_orders || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Revenue</p>
            <p className="text-lg font-bold">{`\u20B9${fmt(customer?.total_monthly_value || metrics.total_revenue || 0)}`}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Limit</p>
            <p className="text-lg font-bold">{kyc?.credit_limit ? `\u20B9${fmt(kyc.credit_limit)}` : '\u2014'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">{partner ? 'Outstanding' : 'Total Paid'}</p>
            <p className={`text-lg font-bold ${partner ? 'text-amber-500' : ''}`}>
              {partner ? `\u20B9${fmt(metrics.outstanding || 0)}` : `\u20B9${fmt(customer?.total_paid || 0)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Inline tab buttons */}
      <div className="flex gap-1 border-b border-foreground/[0.05] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${tab === t.key ? 'border-rentr-primary text-rentr-primary' : 'border-transparent text-foreground/25 hover:text-foreground/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ========== Profile & KYC Tab ========== */}
      {tab === 'profile' && (
        <div className="space-y-6">
          {/* Company Profile */}
          {(kyc || partner) && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05] flex items-center gap-3">
                <Building2 size={18} className="text-rentr-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Company Profile & KYC</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-sm">
                  {companyName && <InfoItem label="Company" value={companyName} />}
                  <InfoItem label="Contact" value={name} />
                  <InfoItem label="Email" value={email} />
                  {(profile.gstin || kyc?.gstin) && <InfoItem label="GSTIN" value={profile.gstin || kyc?.gstin || '\u2014'} />}
                  {(profile.pan || kyc?.pan) && <InfoItem label="PAN" value={profile.pan || kyc?.pan || '\u2014'} />}
                  {kyc?.credit_limit != null && <InfoItem label="Credit Limit" value={`\u20B9${fmt(kyc.credit_limit)}`} />}
                  {kyc?.credit_used != null && <InfoItem label="Credit Used" value={`\u20B9${fmt(kyc.credit_used)}`} />}
                  {kyc && <InfoItem label="Credit Available" value={`\u20B9${fmt((kyc.credit_limit || 0) - (kyc.credit_used || 0))}`} highlight />}
                </div>

                {/* KYC Review Actions */}
                {isPendingKyc && (
                  <div className="mt-6 pt-6 border-t border-foreground/[0.05] flex gap-3">
                    <button
                      onClick={() => setApproveModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
                    >
                      <CheckCircle size={14} /> Approve KYC
                    </button>
                    <button
                      onClick={() => setRejectModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-red-400 hover:border-red-500/20 transition-all duration-500"
                    >
                      <XCircle size={14} /> Reject
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
            </div>
          )}

          {/* KYC Documents & Upload */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.05] flex items-center gap-3">
              <ShieldCheck size={18} className="text-rentr-primary" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Documents (KYC / KYP)</h2>
            </div>
            <div className="p-6">
              {/* Upload Section */}
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
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 mb-4 ${
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
              <div className="divide-y divide-foreground/[0.03]">
                {documents.map((doc, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-foreground/20" />
                      <div>
                        <p className="text-sm font-bold">{doc.type || doc.document_type || 'Document'}</p>
                        <p className="text-[10px] text-foreground/30">{doc.filename || doc.file_name || '\u2014'}</p>
                        {doc.note && <p className="text-[10px] text-foreground/30 italic mt-0.5">{doc.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.status && <StatusBadge status={doc.status} />}
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-foreground/[0.05] text-foreground/30 hover:text-foreground transition-all" title="View document">
                          <Eye size={14} />
                        </a>
                      )}
                      {doc.status !== 'approved' && (
                        <button onClick={() => handleDocStatus(i, 'approved')} className="p-2 rounded-lg hover:bg-emerald-500/10 text-foreground/20 hover:text-emerald-400 transition-all" title="Approve document">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {doc.status !== 'rejected' && (
                        <button onClick={() => handleDocStatus(i, 'rejected')} className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/20 hover:text-red-400 transition-all" title="Reject document">
                          <XCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteDoc(i)} className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100" title="Delete document">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No documents uploaded yet. Upload KYC/KYP documents above.</p>
            )}
          </div>

          {/* Partner Performance */}
          {partner && metrics && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05] flex items-center gap-3">
                <TrendingUp size={18} className="text-rentr-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Performance</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6">
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Total Revenue</p>
                  <p className="text-lg font-bold">{`\u20B9${fmt(metrics.total_revenue)}`}</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Monthly Recurring</p>
                  <p className="text-lg font-bold">{`\u20B9${fmt(metrics.monthly_recurring)}`}</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Deployed Assets</p>
                  <p className="text-lg font-bold">{metrics.deployed_assets || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">On-Time Payment</p>
                  <p className="text-lg font-bold">{metrics.on_time_payment_rate != null ? `${metrics.on_time_payment_rate}%` : '\u2014'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== Orders & Assets Tab ========== */}
      {tab === 'orders' && (
        <div className="space-y-6">
          {orders.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Orders</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {orders.map(o => (
                  <div key={o.id || o.order_number} onClick={() => navigate(`/orders/${o.id}`)} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-bold">{o.order_number}</p>
                      <p className="text-xs text-foreground/30">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : ''} {o.rental_months ? `\u00b7 ${o.rental_months}mo` : ''}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <p className="text-sm">{`\u20B9${fmt(o.total_monthly)}/mo`}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assets.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Assets</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {assets.map(a => (
                  <div key={a.id || a.uid} onClick={() => navigate(`/assets/${a.id}`)} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-bold font-mono">{a.uid}</p>
                      <p className="text-xs text-foreground/30">{[a.oem, a.model].filter(Boolean).join(' / ') || '-'} {a.condition_grade ? `\u00b7 ${a.condition_grade}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      {a.monthly_rate && <p className="text-sm">{`\u20B9${fmt(a.monthly_rate)}/mo`}</p>}
                      <StatusBadge status={a.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orders.length === 0 && assets.length === 0 && (
            <p className="text-foreground/20 text-sm text-center py-8">No orders or assets found.</p>
          )}
        </div>
      )}

      {/* ========== Billing Tab ========== */}
      {tab === 'billing' && (
        <div className="space-y-6">
          {invoices.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Invoices</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {invoices.map(inv => (
                  <div key={inv.id || inv.invoice_number} onClick={() => navigate(`/invoices/${inv.id}`)} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-bold">{inv.invoice_number}</p>
                      <p className="text-xs text-foreground/30">{inv.due_date ? `Due ${inv.due_date}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">{`\u20B9${fmt(inv.total)}`}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contracts.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Contracts</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {contracts.map(c => (
                  <div key={c.id || c.contract_number} onClick={() => navigate(`/contracts/${c.id}`)} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-bold">{c.contract_number}</p>
                      <p className="text-xs text-foreground/30">{c.start_date || ''} {c.start_date && c.end_date ? '-' : ''} {c.end_date || ''}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {invoices.length === 0 && contracts.length === 0 && (
            <p className="text-foreground/20 text-sm text-center py-8">No invoices or contracts found.</p>
          )}
        </div>
      )}

      {/* ========== Support Tab ========== */}
      {tab === 'support' && (
        <div className="space-y-6">
          {returns.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Returns</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {returns.map(r => (
                  <div key={r.id || r.return_number} onClick={() => navigate(`/returns/${r.id}`)} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-bold">{r.return_number}</p>
                      <p className="text-xs text-foreground/30">{r.reason || ''} {r.created_at ? `\u00b7 ${new Date(r.created_at).toLocaleDateString('en-IN')}` : ''}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tickets.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.05]">
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Support Tickets</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {tickets.map(t => (
                  <div key={t.id || t.ticket_number} onClick={() => navigate(`/support/${t.id}`)} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-bold">{t.ticket_number}</p>
                      <p className="text-xs text-foreground/30">{t.subject || ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {returns.length === 0 && tickets.length === 0 && (
            <p className="text-foreground/20 text-sm text-center py-8">No returns or support tickets found.</p>
          )}
        </div>
      )}

      {/* Approve Modal */}
      <Modal isOpen={approveModal} onClose={() => setApproveModal(false)} title="Approve KYC" footer={
        <>
          <button onClick={() => setApproveModal(false)} className="px-6 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-all">Cancel</button>
          <button onClick={handleApprove} disabled={!creditLimit || submitting} className="px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50">{submitting ? 'Approving...' : 'Approve'}</button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Credit Limit (\u20B9)</label>
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
    </div>
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
