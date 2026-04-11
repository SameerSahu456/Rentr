import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Send, Copy, Package, FileText, CreditCard, RotateCcw, LifeBuoy, CalendarPlus, Eye, Pencil, X, Bell, BellOff, Plus, FilePlus2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const statusFlow = ['draft', 'pending_signature', 'active', 'expired', 'cancelled'];
const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || '/api';

const annexureTypeBadge = {
  addition: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  return: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
  replacement: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
};

const actionTypeIcons = {
  contract_created: '\u{1F4C4}',
  asset_added: '\u{1F4E6}',
  asset_returned: '\u21A9\uFE0F',
  status_change: '\u{1F504}',
  signature: '\u270D\uFE0F',
  annexure: '\u{1F4CE}',
  extension: '\u{1F4C5}',
  payment: '\u{1F4B3}',
  invoice: '\u{1F9FE}',
  note: '\u{1F4DD}',
};

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signingUrl, setSigningUrl] = useState('');
  const [extendModal, setExtendModal] = useState(false);
  const [extendMonths, setExtendMonths] = useState(6);
  const [extendReason, setExtendReason] = useState('');
  const [extending, setExtending] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [reminderModal, setReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({ days_before: 30, reminder_type: 'expiry', channel: 'email' });
  const [savingReminder, setSavingReminder] = useState(false);
  const [annexureModal, setAnnexureModal] = useState(false);
  const [annexureForm, setAnnexureForm] = useState({ type: 'addition', asset_uids: '', notes: '' });
  const [creatingAnnexure, setCreatingAnnexure] = useState(false);

  useEffect(() => {
    api.get(`/contracts/${id}`)
      .then(setContract)
      .catch(() => navigate('/contracts'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleGetSigningLink = async () => {
    try {
      const data = await api.post(`/contracts/${id}/resend-signing-link`);
      const url = `https://rentr-india.vercel.app/sign/${data.signing_token}`;
      setSigningUrl(url);
      navigator.clipboard.writeText(url).catch(() => {});
    } catch {
      // handle error
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/contracts/${id}`, { status });
      setContract((prev) => ({ ...prev, status }));
    } catch {
      // handle error
    }
  };

  const handleExtend = async () => {
    setExtending(true);
    try {
      const updated = await api.post(`/contracts/${id}/extend`, {
        extend_months: extendMonths,
        reason: extendReason,
      });
      setContract((prev) => ({ ...prev, ...updated }));
      setExtendModal(false);
      setExtendReason('');
    } catch {
      // handle error
    } finally {
      setExtending(false);
    }
  };

  const fetchPdfBlob = async () => {
    setPdfLoading(true);
    try {
      const token = api.getToken();
      const res = await fetch(`${BASE_URL}/contracts/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      });
      if (!res.ok) throw new Error('Failed to fetch PDF');
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    } finally {
      setPdfLoading(false);
    }
  };

  const handleViewPdf = async () => {
    const url = pdfBlobUrl || await fetchPdfBlob();
    if (url) {
      setPdfBlobUrl(url);
      setPdfViewerOpen(true);
    }
  };

  const handleDownloadPdf = async () => {
    const url = pdfBlobUrl || await fetchPdfBlob();
    if (url) {
      setPdfBlobUrl(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${contract.contract_number}.pdf`;
      a.click();
    }
  };

  // Reminders
  const fetchReminders = async () => {
    try {
      const data = await api.get(`/contracts/${id}/reminders`);
      setReminders(data || []);
    } catch { /* no reminders yet */ }
  };

  useEffect(() => {
    if (contract) fetchReminders();
  }, [contract?.id]);

  const handleAddReminder = async () => {
    setSavingReminder(true);
    try {
      await api.post(`/contracts/${id}/reminders`, reminderForm);
      await fetchReminders();
      setReminderModal(false);
      setReminderForm({ days_before: 30, reminder_type: 'expiry', channel: 'email' });
    } catch { /* handle error */ } finally {
      setSavingReminder(false);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.delete(`/contracts/${id}/reminders/${reminderId}`);
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch { /* handle error */ }
  };

  const handleToggleReminder = async (reminder) => {
    try {
      await api.put(`/contracts/${id}/reminders/${reminder.id}`, { is_active: !reminder.is_active });
      setReminders((prev) => prev.map((r) => r.id === reminder.id ? { ...r, is_active: !r.is_active } : r));
    } catch { /* handle error */ }
  };

  const handleCreateAnnexure = async () => {
    setCreatingAnnexure(true);
    try {
      const payload = {
        type: annexureForm.type,
        asset_uids: annexureForm.asset_uids.split(',').map((u) => u.trim()).filter(Boolean),
        notes: annexureForm.notes,
      };
      const newAnnexure = await api.post(`/contracts/${id}/annexures`, payload);
      setContract((prev) => ({
        ...prev,
        annexures: [...(prev.annexures || []), newAnnexure],
      }));
      setAnnexureModal(false);
      setAnnexureForm({ type: 'addition', asset_uids: '', notes: '' });
    } catch {
      // handle error
    } finally {
      setCreatingAnnexure(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!contract) return null;

  const currentIndex = statusFlow.indexOf(contract.status);
  const annexures = contract.annexures || [];
  const actionItems = contract.action_items || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/contracts')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Contracts
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={contract.status} />
          {contract.status === 'pending_signature' && (
            <button
              onClick={handleGetSigningLink}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all"
            >
              <Send size={16} />
              {signingUrl ? 'Copied!' : 'Get Signing Link'}
            </button>
          )}
          {signingUrl && (
            <button
              onClick={() => { navigator.clipboard.writeText(signingUrl); }}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-foreground/5 text-foreground/60 text-[10px] font-mono tracking-wide hover:bg-foreground/10 transition-all max-w-[200px] truncate"
              title={signingUrl}
            >
              <Copy size={14} />
              {signingUrl.split('/sign/')[1]?.slice(0, 8)}...
            </button>
          )}
          {contract.document_url && (
            <>
              <button
                onClick={handleViewPdf}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground/10 text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
              >
                <Eye size={16} />
                {pdfLoading ? 'Loading...' : 'View PDF'}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
              >
                <Download size={16} />
                Download PDF
              </button>
            </>
          )}
          <button
            onClick={() => navigate(`/contracts/${id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground/5 text-foreground/60 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 hover:text-foreground transition-all"
          >
            <Pencil size={16} />
            Edit
          </button>
          <select
            value={contract.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
          >
            {statusFlow.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          {(contract.status === 'active' || contract.status === 'expired') && (
            <button
              onClick={() => setExtendModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all"
            >
              <CalendarPlus size={16} />
              Extend
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              Contract
            </span>
            <span className="text-[10px] font-mono text-foreground/20">{contract.contract_number}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            {contract.customer_email ? <span className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(contract.customer_email)}`)}>{contract.customer_name || 'Contract'}</span> : (contract.customer_name || 'Contract')}
          </h1>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6">Contract Progress</h2>
        <div className="flex items-center justify-between">
          {statusFlow.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= currentIndex ? 'bg-rentr-primary text-white' : 'bg-foreground/[0.05] text-foreground/40'
                }`}>
                  {i + 1}
                </div>
                <span className="text-xs mt-1 capitalize text-foreground/40">{step}</span>
              </div>
              {i < statusFlow.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < currentIndex ? 'bg-rentr-primary' : 'bg-foreground/[0.05]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contract Details */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-6">Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span><span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(contract.customer_email)}`)}>{contract.customer_name}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Email</span><span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(contract.customer_email)}`)}>{contract.customer_email}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Type</span><span className="font-medium text-foreground capitalize">{contract.type}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Start Date</span><span className="font-medium text-foreground">{contract.start_date}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">End Date</span><span className="font-medium text-foreground">{contract.end_date}{contract.extended_months > 0 && <span className="ml-1 text-blue-400 text-xs">(+{contract.extended_months}mo)</span>}</span></div>
          {contract.original_end_date && (
            <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Original End Date</span><span className="font-medium text-foreground/50">{contract.original_end_date}</span></div>
          )}
          {contract.order_id && (
            <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Order</span>
              {contract.order ? (
                <span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/orders/${contract.order.id}`)}>{contract.order.order_number} ({contract.order.status})</span>
              ) : (
                <span className="font-medium text-foreground">{contract.order_id}</span>
              )}
            </div>
          )}
          {contract.signed_at && (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Signed At</span>
              <span className="font-medium text-foreground">
                {new Date(contract.signed_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {contract.document_url && (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Agreement PDF</span>
              <span className="font-medium text-green-600">Generated</span>
            </div>
          )}
        </div>

        {contract.terms && (
          <div className="mt-6 border-t border-foreground/[0.05] pt-4">
            <h3 className="text-lg font-brand font-black uppercase tracking-tight text-foreground/70 mb-2">Terms & Conditions</h3>
            <p className="text-sm text-foreground/60 whitespace-pre-wrap">{contract.terms}</p>
          </div>
        )}
      </div>

      {/* Annexure Management */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <FilePlus2 size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Annexures</h2>
            {annexures.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-foreground/[0.05] text-[9px] font-bold text-foreground/40">{annexures.length}</span>
            )}
          </div>
          <button
            onClick={() => setAnnexureModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
          >
            <Plus size={14} />
            Create Annexure
          </button>
        </div>

        {annexures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-foreground/[0.03] flex items-center justify-center mb-4">
              <FilePlus2 size={20} className="text-foreground/20" />
            </div>
            <p className="text-sm font-medium text-foreground/30 mb-1">No annexures yet</p>
            <p className="text-xs text-foreground/20">Create an annexure to add, return, or replace assets on this contract.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {annexures.map((annexure, idx) => {
                const typeStyle = annexureTypeBadge[annexure.type] || annexureTypeBadge.addition;
                const assetCount = Array.isArray(annexure.assets) ? annexure.assets.length : 0;
                return (
                  <motion.div
                    key={annexure.id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl p-4 hover:border-foreground/[0.1] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                        {annexure.type}
                      </span>
                      <StatusBadge status={annexure.status || 'draft'} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Assets</span>
                        <span className="font-medium text-foreground">{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Signing</span>
                        <span className="font-medium text-foreground capitalize">{annexure.signing_status || '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Created</span>
                        <span className="font-medium text-foreground/60 text-xs">
                          {annexure.created_at
                            ? new Date(annexure.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </span>
                      </div>
                    </div>
                    {Array.isArray(annexure.assets) && annexure.assets.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-foreground/[0.05]">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-1">Asset UIDs</span>
                        <div className="flex flex-wrap gap-1">
                          {annexure.assets.map((uid, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-foreground/[0.04] text-[10px] font-mono text-foreground/50">{uid}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Linked Assets */}
      {contract.assets && contract.assets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Assets</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-bold">{v}</span> },
                { key: 'oem', label: 'OEM / Model', render: (_, row) => [row.oem, row.model].filter(Boolean).join(' / ') || '-' },
                { key: 'category', label: 'Category' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'monthly_rate', label: 'Monthly Rate', render: (v) => v ? `₹${Number(v).toLocaleString('en-IN')}` : '-' },
              ]}
              data={contract.assets}
              loading={false}
              onRowClick={(row) => navigate(`/assets/${row.id}`)}
              emptyMessage="No assets."
            />
          </div>
        </div>
      )}

      {/* Linked Invoices */}
      {contract.invoices && contract.invoices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Invoices</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'invoice_number', label: 'Invoice #' },
                { key: 'total', label: 'Total', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'due_date', label: 'Due Date', render: (v) => v || '-' },
              ]}
              data={contract.invoices}
              loading={false}
              onRowClick={(row) => navigate(`/invoices/${row.id}`)}
              emptyMessage="No invoices."
            />
          </div>
        </div>
      )}

      {/* Linked Payments */}
      {contract.payments && contract.payments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Payments</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'amount', label: 'Amount', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
                { key: 'method', label: 'Method', render: (v) => (v || '').replace(/_/g, ' ') },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'transaction_id', label: 'Transaction ID', render: (v) => v || '-' },
              ]}
              data={contract.payments}
              loading={false}
              emptyMessage="No payments."
            />
          </div>
        </div>
      )}

      {/* Linked Returns */}
      {contract.returns && contract.returns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RotateCcw size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Returns</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'return_number', label: 'Return #' },
                { key: 'reason', label: 'Reason' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'asset_uids', label: 'Assets', render: (v) => Array.isArray(v) ? v.length : 0 },
              ]}
              data={contract.returns}
              loading={false}
              onRowClick={(row) => navigate(`/returns/${row.id}`)}
              emptyMessage="No returns."
            />
          </div>
        </div>
      )}

      {/* Linked Support Tickets */}
      {contract.tickets && contract.tickets.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LifeBuoy size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Linked Support Tickets</h2>
          </div>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'ticket_number', label: 'Ticket #' },
                { key: 'subject', label: 'Subject' },
                { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              ]}
              data={contract.tickets}
              loading={false}
              onRowClick={(row) => navigate(`/support/${row.id}`)}
              emptyMessage="No tickets."
            />
          </div>
        </div>
      )}
      {/* Activity Log / Action Items */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 border-b border-foreground/[0.05] pb-4 mb-6">
          <Clock size={18} className="text-foreground/40" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Activity Log</h2>
          {actionItems.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-foreground/[0.05] text-[9px] font-bold text-foreground/40">{actionItems.length}</span>
          )}
        </div>

        {actionItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-foreground/[0.03] flex items-center justify-center mb-4">
              <Clock size={20} className="text-foreground/20" />
            </div>
            <p className="text-sm font-medium text-foreground/30 mb-1">No activity recorded</p>
            <p className="text-xs text-foreground/20">Action items and events will appear here as the contract progresses.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-foreground/[0.06]" />

            <div className="space-y-0">
              {[...actionItems]
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                .map((item, idx) => (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="relative pl-10 py-4 group"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[9px] top-5 w-[14px] h-[14px] rounded-full bg-foreground/[0.04] border-2 border-foreground/[0.1] group-hover:border-rentr-primary/40 transition-colors flex items-center justify-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'completed' ? 'bg-green-500' : item.status === 'pending' ? 'bg-amber-500' : 'bg-foreground/20'}`} />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{actionTypeIcons[item.type] || '\u2022'}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30">{(item.type || 'event').replace(/_/g, ' ')}</span>
                          {item.status && <StatusBadge status={item.status} />}
                        </div>
                        <p className="text-sm text-foreground/70 leading-relaxed">{item.description}</p>
                        {item.references && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(Array.isArray(item.references) ? item.references : [item.references]).map((ref, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-foreground/[0.04] text-[10px] font-mono text-foreground/40">{typeof ref === 'string' ? ref : ref.id || JSON.stringify(ref)}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-foreground/20 whitespace-nowrap shrink-0">
                        {item.date
                          ? new Date(item.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Expiry Reminders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-foreground/40" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Expiry Reminders</h2>
          </div>
          <button
            onClick={() => setReminderModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all"
          >
            <Bell size={14} />
            Add Reminder
          </button>
        </div>
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          {reminders.length === 0 ? (
            <p className="text-sm text-foreground/30 text-center py-6">No reminders configured. Add a reminder to get notified before contract expiry.</p>
          ) : (
            <div className="space-y-3">
              {reminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-foreground/[0.03] rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.is_active ? 'bg-amber-500/20 text-amber-500' : 'bg-foreground/5 text-foreground/20'}`}>
                      {r.is_active ? <Bell size={16} /> : <BellOff size={16} />}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground block">
                        {r.days_before} days before {r.reminder_type}
                      </span>
                      <span className="text-[10px] text-foreground/30 uppercase tracking-wider">
                        via {r.channel} {r.last_sent_at ? `· Last sent: ${new Date(r.last_sent_at).toLocaleDateString('en-IN')}` : '· Never sent'}
                        {r.next_trigger_date && ` · Next: ${new Date(r.next_trigger_date).toLocaleDateString('en-IN')}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleReminder(r)}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${r.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-foreground/5 text-foreground/30 hover:bg-foreground/10'}`}
                    >
                      {r.is_active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => handleDeleteReminder(r.id)}
                      className="p-1.5 rounded-full text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerOpen && pdfBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 bg-background rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.05]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/60">{contract.contract_number} — PDF Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all"
                >
                  <Download size={14} />
                  Download
                </button>
                <button
                  onClick={() => setPdfViewerOpen(false)}
                  className="p-2 rounded-full hover:bg-foreground/10 transition-all text-foreground/40 hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe src={pdfBlobUrl} className="flex-1 w-full" title="Contract PDF" />
          </div>
        </div>
      )}

      {/* Extend Contract Modal */}
      <Modal
        isOpen={extendModal}
        onClose={() => setExtendModal(false)}
        title="Extend Contract"
        footer={
          <>
            <button onClick={() => setExtendModal(false)} className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all">Cancel</button>
            <button onClick={handleExtend} disabled={extending} className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50">{extending ? 'Extending...' : 'Extend Contract'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-foreground/[0.03] rounded-xl p-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Current End Date</span><span className="font-medium">{contract.end_date}</span></div>
              <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Contract</span><span className="font-medium">{contract.contract_number}</span></div>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Extend By (Months)</label>
            <select
              value={extendMonths}
              onChange={(e) => setExtendMonths(Number(e.target.value))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/60"
            >
              {[1, 2, 3, 6, 9, 12, 18, 24].map((m) => (
                <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Reason</label>
            <textarea
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10 resize-none"
              rows={3}
              placeholder="Customer renewal, contract extension request..."
            />
          </div>
        </div>
      </Modal>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={reminderModal}
        onClose={() => setReminderModal(false)}
        title="Add Expiry Reminder"
        footer={
          <>
            <button onClick={() => setReminderModal(false)} className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all">Cancel</button>
            <button onClick={handleAddReminder} disabled={savingReminder} className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50">{savingReminder ? 'Saving...' : 'Add Reminder'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-foreground/[0.03] rounded-xl p-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Contract End Date</span><span className="font-medium">{contract.end_date || 'Not set'}</span></div>
              <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span><span className="font-medium">{contract.customer_name}</span></div>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Reminder Type</label>
            <select
              value={reminderForm.reminder_type}
              onChange={(e) => setReminderForm((f) => ({ ...f, reminder_type: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/60"
            >
              <option value="expiry">Contract Expiry</option>
              <option value="renewal">Renewal Reminder</option>
              <option value="payment">Payment Due</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Days Before Expiry</label>
            <select
              value={reminderForm.days_before}
              onChange={(e) => setReminderForm((f) => ({ ...f, days_before: Number(e.target.value) }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/60"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={45}>45 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days (Recommended)</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Notification Channel</label>
            <select
              value={reminderForm.channel}
              onChange={(e) => setReminderForm((f) => ({ ...f, channel: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/60"
            >
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Email + WhatsApp</option>
            </select>
          </div>
        </div>
      </Modal>
      {/* Create Annexure Modal */}
      <Modal
        isOpen={annexureModal}
        onClose={() => setAnnexureModal(false)}
        title="Create Annexure"
        footer={
          <>
            <button onClick={() => setAnnexureModal(false)} className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all">Cancel</button>
            <button onClick={handleCreateAnnexure} disabled={creatingAnnexure} className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50">{creatingAnnexure ? 'Creating...' : 'Create Annexure'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Annexure Type</label>
            <select
              value={annexureForm.type}
              onChange={(e) => setAnnexureForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/60"
            >
              <option value="addition">Addition</option>
              <option value="return">Return</option>
              <option value="replacement">Replacement</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Asset UIDs</label>
            <input
              type="text"
              value={annexureForm.asset_uids}
              onChange={(e) => setAnnexureForm((f) => ({ ...f, asset_uids: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="UID-001, UID-002, UID-003"
            />
            <p className="text-[9px] text-foreground/20 mt-1 ml-4">Comma-separated list of asset UIDs</p>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-2">Notes</label>
            <textarea
              value={annexureForm.notes}
              onChange={(e) => setAnnexureForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10 resize-none"
              rows={3}
              placeholder="Additional notes for this annexure..."
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
