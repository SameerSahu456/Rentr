import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileBarChart, Download, Calendar, Clock, Mail, Plus, Play, Filter } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } },
};

const QUICK_REPORTS = [
  {
    key: 'revenue_summary',
    title: 'Revenue Summary',
    description: 'Revenue breakdown by customer and month with trend analysis.',
    icon: '₹',
    endpoint: '/reports/revenue-summary',
  },
  {
    key: 'asset_utilization',
    title: 'Asset Utilization',
    description: 'Deployment rates, idle time, and utilization percentages across your fleet.',
    icon: '▦',
    endpoint: '/reports/asset-utilization',
  },
  {
    key: 'contract_expiry',
    title: 'Contract Expiry',
    description: 'Upcoming contract expirations within the next 30, 60, and 90 days.',
    icon: '⏳',
    endpoint: '/reports/contract-expiry',
  },
  {
    key: 'overdue_invoices',
    title: 'Overdue Invoices',
    description: 'All unpaid invoices past their due date with aging buckets.',
    icon: '⚠',
    endpoint: '/reports/overdue-invoices',
  },
  {
    key: 'return_damage',
    title: 'Return & Damage',
    description: 'Return volumes, damage rates, and associated recovery costs.',
    icon: '↩',
    endpoint: '/reports/return-damage',
  },
  {
    key: 'partner_performance',
    title: 'Partner Performance',
    description: 'Order volume, revenue contribution, and SLA adherence by partner.',
    icon: '★',
    endpoint: '/reports/partner-performance',
  },
  {
    key: 'sla_compliance',
    title: 'SLA Compliance',
    description: 'Ticket resolution times, breach rates, and compliance scores.',
    icon: '✓',
    endpoint: '/reports/sla-compliance',
  },
];

const ENTITY_TYPES = [
  { value: 'orders', label: 'Orders' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'assets', label: 'Assets' },
  { value: 'returns', label: 'Returns' },
  { value: 'tickets', label: 'Tickets' },
];

