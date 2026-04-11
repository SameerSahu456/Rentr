import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import {
  IndianRupee, TrendingUp, AlertTriangle, HardDrive, Package, Wrench, Warehouse,
  Clock, ArrowUpRight, BarChart3, Users, Percent, ShieldCheck, RotateCcw,
  Truck, CircleDollarSign, Scale, Handshake, Headphones, FileCheck,
  Activity, Timer, Replace, Award, CreditCard, FileWarning, Gauge, Layers,
  CheckCircle, XCircle, AlertCircle, ArrowDownRight,
} from 'lucide-react';
import api from '../services/api';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const pct = (n) => `${Number(n || 0).toFixed(1)}%`;
const days = (n) => `${Number(n || 0).toFixed(0)}d`;

const STATUS_COLORS = {
  in_warehouse: { bg: 'bg-blue-500', label: 'In Warehouse' },
  staged: { bg: 'bg-cyan-500', label: 'Staged' },
  in_transit: { bg: 'bg-yellow-500', label: 'In Transit' },
  deployed: { bg: 'bg-emerald-500', label: 'Deployed' },
  return_initiated: { bg: 'bg-orange-500', label: 'Return Initiated' },
  in_repair: { bg: 'bg-red-500', label: 'In Repair' },
  replaced: { bg: 'bg-purple-500', label: 'Replaced' },
  retired: { bg: 'bg-foreground/30', label: 'Retired' },
};

const TABS = [
  { key: 'executive', label: 'Executive', icon: Activity },
  { key: 'financial', label: 'Financial', icon: IndianRupee },
  { key: 'fleet', label: 'Fleet', icon: HardDrive },
  { key: 'margin', label: 'Margin', icon: Scale },
  { key: 'partner', label: 'Partner', icon: Handshake },
  { key: 'support', label: 'Support', icon: Headphones },
  { key: 'returns', label: 'Returns', icon: RotateCcw },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } },
};

/* ────────────── Reusable sub-components ────────────── */

