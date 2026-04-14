import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ExternalLink, Clock, AlertTriangle, ShieldAlert, RefreshCw, MessageSquare, Info, Wrench } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const statusOptions = ['open', 'in_progress', 'resolved', 'closed'];
const priorityColors = {
  low: 'bg-blue-500/10 text-blue-400',
  medium: 'bg-yellow-500/10 text-yellow-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
};

const slaColors = {
  on_track: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'On Track' },
  at_risk: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400', label: 'At Risk' },
  breached: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-400', label: 'Breached' },
};

const arStatusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
  shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
  completed: 'bg-green-500/10 text-green-400 border-green-500/15',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/15',
};

function useCountdown(deadline) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!deadline) { setRemaining(''); return; }

    const calc = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) return 'Expired';
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        return `${d}d ${h % 24}h`;
      }
      return `${h}h ${m}m ${s}s`;
    };

    setRemaining(calc());
    const interval = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return remaining;
}

function SlaCountdown({ label, deadline }) {
  const remaining = useCountdown(deadline);
  if (!deadline) return null;

  const isExpired = remaining === 'Expired';

  return (
    <div>
      <p className="text-[10px] text-foreground/25 uppercase tracking-widest">{label}</p>
      <p className={`text-sm font-mono font-bold ${isExpired ? 'text-red-400' : 'text-foreground'}`}>
        {remaining}
      </p>
      <p className="text-[10px] text-foreground/30">{new Date(deadline).toLocaleString()}</p>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('details');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEnd = useRef(null);

  // Advance Replacement modal state
  const [arModalOpen, setArModalOpen] = useState(false);
  const [arForm, setArForm] = useState({ faulty_asset_uid: '', replacement_asset_uid: '', reason: '', notes: '' });
  const [arSubmitting, setArSubmitting] = useState(false);
  const [arError, setArError] = useState('');

  useEffect(() => {
    api.get(`/support/tickets/${id}`)
      .then(setTicket)
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/support/tickets/${id}/messages`, {
        message: reply,
        sender: 'Admin',
        sender_type: 'agent',
      });
      const updated = await api.get(`/support/tickets/${id}`);
      setTicket(updated);
      setReply('');
    } catch {
      // handle error
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await api.patch(`/support/tickets/${id}`, { status });
      setTicket((prev) => ({ ...prev, status }));
    } catch {
      // handle error
    }
  };

  const handleAssign = async (assigned_to) => {
    try {
      await api.patch(`/support/tickets/${id}`, { assigned_to });
      setTicket((prev) => ({ ...prev, assigned_to }));
    } catch {
      // handle error
    }
  };

  const openArModal = () => {
    setArForm({
      faulty_asset_uid: ticket.asset_uid || ticket.asset?.uid || '',
      replacement_asset_uid: '',
      reason: '',
      notes: '',
    });
    setArError('');
    setArModalOpen(true);
  };

  const handleArSubmit = async () => {
    if (!arForm.faulty_asset_uid.trim() || !arForm.replacement_asset_uid.trim() || !arForm.reason.trim()) {
      setArError('Faulty asset UID, replacement asset UID, and reason are required.');
      return;
    }
    setArSubmitting(true);
    setArError('');
    try {
      await api.post('/advance-replacements/', {
        order_id: ticket.order_id || ticket.order?.id,
        faulty_asset_uid: arForm.faulty_asset_uid,
        replacement_asset_uid: arForm.replacement_asset_uid,
        reason: arForm.reason,
        notes: arForm.notes,
      });
      setArModalOpen(false);
      const updated = await api.get(`/support/tickets/${id}`);
      setTicket(updated);
    } catch (err) {
      setArError(err?.message || 'Failed to create advance replacement.');
    } finally {
      setArSubmitting(false);
    }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;

  if (!ticket) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/support')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Support
      </button>
      <div className="glass rounded-2xl p-8 text-center text-foreground/20 text-xs italic">Ticket not found</div>
    </div>
  );

  const messages = ticket.messages || [];
  const pClasses = priorityColors[(ticket.priority || '').toLowerCase()] || 'bg-foreground/[0.05] text-foreground/60';
  const sla = slaColors[ticket.sla_status] || null;
  const advanceReplacements = ticket.advance_replacements || [];

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'messages', label: `Messages (${messages.length})` },
    { key: 'replacements', label: `Replacements (${advanceReplacements.length})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/support')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Support
      </button>

      {/* Header Card */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rentr-primary/10 text-rentr-primary">Ticket</span>
              <span className="font-mono text-xs text-foreground/25">{ticket.ticket_number}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-brand font-bold text-foreground">{ticket.subject}</h1>
            <p className="text-foreground/30 text-sm truncate">
              <span className="cursor-pointer hover:text-rentr-primary transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(ticket.customer_email)}`)}>
                {ticket.customer_name}
              </span>
              {' '}&middot;{' '}{ticket.customer_email}
            </p>
            {ticket.description && <p className="text-foreground/40 text-xs mt-1 max-w-xl">{ticket.description}</p>}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${pClasses}`}>
              {ticket.priority}
            </span>
            <StatusBadge status={(ticket.status || '').replace(/_/g, ' ')} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Category</p>
            <p className="text-sm font-bold capitalize">{ticket.category || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Assigned To</p>
            <p className="text-sm font-bold">{ticket.assigned_to || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Messages</p>
            <p className="text-sm font-bold">{messages.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Replacements</p>
            <p className="text-sm font-bold">{advanceReplacements.length}</p>
          </div>
          {sla && (
            <div>
              <p className="text-[10px] text-foreground/25 uppercase tracking-widest">SLA Status</p>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${sla.text} ${sla.bg} border ${sla.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sla.dot}`} />
                {sla.label}
              </span>
            </div>
          )}
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Status</p>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-2 py-1 text-xs text-foreground/60 mt-0.5"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SLA Tracking Card */}
      {ticket.sla_status && sla && (
        <div className={`${sla.bg} border ${sla.border} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            {ticket.sla_status === 'on_track' && <Clock className={`w-5 h-5 ${sla.text}`} />}
            {ticket.sla_status === 'at_risk' && <AlertTriangle className={`w-5 h-5 ${sla.text}`} />}
            {ticket.sla_status === 'breached' && <ShieldAlert className={`w-5 h-5 ${sla.text}`} />}
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">SLA Countdown</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SlaCountdown label="Response Deadline" deadline={ticket.response_deadline} />
            <SlaCountdown label="Resolution Deadline" deadline={ticket.resolution_deadline} />
          </div>
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
      {tab === 'details' && (
        <div className="space-y-6">
          {/* Assign */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-foreground/[0.03]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Assignment</h3>
            </div>
            <div className="px-6 py-4">
              <input
                type="text"
                placeholder="Assign to..."
                value={ticket.assigned_to || ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full max-w-sm bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/20"
              />
            </div>
          </div>

          {/* Related Links */}
          {(ticket.order || ticket.order_id || ticket.asset || ticket.asset_uid || ticket.contract || ticket.contract_id || ticket.invoice || ticket.invoice_id || ticket.return_request || ticket.return_id || ticket.customer_email) && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.03]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Related Items</h3>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {ticket.order && (
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/orders/${ticket.order.id}`)}>
                    <div>
                      <p className="text-sm font-bold">Order: {ticket.order.order_number}</p>
                      <p className="text-xs text-foreground/30">{ticket.order.status}</p>
                    </div>
                    <ExternalLink size={14} className="text-foreground/20" />
                  </div>
                )}
                {!ticket.order && ticket.order_id && (
                  <div className="px-6 py-4">
                    <p className="text-sm font-bold">Order: {ticket.order_id}</p>
                  </div>
                )}
                {ticket.asset && (
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/assets/${ticket.asset.id}`)}>
                    <div>
                      <p className="text-sm font-bold">Asset: {ticket.asset.uid}</p>
                      <p className="text-xs text-foreground/30">{ticket.asset.oem} {ticket.asset.model}</p>
                    </div>
                    <ExternalLink size={14} className="text-foreground/20" />
                  </div>
                )}
                {!ticket.asset && ticket.asset_uid && (
                  <div className="px-6 py-4">
                    <p className="text-sm font-bold">Asset: {ticket.asset_uid}</p>
                  </div>
                )}
                {ticket.contract && (
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/contracts/${ticket.contract.id}`)}>
                    <div>
                      <p className="text-sm font-bold">Contract: {ticket.contract.contract_number}</p>
                      <p className="text-xs text-foreground/30">{ticket.contract.status}</p>
                    </div>
                    <ExternalLink size={14} className="text-foreground/20" />
                  </div>
                )}
                {!ticket.contract && ticket.contract_id && (
                  <div className="px-6 py-4">
                    <p className="text-sm font-bold">Contract: {ticket.contract_id}</p>
                  </div>
                )}
                {ticket.invoice && (
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/invoices/${ticket.invoice.id}`)}>
                    <div>
                      <p className="text-sm font-bold">Invoice: {ticket.invoice.invoice_number}</p>
                      <p className="text-xs text-foreground/30">{ticket.invoice.status}</p>
                    </div>
                    <ExternalLink size={14} className="text-foreground/20" />
                  </div>
                )}
                {!ticket.invoice && ticket.invoice_id && (
                  <div className="px-6 py-4">
                    <p className="text-sm font-bold">Invoice: {ticket.invoice_id}</p>
                  </div>
                )}
                {ticket.return_request && (
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/returns/${ticket.return_request.id}`)}>
                    <div>
                      <p className="text-sm font-bold">Return: {ticket.return_request.return_number}</p>
                      <p className="text-xs text-foreground/30">{ticket.return_request.status}</p>
                    </div>
                    <ExternalLink size={14} className="text-foreground/20" />
                  </div>
                )}
                {!ticket.return_request && ticket.return_id && (
                  <div className="px-6 py-4">
                    <p className="text-sm font-bold">Return: {ticket.return_id}</p>
                  </div>
                )}
                {ticket.customer_email && (
                  <div className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/customers/${encodeURIComponent(ticket.customer_email)}`)}>
                    <div>
                      <p className="text-sm font-bold">Customer: {ticket.customer_name || ticket.customer_email}</p>
                      <p className="text-xs text-foreground/30">{ticket.customer_email}</p>
                    </div>
                    <ExternalLink size={14} className="text-foreground/20" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '300px' }}>
          <div className="px-6 py-4 border-b border-foreground/[0.03]">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50">Messages ({messages.length})</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
            {messages.length === 0 && (
              <p className="text-center text-foreground/20 text-xs italic py-8">No messages yet.</p>
            )}
            {messages.map((msg, i) => {
              const isAgent = msg.sender_type === 'agent';
              return (
                <div key={i} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isAgent ? 'bg-rentr-primary text-white' : 'bg-foreground/[0.05] text-foreground'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${isAgent ? 'text-white/80' : 'text-foreground/40'}`}>
                        {msg.sender_name || (isAgent ? 'Agent' : 'Customer')}
                      </span>
                      <span className={`text-xs ${isAgent ? 'text-white/60' : 'text-foreground/30'}`}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message || msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEnd} />
          </div>

          {/* Reply box */}
          <div className="border-t border-foreground/[0.03] p-6">
            <div className="flex gap-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows={2}
                className="flex-1 bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/20 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSendReply();
                  }
                }}
              />
              <button
                onClick={handleSendReply}
                disabled={sending || !reply.trim()}
                className="self-end flex items-center gap-2 px-5 py-3 rounded-lg bg-rentr-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-foreground/25 mt-1">Ctrl+Enter to send</p>
          </div>
        </div>
      )}

      {tab === 'replacements' && (
        <div className="space-y-6">
          {advanceReplacements.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-foreground/[0.03]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/50 flex items-center gap-2">
                  <RefreshCw size={14} className="text-foreground/30" /> Advance Replacements ({advanceReplacements.length})
                </h3>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {advanceReplacements.map((ar, i) => (
                  <div key={ar.id || i} className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Faulty Asset</p>
                        <p className="font-mono font-bold">{ar.faulty_asset_uid}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Replacement Asset</p>
                        <p className="font-mono font-bold">{ar.replacement_asset_uid}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Reason</p>
                        <p className="text-foreground/70">{ar.reason}</p>
                      </div>
                      {ar.notes && (
                        <div>
                          <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Notes</p>
                          <p className="text-foreground/50">{ar.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${arStatusColors[ar.status] || 'bg-foreground/[0.05] text-foreground/60 border-foreground/10'}`}>
                        {ar.status}
                      </span>
                      {ar.created_at && (
                        <span className="text-[10px] text-foreground/30">{new Date(ar.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center text-foreground/20 text-xs italic">No advance replacements yet.</div>
          )}

          <button
            onClick={openArModal}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-foreground/[0.03] border border-foreground/[0.08] text-xs font-bold uppercase tracking-widest text-foreground/40 hover:border-rentr-primary/50 hover:text-rentr-primary transition-all"
          >
            <RefreshCw size={14} />
            Initiate Advance Replacement
          </button>
        </div>
      )}

      {/* Advance Replacement Modal */}
      <Modal
        isOpen={arModalOpen}
        onClose={() => setArModalOpen(false)}
        title="Initiate Advance Replacement"
        footer={
          <>
            <button
              onClick={() => setArModalOpen(false)}
              className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-foreground/40 border border-foreground/[0.08] hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleArSubmit}
              disabled={arSubmitting}
              className="px-5 py-2.5 rounded-lg bg-rentr-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-rentr-primary-light transition-all disabled:opacity-50"
            >
              {arSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {arError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {arError}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-1.5">Faulty Asset UID</label>
            <input
              type="text"
              value={arForm.faulty_asset_uid}
              onChange={(e) => setArForm((f) => ({ ...f, faulty_asset_uid: e.target.value }))}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/20"
              placeholder="e.g. AST-00123"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-1.5">Replacement Asset UID</label>
            <input
              type="text"
              value={arForm.replacement_asset_uid}
              onChange={(e) => setArForm((f) => ({ ...f, replacement_asset_uid: e.target.value }))}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/20"
              placeholder="e.g. AST-00456"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-1.5">Reason</label>
            <textarea
              value={arForm.reason}
              onChange={(e) => setArForm((f) => ({ ...f, reason: e.target.value }))}
              rows={2}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/20 resize-none"
              placeholder="Reason for advance replacement"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-1.5">Notes</label>
            <textarea
              value={arForm.notes}
              onChange={(e) => setArForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/20 resize-none"
              placeholder="Additional notes (optional)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
