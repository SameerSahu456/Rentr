import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import {
  FileText,
  DollarSign,
  LifeBuoy,
  ScrollText,
  ShoppingCart,
  HardDrive,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/dashboard/stats');
        setStats(data.stats || data);
        setAlerts(data.alerts || []);
        setRecentOrders(data.recent_orders || []);
        setRecentInvoices(data.recent_invoices || []);
        setRecentTickets(data.recent_tickets || []);
      } catch {
        setStats({ total_orders: 0, total_invoices: 0, total_revenue: 0, open_tickets: 0, active_contracts: 0, total_assets: 0, deployed_assets: 0, in_warehouse_assets: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const statCards = [
    { label: 'Revenue', value: loading ? '...' : formatCurrency(stats?.total_revenue), icon: DollarSign, onClick: () => navigate('/analytics') },
    { label: 'Orders', value: loading ? '...' : (stats?.total_orders ?? 0), icon: ShoppingCart, onClick: () => navigate('/orders') },
    { label: 'Assets', value: loading ? '...' : (stats?.total_assets ?? 0), icon: HardDrive, onClick: () => navigate('/assets') },
    { label: 'Invoices', value: loading ? '...' : (stats?.total_invoices ?? 0), icon: FileText, onClick: () => navigate('/invoices') },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-[calc(100vh-8rem)] grid-lines -m-4 lg:-m-6 xl:-m-8"
    >
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-12 pt-6 sm:pt-8 lg:pt-12 pb-12 sm:pb-16 lg:pb-24 border-b border-foreground/[0.05]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <motion.div variants={item} className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-rentr-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Real-time Overview</span>
            </motion.div>
            <motion.h1 variants={item} className="text-3xl md:text-4xl lg:text-5xl font-brand font-black tracking-[-0.04em] leading-[0.9] text-gradient">
              TECH RENTALS<br />SIMPLIFIED.
            </motion.h1>
          </div>
          <motion.div variants={item} className="flex flex-col gap-4 items-start md:items-end">
            <p className="text-sm text-foreground/40 font-serif italic max-w-[240px] md:text-right leading-relaxed">
              Managing high-end technology assets with precision and elegance.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="group flex items-center gap-3 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
            >
              View Orders
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-b border-foreground/[0.05]">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={item}
            onClick={stat.onClick}
            className={cn(
              'p-4 sm:p-6 lg:p-12 flex flex-col gap-3 sm:gap-4 lg:gap-8 group hover:bg-foreground/[0.02] transition-colors duration-700 cursor-pointer',
              i < 3 && 'border-r border-foreground/[0.05]'
            )}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/20 group-hover:text-foreground/40 transition-colors">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-foreground/10 group-hover:text-rentr-primary transition-colors" />
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground group-hover:text-rentr-primary transition-colors duration-500">
              {stat.value}
            </h3>
          </motion.div>
        ))}
      </section>

      {/* Secondary Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 border-b border-foreground/[0.05]">
        {[
          { label: 'Active Contracts', value: loading ? '...' : (stats?.active_contracts ?? 0), icon: ScrollText, onClick: () => navigate('/contracts') },
          { label: 'Open Tickets', value: loading ? '...' : (stats?.open_tickets ?? 0), icon: LifeBuoy, onClick: () => navigate('/support'), alert: (stats?.open_tickets ?? 0) > 0 },
          { label: 'Deployed Assets', value: loading ? '...' : (stats?.deployed_assets ?? 0), icon: CheckCircle2, onClick: () => navigate('/assets') },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            variants={item}
            onClick={s.onClick}
            className={cn(
              'p-4 sm:p-6 lg:p-10 flex flex-col gap-3 sm:gap-4 lg:gap-6 group hover:bg-foreground/[0.02] transition-colors duration-700 cursor-pointer',
              i < 2 && 'sm:border-r border-b sm:border-b-0 border-foreground/[0.05]'
            )}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-foreground/15 group-hover:text-foreground/40 transition-colors">{s.label}</span>
              <s.icon className={cn('w-4 h-4 transition-colors', s.alert ? 'text-amber-500' : 'text-foreground/[0.06] group-hover:text-rentr-primary')} />
            </div>
            <h3 className={cn(
              'text-2xl sm:text-3xl lg:text-4xl font-brand font-black tracking-tighter transition-colors duration-500',
              s.alert ? 'text-amber-500' : 'text-foreground group-hover:text-rentr-primary'
            )}>{s.value}</h3>
          </motion.div>
        ))}
      </section>

      {/* Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 border-r border-foreground/[0.05] p-4 sm:p-6 lg:p-12">
          <motion.div variants={item} className="flex items-center justify-between mb-8 lg:mb-12">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors"
            >
              View All
            </button>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 skeleton rounded-xl" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart size={32} className="mx-auto mb-3 text-foreground/[0.06]" />
              <p className="text-xs text-foreground/20 font-serif italic">No recent orders to display.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentOrders.slice(0, 5).map((order, i) => (
                <motion.div
                  key={order.id || i}
                  variants={item}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="group flex items-center gap-4 lg:gap-8 py-4 lg:py-6 border-b border-foreground/[0.03] last:border-none hover:px-4 transition-all duration-500 cursor-pointer"
                >
                  <span className="text-[10px] font-mono text-foreground/10 group-hover:text-rentr-primary transition-colors">0{i + 1}</span>
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center group-hover:bg-rentr-primary/10 group-hover:border-rentr-primary/20 transition-all duration-500">
                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-foreground/20 group-hover:text-rentr-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground group-hover:translate-x-1 transition-transform duration-500 truncate">
                      {order.customer_name || order.customer_email || 'Customer'}
                    </h4>
                    <p className="text-[10px] text-foreground/20 uppercase tracking-widest mt-1">#{order.order_number}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">₹{Number(order.total_monthly || 0).toLocaleString('en-IN')}</p>
                    <div className="mt-1"><StatusBadge status={order.status} /></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="p-4 sm:p-6 lg:p-12 flex flex-col gap-6 sm:gap-8 lg:gap-12">
          {/* Fleet Health */}
          <motion.div variants={item}>
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6 lg:mb-8">Fleet Status</h2>
            <div className="space-y-6 lg:space-y-8">
              {[
                { label: 'Total Assets', value: loading ? 0 : (stats?.total_assets || 0), max: loading ? 100 : Math.max(stats?.total_assets || 100, 1) },
                { label: 'Deployed', value: loading ? 0 : (stats?.deployed_assets || 0), max: loading ? 100 : Math.max(stats?.total_assets || 100, 1) },
                { label: 'In Warehouse', value: loading ? 0 : (stats?.in_warehouse_assets || 0), max: loading ? 100 : Math.max(stats?.total_assets || 100, 1) },
              ].map((cat) => (
                <div key={cat.label} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-foreground/20">{cat.label}</span>
                    <span className="text-foreground">{cat.value}</span>
                  </div>
                  <div className="h-[2px] w-full bg-foreground/[0.05] relative rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((cat.value / cat.max) * 100, 100)}%` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                      className="absolute inset-y-0 left-0 bg-rentr-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <motion.div variants={item} className="space-y-4">
              <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Alerts</h2>
              {alerts.slice(0, 3).map((alert, i) => (
                <div
                  key={i}
                  onClick={() => alert.action_url && navigate(alert.action_url)}
                  className={cn(
                    'p-4 rounded-2xl border cursor-pointer transition-all duration-500 hover:translate-x-1',
                    alert.urgency === 'high'
                      ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30'
                      : 'bg-foreground/[0.02] border-foreground/[0.05] hover:border-rentr-primary/30'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={14} className={alert.urgency === 'high' ? 'text-red-400 mt-0.5' : 'text-foreground/20 mt-0.5'} />
                    <div>
                      <p className="text-xs text-foreground/60 leading-relaxed">{alert.message}</p>
                      <span className={cn(
                        'text-[9px] font-bold uppercase tracking-[0.2em] mt-2 inline-block',
                        alert.urgency === 'high' ? 'text-red-400' : 'text-foreground/20'
                      )}>{alert.urgency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div variants={item} className="space-y-3">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-2">Quick Actions</h2>
            {[
              { label: 'Create Invoice', to: '/invoices/new', icon: FileText },
              { label: 'Add Asset', to: '/assets/new', icon: HardDrive },
              { label: 'New Support Ticket', to: '/support/new', icon: LifeBuoy },
              { label: 'New Return', to: '/returns/new', icon: Clock },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/[0.05] hover:border-rentr-primary/20 hover:bg-rentr-primary/5 transition-all duration-300"
              >
                <action.icon className="w-4 h-4 text-foreground/20 group-hover:text-rentr-primary transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-foreground/70 transition-colors">{action.label}</span>
                <ArrowRight className="w-3 h-3 ml-auto text-foreground/[0.06] group-hover:text-rentr-primary group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recent Invoices & Tickets Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-t border-foreground/[0.05]">
        {/* Recent Invoices */}
        <motion.div variants={item} className="p-4 sm:p-6 lg:p-12 border-r border-foreground/[0.05]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Recent Invoices</h2>
            <button onClick={() => navigate('/invoices')} className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors">
              View All
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="py-8 text-center">
              <FileText size={28} className="mx-auto mb-3 text-foreground/[0.06]" />
              <p className="text-xs text-foreground/20 font-serif italic">No recent invoices.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentInvoices.slice(0, 5).map((inv, i) => (
                <div
                  key={inv.id || i}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="group flex items-center gap-4 py-4 border-b border-foreground/[0.03] last:border-none cursor-pointer hover:px-3 transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-full bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center group-hover:bg-rentr-primary/10 group-hover:border-rentr-primary/20 transition-all">
                    <FileText className="w-4 h-4 text-foreground/20 group-hover:text-rentr-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{inv.invoice_number || `INV-${inv.id}`}</h4>
                    <p className="text-[10px] text-foreground/20 truncate">{inv.customer_name || inv.customer_email || '-'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">₹{Number(inv.total || 0).toLocaleString('en-IN')}</p>
                    <div className="mt-1"><StatusBadge status={inv.status} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Tickets */}
        <motion.div variants={item} className="p-4 sm:p-6 lg:p-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Support Tickets</h2>
            <button onClick={() => navigate('/support')} className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors">
              View All
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="py-8 text-center">
              <LifeBuoy size={28} className="mx-auto mb-3 text-foreground/[0.06]" />
              <p className="text-xs text-foreground/20 font-serif italic">No recent tickets.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTickets.slice(0, 5).map((ticket, i) => (
                <div
                  key={ticket.id || i}
                  onClick={() => navigate(`/support/${ticket.id}`)}
                  className="group flex items-center gap-4 py-4 border-b border-foreground/[0.03] last:border-none cursor-pointer hover:px-3 transition-all duration-500"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full border flex items-center justify-center transition-all',
                    ticket.priority === 'urgent' || ticket.priority === 'high'
                      ? 'bg-red-500/5 border-red-500/15 group-hover:bg-red-500/10'
                      : 'bg-foreground/[0.03] border-foreground/[0.05] group-hover:bg-rentr-primary/10 group-hover:border-rentr-primary/20'
                  )}>
                    <LifeBuoy className={cn(
                      'w-4 h-4 transition-colors',
                      ticket.priority === 'urgent' || ticket.priority === 'high'
                        ? 'text-red-400'
                        : 'text-foreground/20 group-hover:text-rentr-primary'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{ticket.subject || `Ticket #${ticket.ticket_number}`}</h4>
                    <p className="text-[10px] text-foreground/20 truncate">{ticket.customer_name || '-'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
}
