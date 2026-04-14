import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Send, Copy, Package, FileText, CreditCard, RotateCcw, LifeBuoy, CalendarPlus, Eye, Pencil, X, Bell, BellOff, Plus, Clock, RefreshCw, ScrollText, History } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const statusFlow = ['draft', 'pending_signature', 'active', 'expired', 'terminated'];
const BASE_URL = import.meta.env.VITE_ADMIN_API_URL || '/api';

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
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
  const [sending, setSending] = useState(false);

  const reload = () => {
    api.get(`/contracts/${id}`)
      .then(setContract)
      .catch(() => setContract(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [id]);

  const fetchReminders = async () => {
    try {
      const data = await api.get(`/contracts/${id}/reminders`);
      setReminders(data || []);
    } catch { /* no reminders yet */ }
  };

  useEffect(() => { if (contract) fetchReminders(); }, [contract?.id]);

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
    } catch { return null; } finally { setPdfLoading(false); }
  };

  const handleViewPdf = async () => {
    const url = pdfBlobUrl || await fetchPdfBlob();
    if (url) { setPdfBlobUrl(url); setPdfViewerOpen(true); }
  };

  const handleDownloadPdf = async () => {
    const url = pdfBlobUrl || await fetchPdfBlob();
    if (url) {
      setPdfBlobUrl(url);
      const a = document.createElement('a');
      a.href = url; a.download = `${contract.contract_number}.pdf`; a.click();
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/contracts/${id}`, { status });
      setContract((prev) => ({ ...prev, status }));
    } catch { /* handle error */ }
  };

  const handleExtend = async () => {
    setExtending(true);
    try {
      const updated = await api.post(`/contracts/${id}/extend`, { extend_months: extendMonths, reason: extendReason });
      setContract((prev) => ({ ...prev, ...updated }));
      setExtendModal(false); setExtendReason('');
    } catch { /* handle error */ } finally { setExtending(false); }
  };

  const handleSendContract = async () => {
    setSending(true);
    try {
      const result = await api.post(`/contracts/${id}/send`);
      if (result.signing_token) {
        setSigningUrl(`https://rentr-india.vercel.app/sign/${result.signing_token}`);
      }
      setContract((prev) => ({ ...prev, status: result.contract_status || prev.status }));
    } catch { /* handle error */ } finally { setSending(false); }
  };

  const handleRenew = async () => {
    try {
      const newContract = await api.post(`/contracts/${id}/renew`);
      navigate(`/contracts/${newContract.id}`);
    } catch { /* handle error */ }
  };

  const handleGetSigningLink = async () => {
    try {
      const data = await api.post(`/contracts/${id}/resend-signing-link`);
      const url = `https://rentr-india.vercel.app/sign/${data.signing_token}`;
      setSigningUrl(url);
      navigator.clipboard.writeText(url).catch(() => {});
    } catch { /* handle error */ }
  };

  const handleAddReminder = async () => {
    setSavingReminder(true);
    try {
      await api.post(`/contracts/${id}/reminders`, reminderForm);
      await fetchReminders();
      setReminderModal(false);
      setReminderForm({ days_before: 30, reminder_type: 'expiry', channel: 'email' });
    } catch { /* handle error */ } finally { setSavingReminder(false); }
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

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (!contract) return <p className="text-foreground/30">Contract not found</p>;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
  const daysLeft = contract.end_date ? Math.ceil((new Date(contract.end_date) - new Date()) / 86400000) : null;
  const totalAssetValue = (contract.assets || []).reduce((s, a) => s + (a.monthly_rate || 0), 0);
  const versionHistory = contract.version_history || [];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'assets', label: `Assets (${(contract.assets || []).length})` },
    { key: 'invoices', label: `Invoices (${(contract.invoices || []).length})` },
    { key: 'reminders', label: `Reminders (${reminders.length})` },
    { key: 'versions', label: `Versions (${versionHistory.length})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/contracts')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Contracts
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl font-brand font-bold text-foreground">{contract.contract_number}</h1>
              <span className="px-2 py-0.5 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">v{contract.version || 1}</span>
            </div>
            <p className="text-foreground/30 text-sm truncate">
              <span className="text-rentr-primary hover:underline cursor-pointer" onClick={() => navigate(`/customers/${encodeURIComponent(contract.customer_email)}`)}>{contract.customer_name}</span>
              {' '}&middot; {contract.customer_email}
            </p>
            {contract.order_id && (
              <p className="text-foreground/40 text-xs mt-1">
                Order: <span className="text-rentr-primary hover:underline cursor-pointer" onClick={() => contract.order && navigate(`/orders/${contract.order.id}`)}>{contract.order_id}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={contract.status} />
            <select
              value={contract.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-rentr-primary/50 text-foreground/40"
            >
              {statusFlow.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Type</p>
            <p className="text-lg font-bold capitalize">{contract.type}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Start Date</p>
            <p className="text-sm font-bold">{contract.start_date || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">End Date</p>
            <p className="text-sm font-bold">{contract.end_date || '-'}{contract.extended_months > 0 && <span className="text-blue-400 text-xs ml-1">(+{contract.extended_months}mo)</span>}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Days Left</p>
            <p className={`text-lg font-bold ${daysLeft !== null && daysLeft <= 30 ? 'text-amber-500' : daysLeft !== null && daysLeft <= 0 ? 'text-red-500' : ''}`}>{daysLeft !== null ? daysLeft : '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Monthly Value</p>
            <p className="text-lg font-bold text-emerald-500">₹{fmt(totalAssetValue)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Signed</p>
            <p className="text-sm font-bold">{contract.signed_at ? new Date(contract.signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not signed'}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-foreground/[0.05]">
          <button onClick={handleViewPdf} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 text-foreground/60 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-all disabled:opacity-50">
            <Eye size={14} /> {pdfLoading ? 'Loading...' : 'Preview PDF'}
          </button>
          <button onClick={handleDownloadPdf} disabled={pdfLoading} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 text-foreground/60 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-all disabled:opacity-50">
            <Download size={14} /> Download PDF
          </button>
          <button onClick={() => navigate(`/contracts/${id}/edit`)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/5 text-foreground/60 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground/10 transition-all">
            <Pencil size={14} /> Edit
          </button>
          <button onClick={handleSendContract} disabled={sending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary/80 transition-all disabled:opacity-50">
            <Send size={14} /> {sending ? 'Sending...' : 'Send to Customer'}
          </button>
          {contract.status === 'pending_signature' && (
            <button onClick={handleGetSigningLink} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all">
              <Copy size={14} /> {signingUrl ? 'Copied!' : 'Signing Link'}
            </button>
          )}
          {(contract.status === 'active' || contract.status === 'expired') && (
            <button onClick={() => setExtendModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all">
              <CalendarPlus size={14} /> Extend
            </button>
          )}
          {(contract.status === 'expired' || contract.status === 'terminated') && (
            <button onClick={handleRenew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all">
              <RefreshCw size={14} /> Renew (New Version)
            </button>
          )}
        </div>

        {signingUrl && (
          <div className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs text-amber-500 font-mono truncate flex-1">{signingUrl}</span>
            <button onClick={() => navigator.clipboard.writeText(signingUrl)} className="text-amber-500 hover:text-amber-400 text-xs font-bold">Copy</button>
          </div>
        )}
      </div>

      {/* Terms */}
      {contract.terms && (
        <div className="glass rounded-2xl p-6">
          <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-2">Terms & Conditions</p>
          <p className="text-sm text-foreground/60 whitespace-pre-wrap">{contract.terms}</p>
        </div>
      )}

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <Package className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{(contract.assets || []).length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Assets</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <FileText className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{(contract.invoices || []).length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Invoices</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <CreditCard className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{(contract.payments || []).length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Payments</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <RotateCcw className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{(contract.returns || []).length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Returns</p>
          </div>

          {/* Linked tickets */}
          {(contract.tickets || []).length > 0 && (
            <div className="col-span-full glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Support Tickets</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {contract.tickets.map(t => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/support/${t.id}`)}>
                    <div>
                      <p className="text-sm font-bold">{t.ticket_number}</p>
                      <p className="text-xs text-foreground/30">{t.subject}</p>
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
        </div>
      )}

      {tab === 'assets' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {(contract.assets || []).length === 0 ? (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No assets linked to this contract</p>
            ) : (contract.assets || []).map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/assets/${a.id}`)}>
                <div>
                  <p className="text-sm font-bold font-mono">{a.uid}</p>
                  <p className="text-xs text-foreground/30">{a.oem} {a.model} {a.serial_number ? `· SN: ${a.serial_number}` : ''}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-sm font-bold">₹{fmt(a.monthly_rate)}<span className="text-foreground/30 text-xs">/mo</span></p>
                    {a.acquisition_cost && <p className="text-[10px] text-foreground/30">Cost: ₹{fmt(a.acquisition_cost)}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {a.condition_grade && (
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${a.condition_grade === 'A' ? 'bg-emerald-500/10 text-emerald-400' : a.condition_grade === 'B' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        Grade {a.condition_grade}
                      </span>
                    )}
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(contract.assets || []).length > 0 && (
            <div className="px-6 py-3 border-t border-foreground/[0.05] flex justify-between text-sm">
              <span className="text-foreground/30 font-bold">Total Monthly</span>
              <span className="font-bold text-emerald-500">₹{fmt(totalAssetValue)}/mo</span>
            </div>
          )}
        </div>
      )}

      {tab === 'invoices' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="divide-y divide-foreground/[0.03]">
              {(contract.invoices || []).length === 0 ? (
                <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No invoices</p>
              ) : (contract.invoices || []).map(i => (
                <div key={i.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/invoices/${i.id}`)}>
                  <div>
                    <p className="text-sm font-bold">{i.invoice_number}</p>
                    <p className="text-xs text-foreground/30">Due: {i.due_date || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold">₹{fmt(i.total)}</p>
                    <StatusBadge status={i.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          {(contract.payments || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Payments</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {contract.payments.map(p => (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">₹{fmt(p.amount)}</p>
                      <p className="text-xs text-foreground/30">{(p.method || '').replace(/_/g, ' ')} {p.transaction_id ? `· ${p.transaction_id}` : ''}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Returns */}
          {(contract.returns || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Returns</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {contract.returns.map(r => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/returns/${r.id}`)}>
                    <div>
                      <p className="text-sm font-bold">{r.return_number}</p>
                      <p className="text-xs text-foreground/30">{r.reason} · {Array.isArray(r.asset_uids) ? r.asset_uids.length : 0} asset(s)</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'reminders' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setReminderModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-all">
              <Plus size={14} /> Add Reminder
            </button>
          </div>
          <div className="glass rounded-2xl overflow-hidden">
            {reminders.length === 0 ? (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No reminders configured. Add one to get notified before contract expiry.</p>
            ) : (
              <div className="divide-y divide-foreground/[0.03]">
                {reminders.map(r => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${r.is_active ? 'bg-amber-500/20 text-amber-500' : 'bg-foreground/5 text-foreground/20'}`}>
                        {r.is_active ? <Bell size={16} /> : <BellOff size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{r.days_before} days before {r.reminder_type}</p>
                        <p className="text-[10px] text-foreground/30 uppercase tracking-wider">
                          via {r.channel} {r.last_sent_at ? `· Last: ${new Date(r.last_sent_at).toLocaleDateString('en-IN')}` : '· Never sent'}
                          {r.next_trigger_date && ` · Next: ${new Date(r.next_trigger_date).toLocaleDateString('en-IN')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleReminder(r)} className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${r.is_active ? 'bg-green-500/10 text-green-500' : 'bg-foreground/5 text-foreground/30'}`}>
                        {r.is_active ? 'Active' : 'Paused'}
                      </button>
                      <button onClick={() => handleDeleteReminder(r.id)} className="p-1.5 rounded-full text-foreground/20 hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'versions' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {versionHistory.length === 0 ? (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No version history</p>
            ) : versionHistory.map(v => (
              <div key={v.id} className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors ${v.id === contract.id ? 'bg-rentr-primary/5 border-l-2 border-rentr-primary' : ''}`} onClick={() => v.id !== contract.id && navigate(`/contracts/${v.id}`)}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{v.contract_number}</p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-foreground/5 text-foreground/40">v{v.version}</span>
                    {v.id === contract.id && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rentr-primary/10 text-rentr-primary">Current</span>}
                  </div>
                  <p className="text-xs text-foreground/30">{v.start_date} - {v.end_date}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {pdfViewerOpen && pdfBlobUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPdfViewerOpen(false)}>
          <div className="bg-background rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.05]">
              <h3 className="text-sm font-bold">Contract PDF Preview</h3>
              <button onClick={() => setPdfViewerOpen(false)} className="text-foreground/30 hover:text-foreground"><X size={20} /></button>
            </div>
            <iframe src={pdfBlobUrl} className="flex-1 w-full" title="Contract PDF" />
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {extendModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setExtendModal(false)}>
          <div className="bg-background rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Extend Contract</h3>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 block mb-1">Months to Extend</label>
              <input type="number" min={1} max={60} value={extendMonths} onChange={e => setExtendMonths(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/[0.05] text-foreground focus:outline-none focus:border-rentr-primary/50" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 block mb-1">Reason (optional)</label>
              <textarea value={extendReason} onChange={e => setExtendReason(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/[0.05] text-foreground focus:outline-none focus:border-rentr-primary/50" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setExtendModal(false)} className="px-4 py-2 rounded-lg text-foreground/40 text-xs font-bold hover:bg-foreground/5">Cancel</button>
              <button onClick={handleExtend} disabled={extending} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50">{extending ? 'Extending...' : 'Extend'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setReminderModal(false)}>
          <div className="bg-background rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Add Reminder</h3>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 block mb-1">Days Before Expiry</label>
              <input type="number" min={1} max={365} value={reminderForm.days_before} onChange={e => setReminderForm(p => ({ ...p, days_before: Number(e.target.value) }))} className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/[0.05] text-foreground focus:outline-none focus:border-rentr-primary/50" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 block mb-1">Type</label>
              <select value={reminderForm.reminder_type} onChange={e => setReminderForm(p => ({ ...p, reminder_type: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/[0.05] text-foreground focus:outline-none focus:border-rentr-primary/50">
                <option value="expiry">Expiry</option>
                <option value="renewal">Renewal</option>
                <option value="payment">Payment</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 block mb-1">Channel</label>
              <select value={reminderForm.channel} onChange={e => setReminderForm(p => ({ ...p, channel: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-foreground/[0.05] text-foreground focus:outline-none focus:border-rentr-primary/50">
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setReminderModal(false)} className="px-4 py-2 rounded-lg text-foreground/40 text-xs font-bold hover:bg-foreground/5">Cancel</button>
              <button onClick={handleAddReminder} disabled={savingReminder} className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 disabled:opacity-50">{savingReminder ? 'Saving...' : 'Add Reminder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
