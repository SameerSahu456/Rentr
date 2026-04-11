import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, CreditCard, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import DetailTabs from '../components/DetailTabs';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function KYCDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/kyc/${id}`)
      .then(setKyc)
      .catch(() => navigate('/kyc'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!kyc) return null;

  const accountTypeBadge = (type) => {
    if (type === 'channel_partner') return 'bg-purple-500/10 text-purple-400 border border-purple-500/15';
    if (type === 'direct_enterprise') return 'bg-blue-500/10 text-blue-400 border border-blue-500/15';
    return 'bg-foreground/[0.05] text-foreground/70';
  };

  const creditAvailable = (kyc.credit_limit || 0) - (kyc.credit_used || 0);
  const isPendingReview = kyc.status === 'pending' || kyc.status === 'under_review';
  const documents = kyc.documents || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/kyc')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to KYC
        </button>
        <StatusBadge status={kyc.status} />
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              KYC
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${accountTypeBadge(kyc.account_type)}`}>
              {kyc.account_type === 'channel_partner' ? 'Channel Partner' : kyc.account_type === 'direct_enterprise' ? 'Direct Enterprise' : kyc.account_type || '-'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            {kyc.customer_email ? <span className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(kyc.customer_email)}`)}>{kyc.company_name || kyc.company || 'KYC Review'}</span> : (kyc.company_name || kyc.company || 'KYC Review')}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <DetailTabs tabs={[
        {
          key: 'details',
          label: 'Details',
          content: (
            <>
              {/* Info Grid */}
              <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                  <div className="flex items-start gap-2">
                    <User size={16} className="text-foreground/30 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer Name</span>
                      <span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(kyc.customer_email)}`)}>{kyc.customer_name || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User size={16} className="text-foreground/30 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Email</span>
                      <span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(kyc.customer_email)}`)}>{kyc.customer_email || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield size={16} className="text-foreground/30 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Account Type</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${accountTypeBadge(kyc.account_type)}`}>
                        {kyc.account_type === 'channel_partner' ? 'Channel Partner' : kyc.account_type === 'direct_enterprise' ? 'Direct Enterprise' : kyc.account_type || '-'}
                      </span>
                    </div>
                  </div>
                  <InfoItem icon={FileText} label="GSTIN" value={kyc.gstin || '-'} />
                  <InfoItem icon={FileText} label="PAN" value={kyc.pan || '-'} />
                  <InfoItem icon={CreditCard} label="Credit Limit" value={`\u20B9${fmt(kyc.credit_limit)}`} />
                  <InfoItem icon={CreditCard} label="Credit Used" value={`\u20B9${fmt(kyc.credit_used)}`} />
                  <InfoItem icon={CreditCard} label="Credit Available" value={`\u20B9${fmt(creditAvailable)}`} />
                </div>
              </div>
            </>
          ),
        },
        {
          key: 'documents',
          label: 'Documents',
          count: documents.length,
          content: (
            <>
              {documents.length > 0 ? (
                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6">Documents</h2>
                  <div className="space-y-3">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between py-6 px-4 bg-foreground/[0.02] rounded-2xl border border-foreground/[0.04] hover:bg-foreground/[0.01] transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-foreground/30" />
                          <div>
                            <span className="text-sm font-medium text-foreground">{doc.type || doc.document_type || 'Document'}</span>
                            <span className="block text-xs text-foreground/40">{doc.filename || doc.file_name || '-'}</span>
                          </div>
                        </div>
                        {doc.status && <StatusBadge status={doc.status} />}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-foreground/30 text-sm">No documents uploaded.</div>
              )}
            </>
          ),
        },
        {
          key: 'review',
          label: 'Review',
          content: (
            <>
              <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6">Review</h2>
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
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Reviewed By</span>
                        <span className="font-medium text-foreground">{kyc.reviewer}</span>
                      </div>
                    )}
                    {kyc.review_notes && (
                      <div className="col-span-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Review Notes</span>
                        <span className="font-medium text-foreground">{kyc.review_notes}</span>
                      </div>
                    )}
                    {kyc.rejection_reason && (
                      <div className="col-span-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Rejection Reason</span>
                        <span className="font-medium text-red-600">{kyc.rejection_reason}</span>
                      </div>
                    )}
                    {kyc.reviewed_at && (
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Reviewed At</span>
                        <span className="font-medium text-foreground">
                          {new Date(kyc.reviewed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ),
        },
      ]} />

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
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Credit Limit ({'\u20B9'})</label>
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
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Review Notes</label>
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
          <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Rejection Reason</label>
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
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="text-foreground/30 mt-0.5 shrink-0" />
      <div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
