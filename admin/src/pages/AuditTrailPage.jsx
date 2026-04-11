import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { History, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const ENTITY_TYPES = [
  { value: '', label: 'All Entities' },
  { value: 'order', label: 'Order' },
  { value: 'contract', label: 'Contract' },
  { value: 'asset', label: 'Asset' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'customer', label: 'Customer' },
  { value: 'partner', label: 'Partner' },
  { value: 'payment', label: 'Payment' },
  { value: 'return', label: 'Return' },
  { value: 'ticket', label: 'Ticket' },
];

const ACTION_COLORS = {
  created: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  updated: 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  deleted: 'bg-red-500/10 text-red-400 border border-red-500/15',
};

function formatChanges(changes) {
  if (!changes || typeof changes !== 'object') return null;
  return Object.entries(changes).map(([field, vals]) => {
    const oldVal = vals?.old ?? vals?.from ?? '-';
    const newVal = vals?.new ?? vals?.to ?? '-';
    return { field, old: String(oldVal), new: String(newVal) };
  });
}

function ExpandedRow({ event }) {
  const changes = formatChanges(event.changes);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="px-6 py-5 bg-foreground/[0.015] border-t border-foreground/[0.03]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Details */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-3">
            Field Changes
          </h4>
          {changes && changes.length > 0 ? (
            <div className="space-y-2">
              {changes.map((c, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="font-mono font-bold text-foreground/50 min-w-[120px]">{c.field}</span>
                  <span className="text-red-400/70 line-through">{c.old}</span>
                  <span className="text-foreground/20">&rarr;</span>
                  <span className="text-emerald-400">{c.new}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-foreground/30">No field-level changes recorded.</p>
          )}
        </div>

        {/* Raw JSON */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-3">
            Raw Data
          </h4>
          <pre className="text-[11px] font-mono text-foreground/40 bg-foreground/[0.03] border border-foreground/[0.05] rounded-lg p-4 overflow-x-auto max-h-48">
            {JSON.stringify(event._raw || event, null, 2)}
          </pre>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 flex flex-wrap gap-6 text-[10px] text-foreground/30">
        {event.ip_address && <span>IP: {event.ip_address}</span>}
        {event.user_agent && <span>Agent: {event.user_agent}</span>}
        {event.request_id && <span>Request ID: {event.request_id}</span>}
      </div>
    </motion.div>
  );
}

export default function AuditTrailPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [user, setUser] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (entityType) params.set('entity_type', entityType);
    if (user) params.set('user', user);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    const qs = params.toString() ? `?${params.toString()}` : '';

    api.get(`/audit-trail/${qs}`)
      .then((data) => {
        const mapped = (data.items || data.results || data || []).map((e) => ({
          id: e.id,
          timestamp: e.timestamp || e.created_at,
          timestampFormatted: e.timestamp || e.created_at
            ? new Date(e.timestamp || e.created_at).toLocaleString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              })
            : '-',
          user: e.user || e.user_email || e.performed_by || '-',
          action: e.action || e.event_type || '-',
          entityType: e.entity_type || e.resource_type || '-',
          entityId: e.entity_id || e.resource_id || '-',
          changeSummary: e.changes
            ? `${Object.keys(e.changes).length} field(s) changed`
            : e.action === 'created' ? 'Record created' : '-',
          changes: e.changes,
          ip_address: e.ip_address,
          user_agent: e.user_agent,
          request_id: e.request_id,
          _raw: e,
        }));
        setEvents(Array.isArray(mapped) ? mapped : []);
        setError('');
      })
      .catch(() => {
        setEvents([]);
        setError('');
      })
      .finally(() => setLoading(false));
  }, [search, entityType, user, dateFrom, dateTo]);

  const toggleRow = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const columns = [
    {
      key: 'expand',
      label: '',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); toggleRow(row.id); }}
          className="text-foreground/20 hover:text-foreground/60 transition-colors"
        >
          {expandedRows.has(row.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      ),
    },
    { key: 'timestampFormatted', label: 'Timestamp' },
    { key: 'user', label: 'User' },
    {
      key: 'action',
      label: 'Action',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ACTION_COLORS[v] || 'bg-foreground/5 text-foreground/40 border border-foreground/10'}`}>
          {v}
        </span>
      ),
    },
    {
      key: 'entityType',
      label: 'Entity Type',
      render: (v) => (
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/50">{v}</span>
      ),
    },
    {
      key: 'entityId',
      label: 'Entity ID',
      render: (v) => (
        <span className="font-mono text-xs text-foreground/50">{v}</span>
      ),
    },
    { key: 'changeSummary', label: 'Changes' },
  ];

  const renderExpandedRow = (row) => {
    if (!expandedRows.has(row.id)) return null;
    return <ExpandedRow event={row} />;
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Compliance</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase">
            Audit Trail
          </motion.h1>
          <motion.p variants={item} className="text-xs text-foreground/30 mt-2 tracking-wide">
            Immutable log of all system changes &middot; 7-year retention
          </motion.p>
        </div>

        <motion.div variants={item} className="flex items-center flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
            <input
              type="text"
              placeholder="SEARCH AUDIT LOG"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 pl-12 pr-6 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all w-full sm:w-64 placeholder:text-foreground/10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              showFilters
                ? 'bg-rentr-primary/10 border-rentr-primary/30 text-rentr-primary'
                : 'bg-foreground/[0.02] border-foreground/[0.05] text-foreground/40 hover:border-foreground/10'
            }`}
          >
            <Filter size={14} />
            Filters
            {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </motion.div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Entity Type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-2">
                Entity Type
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full bg-foreground/[0.03] border border-foreground/[0.05] rounded-lg py-2.5 px-3 text-xs text-foreground/70 focus:outline-none focus:border-rentr-primary/50 transition-all appearance-none"
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* User */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-2">
                User
              </label>
              <input
                type="text"
                placeholder="Filter by user..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full bg-foreground/[0.03] border border-foreground/[0.05] rounded-lg py-2.5 px-3 text-xs text-foreground/70 focus:outline-none focus:border-rentr-primary/50 transition-all placeholder:text-foreground/15"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-foreground/[0.03] border border-foreground/[0.05] rounded-lg py-2.5 px-3 text-xs text-foreground/70 focus:outline-none focus:border-rentr-primary/50 transition-all"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-foreground/[0.03] border border-foreground/[0.05] rounded-lg py-2.5 px-3 text-xs text-foreground/70 focus:outline-none focus:border-rentr-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(entityType || user || dateFrom || dateTo) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => { setEntityType(''); setUser(''); setDateFrom(''); setDateTo(''); }}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <div className="bg-yellow-500/5 border border-yellow-500/15 text-yellow-400 text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Audit Events Table */}
      <div className="border-t border-foreground/[0.05]">
        <DataTable
          columns={columns}
          data={events}
          loading={loading}
          onRowClick={(row) => toggleRow(row.id)}
          renderExpandedRow={renderExpandedRow}
          emptyMessage="No audit events recorded yet. All system changes will be logged here automatically."
          emptyIcon={<History size={40} className="text-foreground/10" />}
          exportFilename="rentr-audit-trail"
        />
      </div>
    </motion.div>
  );
}
