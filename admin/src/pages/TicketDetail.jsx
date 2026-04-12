import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ExternalLink, Clock, AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import DetailTabs from '../components/DetailTabs';

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
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">{label}</span>
      <span className={`text-sm font-mono font-semibold ${isExpired ? 'text-red-400' : 'text-foreground/70'}`}>
        {remaining}
      </span>
      <span className="text-[10px] text-foreground/30">
        {new Date(deadline).toLocaleString()}
      </span>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
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
      // Refresh ticket to get updated advance_replacements
      const updated = await api.get(`/support/tickets/${id}`);
      setTicket(updated);
    } catch (err) {
      setArError(err?.message || 'Failed to create advance replacement.');
    } finally {
      setArSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!ticket) return (
    <div className="text-center py-20">
      <p className="text-foreground/30 text-sm mb-4">Ticket not found</p>
      <button onClick={() => navigate('/support')} className="text-rentr-primary text-sm hover:underline">Back to Support</button>
    </div>
  );

  const messages = ticket.messages || [];
  const pClasses = priorityColors[(ticket.priority || '').toLowerCase()] || 'bg-foreground/[0.05] text-foreground/60';
  const sla = slaColors[ticket.sla_status] || null;
  const advanceReplacements = ticket.advance_replacements || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/support')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Support
        </button>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${pClasses}`}>
            {ticket.priority}
          </span>
          <StatusBadge status={(ticket.status || '').replace(/_/g, ' ')} />
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              Ticket
            </span>
            <span className="text-[10px] font-mono text-foreground/20">{ticket.ticket_number}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            {ticket.subject}
          </h1>
        </div>
      </div>

      {/* SLA Tracking Card */}
      {ticket.sla_status && sla && (
        <div className={`${sla.bg} border ${sla.border} rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8`}>
          <div className="flex items-center gap-3 mb-4">
            {ticket.sla_status === 'on_track' && <Clock className={`w-5 h-5 ${sla.text}`} />}
            {ticket.sla_status === 'at_risk' && <AlertTriangle className={`w-5 h-5 ${sla.text}`} />}
            {ticket.sla_status === 'breached' && <ShieldAlert className={`w-5 h-5 ${sla.text}`} />}
            <h3 className="text-lg sm:text-xl font-brand font-black uppercase tracking-tight text-foreground">SLA Status</h3>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sla.text} ${sla.bg} border ${sla.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sla.dot}`} />
              {sla.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-8">
            <SlaCountdown label="Response Deadline" deadline={ticket.response_deadline} />
            <SlaCountdown label="Resolution Deadline" deadline={ticket.resolution_deadline} />
          </div>
        </div>
      )}

      {/* Tabbed Content */}
      <DetailTabs tabs={[
        {
          key: 'details',
          label: 'Details',
          content: (
            <>
              {/* Ticket info */}
              <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap gap-6 items-start justify-between">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Customer:</span> <span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(ticket.customer_email)}`)}>{ticket.customer_name}</span></div>
                      <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Email:</span> <span className="font-medium text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(ticket.customer_email)}`)}>{ticket.customer_email}</span></div>
                      <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Category:</span> <span className="font-medium capitalize">{ticket.category}</span></div>
                    </div>
                    {ticket.description && (
                      <p className="text-sm text-foreground/60 mt-2">{ticket.description}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Assign to..."
                      value={ticket.assigned_to || ''}
                      onChange={(e) => handleAssign(e.target.value)}
                      className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
                    />
                  </div>
                </div>
              </div>

              {/* Related Links */}
              {(ticket.order || ticket.order_id || ticket.asset || ticket.contract || ticket.invoice || ticket.return_request || ticket.customer_email) && (
                <div className="flex flex-wrap gap-2">
                  {ticket.order && (
                    <button
                      onClick={() => navigate(`/orders/${ticket.order.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15 hover:bg-blue-500/20 transition-colors"
                    >
                      Order: {ticket.order.order_number} ({ticket.order.status})
                      <ExternalLink size={12} />
                    </button>
                  )}
                  {!ticket.order && ticket.order_id && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/15">
                      Order: {ticket.order_id}
                    </span>
                  )}
                  {ticket.asset && (
                    <button
                      onClick={() => navigate(`/assets/${ticket.asset.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 hover:bg-cyan-500/20 transition-colors"
                    >
                      Asset: {ticket.asset.uid} ({ticket.asset.oem} {ticket.asset.model})
                      <ExternalLink size={12} />
                    </button>
                  )}
                  {!ticket.asset && ticket.asset_uid && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/15">
                      Asset: {ticket.asset_uid}
                    </span>
                  )}
                  {ticket.contract && (
                    <button
                      onClick={() => navigate(`/contracts/${ticket.contract.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20 transition-colors"
                    >
                      Contract: {ticket.contract.contract_number} ({ticket.contract.status})
                      <ExternalLink size={12} />
                    </button>
                  )}
                  {!ticket.contract && ticket.contract_id && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                      Contract: {ticket.contract_id}
                    </span>
                  )}
                  {ticket.invoice && (
                    <button
                      onClick={() => navigate(`/invoices/${ticket.invoice.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15 hover:bg-amber-500/20 transition-colors"
                    >
                      Invoice: {ticket.invoice.invoice_number} ({ticket.invoice.status})
                      <ExternalLink size={12} />
                    </button>
                  )}
                  {!ticket.invoice && ticket.invoice_id && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/15">
                      Invoice: {ticket.invoice_id}
                    </span>
                  )}
                  {ticket.return_request && (
                    <button
                      onClick={() => navigate(`/returns/${ticket.return_request.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/15 hover:bg-orange-500/20 transition-colors"
                    >
                      Return: {ticket.return_request.return_number} ({ticket.return_request.status})
                      <ExternalLink size={12} />
                    </button>
                  )}
                  {!ticket.return_request && ticket.return_id && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/15">
                      Return: {ticket.return_id}
                    </span>
                  )}
                  {ticket.customer_email && (
                    <button
                      onClick={() => navigate(`/customers/${encodeURIComponent(ticket.customer_email)}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/15 hover:bg-purple-500/20 transition-colors"
                    >
                      Customer: {ticket.customer_name || ticket.customer_email}
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              )}
            </>
          ),
        },
        {
          key: 'messages',
          label: 'Messages',
          count: messages.length,
          content: (
            <>
              {/* Messages */}
              <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] flex flex-col" style={{ minHeight: '300px' }}>
                <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-foreground/[0.05]">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Messages ({messages.length})</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-96">
                  {messages.length === 0 && (
                    <p className="text-center text-foreground/30 text-sm py-8">No messages yet.</p>
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
                <div className="border-t border-foreground/[0.05] p-6">
                  <div className="flex gap-3">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply..."
                      rows={2}
                      className="flex-1 bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-4 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          handleSendReply();
                        }
                      }}
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !reply.trim()}
                      className="self-end flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-foreground/30 mt-1">Ctrl+Enter to send</p>
                </div>
              </div>
            </>
          ),
        },
        {
          key: 'replacements',
          label: 'Replacements',
          count: advanceReplacements.length,
          content: (
            <>
              {/* Linked Advance Replacements */}
              {advanceReplacements.length > 0 && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="w-5 h-5 text-foreground/40" />
                    <h3 className="text-lg sm:text-xl font-brand font-black uppercase tracking-tight text-foreground">Advance Replacements ({advanceReplacements.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {advanceReplacements.map((ar, i) => (
                      <div key={ar.id || i} className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Faulty Asset</span>
                            <p className="font-mono text-foreground/70">{ar.faulty_asset_uid}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Replacement Asset</span>
                            <p className="font-mono text-foreground/70">{ar.replacement_asset_uid}</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Reason</span>
                            <p className="text-foreground/70">{ar.reason}</p>
                          </div>
                          {ar.notes && (
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Notes</span>
                              <p className="text-foreground/50">{ar.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
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
              )}

              {advanceReplacements.length === 0 && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
                  <p className="text-center text-foreground/30 text-sm py-8">No advance replacements yet.</p>
                </div>
              )}

              <button
                onClick={openArModal}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-foreground/[0.02] border border-foreground/[0.05] text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 hover:border-rentr-primary/50 hover:text-rentr-primary transition-all"
              >
                <RefreshCw size={14} />
                Initiate Advance Replacement
              </button>
            </>
          ),
        },
      ]} />

      {/* Advance Replacement Modal */}
      <Modal
        isOpen={arModalOpen}
        onClose={() => setArModalOpen(false)}
        title="Initiate Advance Replacement"
        footer={
          <>
            <button
              onClick={() => setArModalOpen(false)}
              className="px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-foreground/40 border border-foreground/[0.05] hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleArSubmit}
              disabled={arSubmitting}
              className="px-5 py-2.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50"
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
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-1.5">Faulty Asset UID</label>
            <input
              type="text"
              value={arForm.faulty_asset_uid}
              onChange={(e) => setArForm((f) => ({ ...f, faulty_asset_uid: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="e.g. AST-00123"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-1.5">Replacement Asset UID</label>
            <input
              type="text"
              value={arForm.replacement_asset_uid}
              onChange={(e) => setArForm((f) => ({ ...f, replacement_asset_uid: e.target.value }))}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10"
              placeholder="e.g. AST-00456"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-1.5">Reason</label>
            <textarea
              value={arForm.reason}
              onChange={(e) => setArForm((f) => ({ ...f, reason: e.target.value }))}
              rows={2}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10 resize-none"
              placeholder="Reason for advance replacement"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-1.5">Notes</label>
            <textarea
              value={arForm.notes}
              onChange={(e) => setArForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/10 resize-none"
              placeholder="Additional notes (optional)"
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
