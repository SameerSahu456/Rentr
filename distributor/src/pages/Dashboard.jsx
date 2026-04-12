import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Users, ShoppingCart, ScrollText, FileText,
  TrendingUp, CreditCard, HardDrive, ArrowRight,
} from 'lucide-react';

function StatCard({ label, value, icon: Icon, color = 'rentr-primary', prefix = '', onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      onClick={onClick}
      className={`glass rounded-2xl p-6 group ${onClick ? 'cursor-pointer hover:border-rentr-primary/20' : ''} transition-all`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
      </div>
      <p className="text-2xl lg:text-3xl font-brand font-bold text-foreground tracking-tight">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/25 mt-1">{label}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6"><div className="skeleton h-8 w-20 mb-2">&nbsp;</div><div className="skeleton h-3 w-16">&nbsp;</div></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-brand font-bold text-gradient">
          Welcome, {user?.name?.split(' ')[0] || 'Partner'}
        </h1>
        <p className="text-foreground/30 text-sm mt-1">{user?.company_name || 'Distributor Portal'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Customers" value={data?.total_customers || 0} icon={Users} onClick={() => navigate('/customers')} />
        <StatCard label="Active Orders" value={data?.active_orders || 0} icon={ShoppingCart} onClick={() => navigate('/orders')} />
        <StatCard label="Active Contracts" value={data?.active_contracts || 0} icon={ScrollText} onClick={() => navigate('/contracts')} />
        <StatCard label="Assets Deployed" value={data?.total_assets || 0} icon={HardDrive} />
        <StatCard label="Total Revenue" value={data?.total_revenue || 0} icon={TrendingUp} prefix="₹" />
        <StatCard label="Outstanding" value={data?.total_outstanding || 0} icon={CreditCard} prefix="₹" />
        <StatCard label="Monthly Spread" value={data?.monthly_spread || 0} icon={TrendingUp} prefix="₹" />
        <StatCard label="Credit Available" value={(data?.credit_limit || 0) - (data?.credit_used || 0)} icon={CreditCard} prefix="₹" />
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.05]">
          <h2 className="text-sm font-bold font-brand text-foreground">Recent Orders</h2>
          <button onClick={() => navigate('/orders')} className="text-[10px] font-bold uppercase tracking-widest text-rentr-primary hover:text-rentr-primary-light flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-foreground/[0.03]">
          {(data?.recent_orders || []).map((o) => (
            <div
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              className="px-6 py-4 flex items-center justify-between hover:bg-foreground/[0.01] cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-foreground">{o.order_number}</p>
                <p className="text-xs text-foreground/30">{o.customer_name}</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-sm font-bold text-foreground">₹{(o.total_monthly || 0).toLocaleString('en-IN')}/mo</p>
                  <p className="text-[10px] text-emerald-500 font-bold">+₹{(o.spread || 0).toLocaleString('en-IN')} spread</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
          {(!data?.recent_orders || data.recent_orders.length === 0) && (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No orders yet</p>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.05]">
          <h2 className="text-sm font-bold font-brand text-foreground">Recent Invoices</h2>
          <button onClick={() => navigate('/invoices')} className="text-[10px] font-bold uppercase tracking-widest text-rentr-primary hover:text-rentr-primary-light flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-foreground/[0.03]">
          {(data?.recent_invoices || []).map((inv) => (
            <div
              key={inv.id}
              onClick={() => navigate(`/invoices/${inv.id}`)}
              className="px-6 py-4 flex items-center justify-between hover:bg-foreground/[0.01] cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-foreground">{inv.invoice_number}</p>
                <p className="text-xs text-foreground/30">{inv.customer_name}</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <p className="text-sm font-bold text-foreground">₹{(inv.total || 0).toLocaleString('en-IN')}</p>
                <StatusBadge status={inv.status} />
              </div>
            </div>
          ))}
          {(!data?.recent_invoices || data.recent_invoices.length === 0) && (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No invoices yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