const GROUP_BY_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'category', label: 'Category' },
  { value: 'status', label: 'Status' },
  { value: 'month', label: 'Month' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReportsPage() {
  // Quick report state
  const [generatingReport, setGeneratingReport] = useState(null);
  const [quickReportData, setQuickReportData] = useState(null);
  const [quickReportTitle, setQuickReportTitle] = useState('');

  // Custom report builder state
  const [entity, setEntity] = useState('orders');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [groupBy, setGroupBy] = useState('status');
  const [customData, setCustomData] = useState(null);
  const [customColumns, setCustomColumns] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);

  // Scheduled reports state
  const [scheduled, setScheduled] = useState([]);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    report_type: 'revenue_summary',
    frequency: 'weekly',
    recipients: '',
  });
  const [scheduleSaving, setScheduleSaving] = useState(false);

  useEffect(() => {
    api.get('/reports/scheduled').then((res) => {
      setScheduled(Array.isArray(res) ? res : res?.data || []);
    }).catch(() => setScheduled([])).finally(() => setScheduledLoading(false));
  }, []);

  // --- Quick Report ---
  const handleGenerateQuick = async (report) => {
    setGeneratingReport(report.key);
    setQuickReportData(null);
    try {
      const res = await api.get(report.endpoint);
      const rows = Array.isArray(res) ? res : res?.data || [];
      setQuickReportData(rows);
      setQuickReportTitle(report.title);
    } catch {
      setQuickReportData([]);
      setQuickReportTitle(report.title);
    } finally {
      setGeneratingReport(null);
    }
  };

  // --- Custom Report ---
  const handleGenerateCustom = async () => {
    setCustomLoading(true);
    setCustomData(null);
    try {
      const params = new URLSearchParams({ entity, group_by: groupBy });
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      const res = await api.get(`/reports/custom?${params.toString()}`);
      const rows = Array.isArray(res) ? res : res?.data || [];
      if (rows.length > 0) {
        setCustomColumns(Object.keys(rows[0]).map((k) => ({ key: k, label: k.replace(/_/g, ' ') })));
      } else {
        setCustomColumns([]);
      }
      setCustomData(rows);
    } catch {
      setCustomData([]);
      setCustomColumns([]);
    } finally {
      setCustomLoading(false);
    }
  };

  // --- Schedule Report ---
  const handleScheduleSave = async () => {
    setScheduleSaving(true);
    try {
      const payload = {
        ...scheduleForm,
        recipients: scheduleForm.recipients.split(',').map((e) => e.trim()).filter(Boolean),
      };
      const res = await api.post('/reports/scheduled', payload);
      setScheduled((prev) => [...prev, res]);
      setScheduleModal(false);
      setScheduleForm({ report_type: 'revenue_summary', frequency: 'weekly', recipients: '' });
    } catch {
      // silently handle
    } finally {
      setScheduleSaving(false);
    }
  };

  // --- CSV export for custom data ---
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(','),
      ...data.map((row) => keys.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Derive quick-report columns from data
  const quickColumns = quickReportData && quickReportData.length > 0
    ? Object.keys(quickReportData[0]).map((k) => ({ key: k, label: k.replace(/_/g, ' ') }))
    : [];

  // Scheduled report table columns
  const scheduledColumns = [
    { key: 'report_type', label: 'Report', render: (v) => v?.replace(/_/g, ' ') || v },
    { key: 'frequency', label: 'Frequency', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'recipients', label: 'Recipients', render: (v) => (Array.isArray(v) ? v.join(', ') : v || '—') },
    { key: 'last_run', label: 'Last Run', render: (v) => formatDate(v) },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="min-h-[calc(100vh-8rem)] grid-lines -m-4 lg:-m-6 xl:-m-8">
      {/* Hero */}
      <section className="px-6 lg:px-12 pt-8 lg:pt-12 pb-12 lg:pb-20 border-b border-foreground/[0.05]">
        <motion.div variants={item} className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-rentr-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Reporting Suite</span>
        </motion.div>
        <motion.h1 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-brand font-black tracking-[-0.04em] leading-[0.9] text-gradient">
          REPORTS &<br />INSIGHTS
        </motion.h1>
      </section>

      {/* Quick Reports */}
      <section className="border-b border-foreground/[0.05]">
        <motion.div variants={item} className="px-6 lg:px-12 pt-8 pb-4 flex items-center gap-3">
          <FileBarChart className="w-4 h-4 text-rentr-primary" />
          <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Quick Reports</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {QUICK_REPORTS.map((report, i) => (
            <motion.div
              key={report.key}
              variants={item}
              className="p-6 lg:p-8 border-b border-r border-foreground/[0.05] group hover:bg-foreground/[0.02] transition-colors duration-700 flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="text-2xl leading-none select-none">{report.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/15 group-hover:text-foreground/30 transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-sm font-brand font-black uppercase tracking-wide text-foreground group-hover:text-rentr-primary transition-colors duration-500 mb-2">
                  {report.title}
                </h3>
                <p className="text-[11px] leading-relaxed text-foreground/30 group-hover:text-foreground/50 transition-colors">
                  {report.description}
                </p>
              </div>
              <button
                onClick={() => handleGenerateQuick(report)}
                disabled={generatingReport === report.key}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-rentr-primary transition-colors disabled:opacity-40"
              >
                {generatingReport === report.key ? (
                  <div className="w-3 h-3 border border-rentr-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={10} />
                )}
                Generate
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Report Results */}
      {quickReportData && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="px-6 lg:px-12 py-8 border-b border-foreground/[0.05]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-brand font-black uppercase tracking-tight text-foreground">{quickReportTitle}</h2>
            <div className="flex items-center gap-3">
              {quickReportData.length > 0 && (
                <button
                  onClick={() => exportCSV(quickReportData, quickReportTitle.toLowerCase().replace(/\s+/g, '_'))}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/[0.08] text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-rentr-primary hover:border-rentr-primary/30 transition-colors"
                >
                  <Download size={12} />
                  Export CSV
                </button>
              )}
              <button
                onClick={() => { setQuickReportData(null); setQuickReportTitle(''); }}
                className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground/60 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <DataTable columns={quickColumns} data={quickReportData} emptyMessage="No data returned for this report." />
        </motion.section>
      )}

      {/* Custom Report Builder */}
      <section className="border-b border-foreground/[0.05]">
        <motion.div variants={item} className="px-6 lg:px-12 pt-8 pb-4 flex items-center gap-3">
          <Filter className="w-4 h-4 text-rentr-primary" />
          <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Custom Report Builder</h2>
        </motion.div>
        <motion.div variants={item} className="px-6 lg:px-12 pb-8">
          <div className="p-6 lg:p-8 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.05]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Entity Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Entity Type</label>
                <select
                  value={entity}
                  onChange={(e) => setEntity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:border-rentr-primary/40 transition-colors"
                >
                  {ENTITY_TYPES.map((et) => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Date From</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:border-rentr-primary/40 transition-colors"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Date To</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:border-rentr-primary/40 transition-colors"
                  />
                </div>
              </div>

              {/* Group By */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Group By</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:border-rentr-primary/40 transition-colors"
                >
                  {GROUP_BY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateCustom}
              disabled={customLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-rentr-primary text-white text-[11px] font-bold uppercase tracking-widest hover:bg-rentr-primary/90 transition-colors disabled:opacity-50"
            >
              {customLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Generate Report
            </button>
          </div>

          {/* Custom Report Results */}
          {customData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="mt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-brand font-bold uppercase tracking-wide text-foreground/60">
                  {ENTITY_TYPES.find((e) => e.value === entity)?.label} grouped by {groupBy}
                </h3>
                {customData.length > 0 && (
                  <button
                    onClick={() => exportCSV(customData, `${entity}_by_${groupBy}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/[0.08] text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-rentr-primary hover:border-rentr-primary/30 transition-colors"
                  >
                    <Download size={12} />
                    Export CSV
                  </button>
                )}
              </div>
              <DataTable columns={customColumns} data={customData} emptyMessage="No data returned for this query." exportFilename={`${entity}_by_${groupBy}`} />
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Scheduled Reports */}
      <section className="px-6 lg:px-12 py-8">
        <motion.div variants={item} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-rentr-primary" />
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Scheduled Reports</h2>
          </div>
          <button
            onClick={() => setScheduleModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary/90 transition-colors"
          >
            <Plus size={14} />
            Schedule New
          </button>
        </motion.div>
        <motion.div variants={item}>
          <DataTable
            columns={scheduledColumns}
            data={scheduled}
            loading={scheduledLoading}
            emptyMessage="No scheduled reports yet. Create one to automate recurring reports."
            emptyIcon={<Clock className="w-8 h-8 text-foreground/10 mb-3" />}
          />
        </motion.div>
      </section>

      {/* Schedule Modal */}
      <Modal
        isOpen={scheduleModal}
        onClose={() => setScheduleModal(false)}
        title="Schedule New Report"
        footer={
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-foreground/[0.05]">
            <button
              onClick={() => setScheduleModal(false)}
              className="px-5 py-2.5 rounded-full border border-foreground/[0.08] text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleSave}
              disabled={scheduleSaving || !scheduleForm.recipients.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rentr-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary/90 transition-colors disabled:opacity-50"
            >
              {scheduleSaving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Calendar size={12} />
              )}
              Schedule
            </button>
          </div>
        }
      >
        <div className="p-6 space-y-5">
          {/* Report Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Report Type</label>
            <select
              value={scheduleForm.report_type}
              onChange={(e) => setScheduleForm((f) => ({ ...f, report_type: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/[0.08] text-sm text-foreground focus:outline-none focus:border-rentr-primary/40 transition-colors"
            >
              {QUICK_REPORTS.map((r) => (
                <option key={r.key} value={r.key}>{r.title}</option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Frequency</label>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setScheduleForm((f) => ({ ...f, frequency: freq.value }))}
                  className={`flex-1 px-4 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-colors ${
                    scheduleForm.frequency === freq.value
                      ? 'border-rentr-primary bg-rentr-primary/10 text-rentr-primary'
                      : 'border-foreground/[0.08] text-foreground/30 hover:text-foreground/50 hover:border-foreground/15'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
              <Mail className="w-3 h-3 inline mr-1.5 -mt-0.5" />
              Email Recipients
            </label>
            <input
              type="text"
              value={scheduleForm.recipients}
              onChange={(e) => setScheduleForm((f) => ({ ...f, recipients: e.target.value }))}
              placeholder="email@example.com, another@example.com"
              className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/[0.08] text-sm text-foreground placeholder:text-foreground/15 focus:outline-none focus:border-rentr-primary/40 transition-colors"
            />
            <p className="text-[10px] text-foreground/20">Separate multiple emails with commas.</p>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
