import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, Check, CheckCheck, ShoppingCart, FileText, CreditCard, ScrollText, LifeBuoy, RotateCcw, Shield, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

const NOTIFICATION_CONFIG = {
  order_update: {
    icon: ShoppingCart,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/15',
    route: (n) => `/orders/${n.reference_id}`,
  },
  invoice_overdue: {
    icon: AlertTriangle,
    color: 'text-red-400 bg-red-500/10 border-red-500/15',
    route: (n) => `/invoices/${n.reference_id}`,
  },
  payment_received: {
    icon: CreditCard,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
    route: (n) => `/payments`,
  },
  contract_expiry: {
    icon: ScrollText,
    color: 'text-orange-400 bg-orange-500/10 border-orange-500/15',
    route: (n) => `/contracts/${n.reference_id}`,
  },
  return_update: {
    icon: RotateCcw,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/15',
    route: (n) => `/returns/${n.reference_id}`,
  },
  ticket_update: {
    icon: LifeBuoy,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15',
    route: (n) => `/support/${n.reference_id}`,
  },
  kyc_pending: {
    icon: Shield,
    color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15',
    route: (n) => `/kyc/${n.reference_id}`,
  },
  warranty_expiry: {
    icon: FileText,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/15',
    route: (n) => `/assets/${n.reference_id}`,
  },
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'orders', label: 'Orders', types: ['order_update'] },
  { key: 'invoices', label: 'Invoices', types: ['invoice_overdue', 'payment_received'] },
  { key: 'support', label: 'Support', types: ['ticket_update'] },
  { key: 'contracts', label: 'Contracts', types: ['contract_expiry', 'warranty_expiry'] },
];

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'order_update',
    title: 'Order #1042 confirmed',
    description: 'Order for MacBook Pro x1 has been confirmed and is being processed.',
    reference_id: '1042',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'payment_received',
    title: 'Payment received — ₹12,500',
    description: 'Monthly rental payment received from Arjun Mehta for contract #CTR-0087.',
    reference_id: null,
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'invoice_overdue',
    title: 'Invoice #INV-0234 overdue',
    description: 'Invoice for Priya Sharma is 7 days past due. Amount: ₹8,200.',
    reference_id: 'INV-0234',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'contract_expiry',
    title: 'Contract expiring in 7 days',
    description: 'Contract #CTR-0065 for Vikram Singh expires on 18 Apr 2026.',
    reference_id: 'CTR-0065',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'ticket_update',
    title: 'Support ticket #TKT-112 updated',
    description: 'Customer replied to "Laptop screen flickering" — awaiting your response.',
    reference_id: 'TKT-112',
    is_read: true,
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'return_update',
    title: 'Return #RET-045 inspection complete',
    description: 'Asset passed quality check. Ready for re-listing.',
    reference_id: 'RET-045',
    is_read: true,
    created_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'kyc_pending',
    title: 'KYC verification pending',
    description: 'New customer Deepak Kumar submitted KYC documents for review.',
    reference_id: 'deepak@example.com',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    type: 'warranty_expiry',
    title: 'Warranty expiring — Dell Monitor 27"',
    description: 'Manufacturer warranty for asset #AST-0189 expires on 20 Apr 2026.',
    reference_id: 'AST-0189',
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function groupByDate(notifications) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };

  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    if (d >= today) groups.Today.push(n);
    else if (d >= yesterday) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

function formatTime(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/notifications/')
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items || data.results || [];
        if (items.length === 0) {
          setNotifications(MOCK_NOTIFICATIONS);
          setUsingMock(true);
        } else {
          setNotifications(items);
          setUsingMock(false);
        }
      })
      .catch(() => {
        setNotifications(MOCK_NOTIFICATIONS);
        setUsingMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (!usingMock) {
      api.post('/notifications/mark-all-read/').catch(() => {});
    }
  };

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    if (!usingMock) {
      api.patch(`/notifications/${id}/`, { is_read: true }).catch(() => {});
    }
  };

  const handleClick = (notification) => {
    handleMarkRead(notification.id);
    const config = NOTIFICATION_CONFIG[notification.type];
    if (config?.route) {
      navigate(config.route(notification));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.is_read;
    const tab = FILTER_TABS.find((t) => t.key === activeTab);
    return tab?.types?.includes(n.type);
  });

  const grouped = groupByDate(filtered);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.div variants={item} className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-rentr-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Notification Center</span>
          </motion.div>
          <motion.h1 variants={item} className="text-3xl sm:text-4xl lg:text-6xl font-brand font-black tracking-tighter text-foreground uppercase flex items-center gap-4">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-rentr-primary text-white text-sm font-bold">
                {unreadCount}
              </span>
            )}
          </motion.h1>
        </div>

        <motion.div variants={item}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 bg-foreground/[0.02] border border-foreground/[0.05] rounded-full py-3 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 hover:text-rentr-primary hover:border-rentr-primary/30 transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </motion.div>
      </div>

      {/* Mock data banner */}
      {usingMock && (
        <motion.div variants={item} className="bg-yellow-500/5 border border-yellow-500/15 text-yellow-400 text-xs font-bold uppercase tracking-widest rounded-xl px-4 py-3">
          Showing sample notifications — live data will appear when the notifications API is connected.
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div variants={item} className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const tabCount = tab.key === 'unread'
            ? unreadCount
            : tab.key === 'all'
              ? notifications.length
              : notifications.filter((n) => tab.types?.includes(n.type)).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rentr-primary text-white'
                  : 'bg-foreground/[0.02] border border-foreground/[0.05] text-foreground/40 hover:text-foreground/70 hover:border-foreground/10'
              }`}
            >
              {tab.label}
              {tabCount > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-foreground/[0.05] text-foreground/30'
                }`}>
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-24 gap-4">
          <Bell size={40} className="text-foreground/10" />
          <p className="text-foreground/30 text-sm font-medium">
            {activeTab === 'unread' ? 'All caught up — no unread notifications.' : 'No notifications to show.'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([label, items]) => (
            <motion.div key={label} variants={item} className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30 px-1 mb-3">
                {label}
              </h3>
              <div className="space-y-1">
                {items.map((notification) => {
                  const config = NOTIFICATION_CONFIG[notification.type] || {
                    icon: Bell,
                    color: 'text-foreground/40 bg-foreground/[0.05] border-foreground/[0.08]',
                  };
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleClick(notification)}
                      className={`group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                        notification.is_read
                          ? 'bg-foreground/[0.01] hover:bg-foreground/[0.03] border border-transparent hover:border-foreground/[0.05]'
                          : 'bg-rentr-primary/[0.03] hover:bg-rentr-primary/[0.06] border border-rentr-primary/10 hover:border-rentr-primary/20'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold truncate ${
                            notification.is_read ? 'text-foreground/60' : 'text-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-rentr-primary" />
                          )}
                        </div>
                        <p className="text-xs text-foreground/40 mt-0.5 line-clamp-1">
                          {notification.description}
                        </p>
                      </div>

                      {/* Timestamp & Actions */}
                      <div className="flex-shrink-0 flex items-center gap-3">
                        <span className="text-[10px] font-medium text-foreground/25 tracking-wide whitespace-nowrap">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-foreground/[0.05]"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5 text-foreground/30" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