function MetricGrid({ metrics }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-3 border-b border-foreground/[0.05]">
      {metrics.map((s, i) => (
        <motion.div
          key={s.label}
          variants={item}
          className={cn(
            'p-6 lg:p-12 flex flex-col gap-4 lg:gap-8 group hover:bg-foreground/[0.02] transition-colors duration-700',
            i < metrics.length - 1 && 'border-r border-foreground/[0.05]'
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">{s.label}</span>
            {s.icon && <s.icon className={cn('w-4 h-4 transition-colors', s.alert ? 'text-red-400' : 'text-foreground/10 group-hover:text-rentr-primary')} />}
          </div>
          <h3 className={cn(
            'text-3xl lg:text-5xl font-brand font-black tracking-tighter transition-colors duration-500',
            s.alert ? 'text-red-400' : 'text-foreground group-hover:text-rentr-primary'
          )}>{s.value}</h3>
          {s.sub && <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/15">{s.sub}</span>}
        </motion.div>
      ))}
    </section>
  );
}

function CompactGrid({ metrics }) {
  const cols = metrics.length <= 3 ? 'grid-cols-3' : metrics.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4';
  return (
    <section className={cn('grid border-b border-foreground/[0.05]', cols)}>
      {metrics.map((s, i) => (
        <motion.div
          key={s.label}
          variants={item}
          className={cn(
            'p-6 lg:p-10 flex flex-col gap-3 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700',
            i < metrics.length - 1 && 'border-r border-foreground/[0.05]'
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/15">{s.label}</span>
            {s.icon && <s.icon className="w-4 h-4 text-foreground/[0.06] group-hover:text-rentr-primary transition-colors" />}
          </div>
          <h3 className={cn(
            'text-2xl lg:text-4xl font-brand font-black tracking-tighter transition-colors duration-500',
            s.alert ? 'text-red-400' : 'text-foreground group-hover:text-rentr-primary'
          )}>
            {s.value}
          </h3>
        </motion.div>
      ))}
    </section>
  );
}

function HorizontalBarChart({ title, entries, formatValue, colorClass = 'bg-rentr-primary' }) {
  if (!entries || entries.length === 0) {
    return (
      <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
        <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">{title}</h2>
        <p className="text-xs text-foreground/20 font-serif italic">No data available.</p>
      </motion.div>
    );
  }
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
      <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">{title}</h2>
      <div className="space-y-6">
        {entries.map(([label, value]) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">{label}</span>
              <span className="text-sm font-brand font-black text-foreground">{formatValue ? formatValue(value) : value}</span>
            </div>
            <div className="h-[2px] w-full bg-foreground/[0.05] relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 1.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={cn('absolute inset-y-0 left-0 rounded-full', colorClass)}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatusBar({ entries, total }) {
  if (!entries || entries.length === 0) return null;
  const t = total || entries.reduce((sum, [, v]) => sum + v, 0) || 1;
  return (
    <>
      <div className="flex h-3 rounded-full overflow-hidden mb-8">
        {entries.map(([status, count]) => (
          <motion.div
            key={status}
            initial={{ width: 0 }}
            animate={{ width: `${(count / t) * 100}%` }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
            className={STATUS_COLORS[status]?.bg || 'bg-foreground/20'}
          />
        ))}
      </div>
      <div className="space-y-4">
        {entries.map(([status, count]) => (
          <div key={status} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={cn('w-2 h-2 rounded-full', STATUS_COLORS[status]?.bg || 'bg-foreground/20')} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-foreground/60 transition-colors">
                {STATUS_COLORS[status]?.label || status.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="text-sm font-brand font-black text-foreground">{count}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function AgingChart({ overdueInvoices }) {
  const now = new Date();
  const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  (overdueInvoices || []).forEach((inv) => {
    const d = Math.floor((now - new Date(inv.due_date)) / (1000 * 60 * 60 * 24));
    const amount = Number(inv.total || inv.amount || 0);
    if (d <= 30) aging['0-30'] += amount;
    else if (d <= 60) aging['31-60'] += amount;
    else if (d <= 90) aging['61-90'] += amount;
    else aging['90+'] += amount;
  });
  const agingMax = Math.max(...Object.values(aging), 1);
  const colors = { '0-30': 'bg-yellow-500', '31-60': 'bg-orange-500', '61-90': 'bg-red-400', '90+': 'bg-red-600' };

  if (Object.values(aging).every((v) => v === 0)) {
    return (
      <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
        <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">Aging Analysis</h2>
        <div className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-[2rem] bg-foreground/[0.02] border border-foreground/[0.05] text-center">
          <p className="text-xs text-foreground/20 font-serif italic">No overdue invoices. All clear.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
      <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">Aging Analysis</h2>
      <div className="space-y-6">
        {Object.entries(aging).map(([bucket, amount]) => (
          <div key={bucket} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-foreground/20" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">{bucket} Days</span>
              </div>
              <span className="text-sm font-brand font-black text-foreground">{`\u20B9${fmt(amount)}`}</span>
            </div>
            <div className="h-[2px] w-full bg-foreground/[0.05] relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max((amount / agingMax) * 100, amount > 0 ? 3 : 0)}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className={cn('absolute inset-y-0 left-0 rounded-full', colors[bucket])}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-[2rem] bg-foreground/[0.02] border border-foreground/[0.05] text-center">
      <p className="text-xs text-foreground/20 font-serif italic">{message}</p>
    </div>
  );
}

/* ────────────── TAB PANELS ────────────── */

function ExecutiveTab({ d, a }) {
  const totalRevenue = d?.total_revenue || 0;
  const monthlyRecurring = d?.monthly_recurring || 0;
  const outstanding = d?.outstanding || 0;
  const totalAssets = a?.total_assets || a?.total || 0;
  const deployed = a?.deployed || a?.by_status?.deployed || 0;
  const utilization = totalAssets > 0 ? (deployed / totalAssets) * 100 : 0;
  const disputeRate = d?.dispute_rate ?? (d?.disputes && d?.total_orders ? (d.disputes / d.total_orders) * 100 : 0);
  const dso = d?.dso || 0;
  const margin = d?.margin_pct ?? d?.gross_margin_pct ?? 0;
  const arr = d?.arr || (monthlyRecurring * 12);

  return (
    <>
      <MetricGrid metrics={[
        { label: 'Assets Under Management', value: `\u20B9${fmt(d?.aum || totalRevenue)}`, icon: Layers },
        { label: 'Annual Recurring Revenue', value: `\u20B9${fmt(arr)}`, icon: TrendingUp },
        { label: 'Outstanding', value: `\u20B9${fmt(outstanding)}`, icon: AlertTriangle, alert: outstanding > 0 },
      ]} />
      <CompactGrid metrics={[
        { label: 'Utilization', value: pct(utilization), icon: Gauge },
        { label: 'Gross Margin', value: pct(margin), icon: Percent },
        { label: 'Days Sales Outstanding', value: days(dso), icon: Timer },
        { label: 'Dispute Rate', value: pct(disputeRate), icon: AlertCircle, alert: disputeRate > 5 },
      ]} />
      <CompactGrid metrics={[
        { label: 'Monthly Recurring', value: `\u20B9${fmt(monthlyRecurring)}`, icon: IndianRupee },
        { label: 'Total Orders', value: d?.total_orders || 0, icon: Package },
        { label: 'Open Tickets', value: d?.open_tickets || 0, icon: Headphones },
      ]} />

      {/* Trends placeholder */}
      <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
        <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">Revenue Trend</h2>
        {d?.revenue_trend && d.revenue_trend.length > 0 ? (
          <div className="space-y-4">
            {d.revenue_trend.map((pt) => (
              <div key={pt.month || pt.period} className="flex items-center justify-between group">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-foreground/60 transition-colors">{pt.month || pt.period}</span>
                <span className="text-sm font-brand font-black text-foreground">{`\u20B9${fmt(pt.revenue || pt.value)}`}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Trend data will appear as revenue accumulates." />
        )}
      </motion.div>
    </>
  );
}

function FinancialTab({ d }) {
  const overdueInvoices = d?.overdue_invoice_details || [];

  // Revenue by customer
  const revenueByCustomer = d?.revenue_by_customer || [];
  const custEntries = revenueByCustomer
    .map((c) => [c.name || c.customer_name || 'Unknown', Number(c.revenue || c.total || 0)])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Collections & deposits
  const totalCollected = d?.total_collected || 0;
  const totalDeposits = d?.total_deposits || d?.security_deposits || 0;
  const damageCharges = d?.total_damage_charges || d?.damage_charges || 0;

  return (
    <>
      <MetricGrid metrics={[
        { label: 'Total Revenue', value: `\u20B9${fmt(d?.total_revenue || 0)}`, icon: IndianRupee },
        { label: 'Collections', value: `\u20B9${fmt(totalCollected)}`, icon: CreditCard },
        { label: 'Outstanding', value: `\u20B9${fmt(d?.outstanding || 0)}`, icon: AlertTriangle, alert: (d?.outstanding || 0) > 0 },
      ]} />
      <CompactGrid metrics={[
        { label: 'Total Invoices', value: d?.total_invoices || 0, icon: FileCheck },
        { label: 'Security Deposits', value: `\u20B9${fmt(totalDeposits)}`, icon: ShieldCheck },
        { label: 'Damage Charges', value: `\u20B9${fmt(damageCharges)}`, icon: FileWarning, alert: damageCharges > 0 },
      ]} />

      <HorizontalBarChart
        title="Revenue by Customer"
        entries={custEntries}
        formatValue={(v) => `\u20B9${fmt(v)}`}
      />

      <AgingChart overdueInvoices={overdueInvoices} />
    </>
  );
}

function FleetTab({ a, d }) {
  const total = a?.total_assets || a?.total || 0;
  const byStatus = a?.by_status || {};
  const byCategory = a?.by_category || {};

  const statusEntries = Object.entries(byStatus).filter(([, v]) => v > 0);
  const categoryEntries = Object.entries(byCategory).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const deployed = a?.deployed || byStatus.deployed || 0;
  const inWarehouse = a?.in_warehouse || byStatus.in_warehouse || 0;
  const inTransit = byStatus.in_transit || 0;
  const inRepair = a?.in_repair || byStatus.in_repair || 0;
  const replaced = byStatus.replaced || 0;

  // Idle assets: assets in warehouse beyond a threshold
  const idleAssets = d?.idle_assets || a?.idle_assets || [];

  return (
    <>
      <CompactGrid metrics={[
        { label: 'Total Assets', value: total, icon: HardDrive },
        { label: 'Deployed', value: deployed, icon: Package },
        { label: 'In Warehouse', value: inWarehouse, icon: Warehouse },
        { label: 'In Transit', value: inTransit, icon: Truck },
      ]} />
      <CompactGrid metrics={[
        { label: 'In Repair', value: inRepair, icon: Wrench },
        { label: 'Replaced', value: replaced, icon: Replace },
        { label: 'Utilization', value: total > 0 ? pct((deployed / total) * 100) : '0%', icon: Gauge },
      ]} />

      {/* Fleet Status Bar */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <motion.div variants={item} className="p-6 lg:p-12 border-r border-foreground/[0.05] border-b border-foreground/[0.05]">
          <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">Fleet Status</h2>
          {statusEntries.length > 0 ? (
            <StatusBar entries={statusEntries} />
          ) : (
            <EmptyState message="No asset data available." />
          )}
        </motion.div>

        <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
          <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">By Category</h2>
          {categoryEntries.length > 0 ? (
            <HorizontalBarChart title="" entries={categoryEntries} formatValue={(v) => v} />
          ) : (
            <EmptyState message="No category data available." />
          )}
        </motion.div>
      </section>

      {/* Idle Alerts */}
      <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
        <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">Idle Asset Alerts</h2>
        {idleAssets.length > 0 ? (
          <div className="space-y-4">
            {idleAssets.slice(0, 20).map((asset, i) => (
              <div key={asset.id || i} className="flex items-center justify-between group p-3 rounded-lg hover:bg-foreground/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-foreground/60 transition-colors">
                    {asset.serial_number || asset.name || `Asset #${asset.id}`}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
                  {asset.idle_days ? `${asset.idle_days}d idle` : asset.status?.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No idle asset alerts. Fleet is active." />
        )}
      </motion.div>
    </>
  );
}

function MarginTab({ d }) {
  // Margin by asset / category / partner / customer
  const marginByCategory = d?.margin_by_category || [];
  const marginByPartner = d?.margin_by_partner || [];
  const marginByCustomer = d?.margin_by_customer || [];
  const marginByAsset = d?.margin_by_asset || [];

  const catEntries = marginByCategory.map((c) => [c.category || c.name, Number(c.margin_pct || c.margin || 0)]).sort((a, b) => b[1] - a[1]);
  const partnerEntries = marginByPartner.map((p) => [p.partner_name || p.name, Number(p.margin_pct || p.margin || 0)]).sort((a, b) => b[1] - a[1]);
  const custEntries = marginByCustomer.map((c) => [c.customer_name || c.name, Number(c.margin_pct || c.margin || 0)]).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const assetEntries = marginByAsset.map((a) => [a.serial_number || a.name, Number(a.margin_pct || a.margin || 0)]).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const overallMargin = d?.margin_pct ?? d?.gross_margin_pct ?? 0;
  const revenue = d?.total_revenue || 0;
  const cogs = d?.total_cogs || 0;
  const grossProfit = revenue - cogs;

  return (
    <>
      <MetricGrid metrics={[
        { label: 'Gross Margin', value: pct(overallMargin), icon: Percent },
        { label: 'Total Revenue', value: `\u20B9${fmt(revenue)}`, icon: IndianRupee },
        { label: 'Gross Profit', value: `\u20B9${fmt(grossProfit)}`, icon: TrendingUp },
      ]} />

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-foreground/[0.05]">
          <HorizontalBarChart
            title="Margin by Category"
            entries={catEntries}
            formatValue={(v) => pct(v)}
            colorClass="bg-emerald-500"
          />
        </div>
        <HorizontalBarChart
          title="Margin by Partner"
          entries={partnerEntries}
          formatValue={(v) => pct(v)}
          colorClass="bg-cyan-500"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-foreground/[0.05]">
          <HorizontalBarChart
            title="Margin by Customer (Top 10)"
            entries={custEntries}
            formatValue={(v) => pct(v)}
            colorClass="bg-violet-500"
          />
        </div>
        <HorizontalBarChart
          title="Profitability by Asset (Top 10)"
          entries={assetEntries}
          formatValue={(v) => pct(v)}
          colorClass="bg-amber-500"
        />
      </section>
    </>
  );
}

function PartnerTab({ d }) {
  const partners = d?.partner_stats || [];
  const revenueEntries = partners.map((p) => [p.name || p.partner_name, Number(p.revenue || 0)]).sort((a, b) => b[1] - a[1]);
  const volumeEntries = partners.map((p) => [p.name || p.partner_name, Number(p.order_count || p.volume || 0)]).sort((a, b) => b[1] - a[1]);
  const returnEntries = partners.map((p) => [p.name || p.partner_name, Number(p.return_count || p.returns || 0)]).sort((a, b) => b[1] - a[1]);
  const disputeEntries = partners.map((p) => [p.name || p.partner_name, Number(p.dispute_count || p.disputes || 0)]).sort((a, b) => b[1] - a[1]);

  const totalPartners = d?.total_partners || partners.length;
  const totalPartnerRevenue = partners.reduce((s, p) => s + Number(p.revenue || 0), 0);
  const totalPartnerDisputes = partners.reduce((s, p) => s + Number(p.dispute_count || p.disputes || 0), 0);

  return (
    <>
      <MetricGrid metrics={[
        { label: 'Total Partners', value: totalPartners, icon: Handshake },
        { label: 'Partner Revenue', value: `\u20B9${fmt(totalPartnerRevenue)}`, icon: IndianRupee },
        { label: 'Partner Disputes', value: totalPartnerDisputes, icon: AlertCircle, alert: totalPartnerDisputes > 0 },
      ]} />

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-foreground/[0.05]">
          <HorizontalBarChart
            title="Revenue by Partner"
            entries={revenueEntries}
            formatValue={(v) => `\u20B9${fmt(v)}`}
          />
        </div>
        <HorizontalBarChart
          title="Volume by Partner"
          entries={volumeEntries}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-foreground/[0.05]">
          <HorizontalBarChart
            title="Returns by Partner"
            entries={returnEntries}
            colorClass="bg-orange-500"
          />
        </div>
        <HorizontalBarChart
          title="Disputes by Partner"
          entries={disputeEntries}
          colorClass="bg-red-500"
        />
      </section>

      {/* Payment Behavior */}
      {partners.length > 0 && (
        <motion.div variants={item} className="p-6 lg:p-12 border-b border-foreground/[0.05]">
          <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-8">Payment Behavior</h2>
          <div className="space-y-4">
            {partners.slice(0, 15).map((p) => (
              <div key={p.name || p.partner_name || p.id} className="flex items-center justify-between group p-3 rounded-lg hover:bg-foreground/[0.02] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-foreground/60 transition-colors">
                  {p.name || p.partner_name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/15">
                    Avg {days(p.avg_payment_days || p.avg_days_to_pay || 0)}
                  </span>
                  <span className={cn(
                    'text-sm font-brand font-black',
                    (p.avg_payment_days || p.avg_days_to_pay || 0) > 30 ? 'text-red-400' : 'text-emerald-500'
                  )}>
                    {(p.avg_payment_days || p.avg_days_to_pay || 0) > 30 ? 'SLOW' : 'ON TIME'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}

function SupportTab({ d }) {
  const openTickets = d?.open_tickets || 0;
  const totalTickets = d?.total_tickets || 0;
  const slaCompliance = d?.sla_compliance_pct ?? d?.sla_compliance ?? 0;
  const advanceReplacements = d?.advance_replacements || d?.advance_replacement_count || 0;
  const inRepairCount = d?.in_repair_count || d?.assets_in_repair || 0;
  const warrantyPipeline = d?.warranty_pipeline || d?.warranty_claims || 0;
  const resolvedToday = d?.resolved_today || 0;
  const avgResolutionTime = d?.avg_resolution_hours || d?.avg_resolution_time || 0;

  // Tickets by priority
  const ticketsByPriority = d?.tickets_by_priority || [];
  const priorityEntries = ticketsByPriority.map((t) => [t.priority || t.name, Number(t.count || 0)]).sort((a, b) => b[1] - a[1]);

  // Tickets by type
  const ticketsByType = d?.tickets_by_type || d?.tickets_by_category || [];
  const typeEntries = ticketsByType.map((t) => [t.type || t.category || t.name, Number(t.count || 0)]).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <MetricGrid metrics={[
        { label: 'Open Tickets', value: openTickets, icon: Headphones, alert: openTickets > 10 },
        { label: 'SLA Compliance', value: pct(slaCompliance), icon: ShieldCheck },
        { label: 'Advance Replacements', value: advanceReplacements, icon: Replace },
      ]} />
      <CompactGrid metrics={[
        { label: 'Total Tickets', value: totalTickets, icon: Layers },
        { label: 'In Repair', value: inRepairCount, icon: Wrench },
        { label: 'Warranty Pipeline', value: warrantyPipeline, icon: Award },
        { label: 'Avg Resolution', value: `${Number(avgResolutionTime).toFixed(1)}h`, icon: Timer },
      ]} />

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-foreground/[0.05]">
          <HorizontalBarChart
            title="Tickets by Priority"
            entries={priorityEntries}
            colorClass="bg-orange-500"
          />
        </div>
        <HorizontalBarChart
          title="Tickets by Type"
          entries={typeEntries}
          colorClass="bg-cyan-500"
        />
      </section>
    </>
  );
}

function ReturnsTab({ d }) {
  const pendingAssessments = d?.pending_assessments || d?.pending_return_assessments || 0;
  const damageChargePipeline = d?.damage_charge_pipeline || d?.total_damage_charges || 0;
  const returnCertsPending = d?.return_certificates_pending || d?.pending_certificates || 0;
  const returnCertsIssued = d?.return_certificates_issued || d?.issued_certificates || 0;
  const totalReturns = d?.total_returns || 0;
  const disputedReturns = d?.disputed_returns || d?.return_disputes || 0;
  const avgAssessmentDays = d?.avg_assessment_days || 0;

  // Damage charge breakdown
  const damageByCategory = d?.damage_by_category || [];
  const damageEntries = damageByCategory.map((dc) => [dc.category || dc.name, Number(dc.amount || dc.total || 0)]).sort((a, b) => b[1] - a[1]);

  // Returns by status
  const returnsByStatus = d?.returns_by_status || [];
  const returnStatusEntries = returnsByStatus.map((r) => [r.status || r.name, Number(r.count || 0)]).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <MetricGrid metrics={[
        { label: 'Pending Assessments', value: pendingAssessments, icon: FileWarning, alert: pendingAssessments > 5 },
        { label: 'Damage Charge Pipeline', value: `\u20B9${fmt(damageChargePipeline)}`, icon: CircleDollarSign },
        { label: 'Return Disputes', value: disputedReturns, icon: AlertCircle, alert: disputedReturns > 0 },
      ]} />
      <CompactGrid metrics={[
        { label: 'Total Returns', value: totalReturns, icon: RotateCcw },
        { label: 'Certificates Pending', value: returnCertsPending, icon: FileCheck, alert: returnCertsPending > 0 },
        { label: 'Certificates Issued', value: returnCertsIssued, icon: CheckCircle },
        { label: 'Avg Assessment Time', value: days(avgAssessmentDays), icon: Timer },
      ]} />

      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="border-r border-foreground/[0.05]">
          <HorizontalBarChart
            title="Damage Charges by Category"
            entries={damageEntries}
            formatValue={(v) => `\u20B9${fmt(v)}`}
            colorClass="bg-red-500"
          />
        </div>
        <HorizontalBarChart
          title="Returns by Status"
          entries={returnStatusEntries}
          colorClass="bg-orange-500"
        />
      </section>
    </>
  );
}

/* ────────────── MAIN PAGE ────────────── */

export default function AnalyticsPage() {
  const [assetStats, setAssetStats] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    Promise.all([
      api.get('/assets/stats').catch(() => null),
      api.get('/dashboard/stats').catch(() => null),
    ]).then(([assets, dashboard]) => {
      setAssetStats(assets);
      setDashboardStats(dashboard?.stats || dashboard);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = dashboardStats || {};
  const a = assetStats || {};

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="min-h-[calc(100vh-8rem)] grid-lines -m-4 lg:-m-6 xl:-m-8">
      {/* Hero */}
      <section className="px-6 lg:px-12 pt-8 lg:pt-12 pb-8 lg:pb-12 border-b border-foreground/[0.05]">
        <motion.div variants={item} className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-rentr-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Business Intelligence</span>
        </motion.div>
        <motion.h1 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-brand font-black tracking-[-0.04em] leading-[0.9] text-gradient mb-10">
          ANALYTICS &<br />INSIGHTS
        </motion.h1>

        {/* Tab Bar */}
        <motion.div variants={item} className="flex flex-wrap gap-1 lg:gap-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative px-4 lg:px-6 py-3 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-500 rounded-t-lg lg:rounded-t-xl border border-b-0',
                  isActive
                    ? 'bg-foreground/[0.04] border-foreground/[0.08] text-foreground'
                    : 'border-transparent text-foreground/20 hover:text-foreground/50 hover:bg-foreground/[0.02]'
                )}
              >
                <div className="flex items-center gap-2">
                  <tab.icon size={12} className={cn(isActive ? 'text-rentr-primary' : 'text-foreground/15')} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-rentr-primary rounded-full"
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>
      </section>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          {activeTab === 'executive' && <ExecutiveTab d={d} a={a} />}
          {activeTab === 'financial' && <FinancialTab d={d} />}
          {activeTab === 'fleet' && <FleetTab a={a} d={d} />}
          {activeTab === 'margin' && <MarginTab d={d} />}
          {activeTab === 'partner' && <PartnerTab d={d} />}
          {activeTab === 'support' && <SupportTab d={d} />}
          {activeTab === 'returns' && <ReturnsTab d={d} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
