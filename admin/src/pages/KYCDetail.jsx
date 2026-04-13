import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, CreditCard, Shield, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function KYCDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/kyc/${id}`)
      .then(setKyc)
      .catch(() => setKyc(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const updated = await api.put(`/kyc/${id}`, {
        status: 'approved',
        credit_limit: Number(creditLimit),
        review_notes: reviewNotes,
      });
      setKyc(updated);
      setApproveModal(false);
      setCreditLimit('');
      setReviewNotes('');
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      const updated = await api.put(`/kyc/${id}`, {
        status: 'rejected',
        rejection_reason: rejectionReason,
      });
      setKyc(updated);
      setRejectModal(false);
      setRejectionReason('');
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;

  if (!kyc) return (
    <div className="text-center py-20">
      <p className="text-foreground/30 text-sm mb-4">KYC record not found</p>
      <button onClick={() => navigate('/kyc')} className="text-rentr-primary text-sm hover:underline">Back to KYC</button>
    </div>
  );

  const accountTypeBadge = (type) => {
    if (type === 'channel_partner') return 'bg-purple-500/10 text-purple-400 border border-purple-500/15';
    if (type === 'direct_enterprise') return 'bg-blue-500/10 text-blue-400 border border-blue-500/15';
    return 'bg-foreground/[0.05] text-foreground/70';
  };

  const creditAvailable = (kyc.credit_limit || 0) - (kyc.credit_used || 0);
  const isPendingReview = kyc.status === 'pending' || kyc.status === 'under_review';
  const documents = kyc.documents || [];

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'documents', label: `Documents (${documents.length})` },
    { key: 'review', label: 'Review' },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/kyc')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to KYC
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${accountTypeBadge(kyc.account_type)}`}>
                {kyc.account_type === 'channel_partner' ? 'Channel Partner' : kyc.account_type === 'direct_enterprise' ? 'Direct Enterprise' : kyc.account_type || '-'}
              </span>
            </div>
            <h1 className="text-2xl font-brand font-bold text-foreground">
              {kyc.customer_email ? (
                <span className="text-rentr-primary hover:underline cursor-pointer" onClick={() => navigate(`/customers/${encodeURIComponent(kyc.customer_email)}`)}>
                  {kyc.company_name || kyc.company || 'KYC Review'}
                </span>
              ) : (kyc.company_name || kyc.company || 'KYC Review')}
            </h1>
            <p className="text-foreground/30 text-sm">{kyc.customer_name} &middot; {kyc.customer_email}</p>
          </div>
          <StatusBadge status={kyc.status} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">GSTIN</p>
            <p className="text-sm font-bold">{kyc.gstin || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">PAN</p>
            <p className="text-sm font-bold">{kyc.pan || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Limit</p>
            <p className="text-lg font-bold">₹{fmt(kyc.credit_limit)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Used</p>
            <p className="text-lg font-bold">₹{fmt(kyc.credit_used)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Available</p>
            <p className="text-lg font-bold text-emerald-500">₹{fmt(creditAvailable)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Documents</p>
            <p className="text-lg font-bold">{documents.length}</p>
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
      {tab === 'details' && (
        <div className="glass rounded-2xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div className="flex items-start gap-2">
              <User size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Customer Name</p>
                <p className="font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/customers/${encodeURIComponent(kyc.customer_email)}`)}>{kyc.customer_name || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Email</p>
                <p className="font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/customers/${encodeURIComponent(kyc.customer_email)}`)}>{kyc.customer_email || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Account Type</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${accountTypeBadge(kyc.account_type)}`}>
                  {kyc.account_type === 'channel_partner' ? 'Channel Partner' : kyc.account_type === 'direct_enterprise' ? 'Direct Enterprise' : kyc.account_type || '-'}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">GSTIN</p>
                <p className="font-bold">{kyc.gstin || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">PAN</p>
                <p className="font-bold">{kyc.pan || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Limit</p>
                <p className="font-bold">₹{fmt(kyc.credit_limit)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Used</p>
                <p className="font-bold">₹{fmt(kyc.credit_used)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard size={16} className="text-foreground/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Available</p>
                <p className="font-bold text-emerald-500">₹{fmt(creditAvailable)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'documents' && (
        <>
          {documents.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-foreground/[0.03]">
                {documents.map((doc, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-foreground/30" />
                      <div>
                        <p className="text-sm font-bold">{doc.type || doc.document_type || 'Document'}</p>
                        <p className="text-xs text-foreground/30">{doc.filename || doc.file_name || '-'}</p>
                      </div>
                    </div>
                    {doc.status && <StatusBadge status={doc.status} />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No documents uploaded.</p>
          )}
        </>
      )}

      {tab === 'review' && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Review</h2>
          {isPendingReview ? (
            <div className="flex gap-3">
              <button
                onClick={() => setApproveModal(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
              >
                <CheckCircle size={16} />
                Approve
              </button>
              <button
                onClick={() => setRejectModal(true)}
                className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all"
              >
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3"><XCircle size={16} /> Reject</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {kyc.reviewer && (
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Reviewed By</p>
                  <p className="font-bold">{kyc.reviewer}</p>
                </div>
              )}
              {kyc.review_notes && (
                <div className="col-span-2">
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Review Notes</p>
                  <p className="font-bold">{kyc.review_notes}</p>
                </div>
              )}
              {kyc.rejection_reason && (
                <div className="col-span-2">
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Rejection Reason</p>
                  <p className="font-bold text-red-600">{kyc.rejection_reason}</p>
                </div>
              )}
              {kyc.reviewed_at && (
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Reviewed At</p>
                  <p className="font-bold">{new Date(kyc.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal}
        onClose={() => setApproveModal(false)}
        title="Approve KYC"
        footer={
          <>
            <button
              onClick={() => setApproveModal(false)}
              className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all"
            >
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest">Cancel</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={!creditLimit || submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
            >
              {submitting ? 'Approving...' : 'Approve'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-foreground/25 uppercase tracking-widest mb-2">Credit Limit ({'\u20B9'})</label>
            <input
              type="number"
              min="0"
              required
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Enter credit limit"
            />
          </div>
          <div>
            <label className="block text-[10px] text-foreground/25 uppercase tracking-widest mb-2">Review Notes</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="Optional notes..."
            />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject KYC"
        footer={
          <>
            <button
              onClick={() => setRejectModal(false)}
              className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all"
            >
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest">Cancel</span>
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectionReason || submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
            >
              {submitting ? 'Rejecting...' : 'Reject'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-[10px] text-foreground/25 uppercase tracking-widest mb-2">Rejection Reason</label>
          <textarea
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
            placeholder="Provide reason for rejection..."
          />
        </div>
      </Modal>
    </div>
  );
}
