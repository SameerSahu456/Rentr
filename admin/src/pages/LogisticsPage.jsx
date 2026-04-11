import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, FileCheck, Package, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
};

export default function LogisticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('shipments');
  const [shipments, setShipments] = useState([]);
  const [challans, setChallans] = useState([]);
  const [shipmentTotal, setShipmentTotal] = useState(0);
  const [challanTotal, setChallanTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('limit', '50');

    Promise.all([
      api.get(`/shipments/?${params}`).catch(() => ({ items: [], total: 0 })),
      api.get(`/delivery-challans/?${params}`).catch(() => ({ items: [], total: 0 })),
    ]).then(([shipData, challanData]) => {
      setShipments(shipData.items || []);
      setShipmentTotal(shipData.total || (shipData.items || []).length);
      setChallans(challanData.items || []);
      setChallanTotal(challanData.total || (challanData.items || []).length);
    }).finally(() => setLoading(false));
  }, [statusFilter]);

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  // Stats
  const shipmentsByStatus = {
    delivered: shipments.filter(s => s.status === 'delivered').length,
    in_transit: shipments.filter(s => s.status === 'in_transit').length,
    preparing: shipments.filter(s => ['preparing', 'dispatched'].includes(s.status)).length,
  };
  const challansByStatus = {
    delivered: challans.filter(c => c.status === 'delivered').length,
    dispatched: challans.filter(c => c.status === 'dispatched').length,
    draft: challans.filter(c => c.status === 'draft').length,
  };

  const tabs = [
    { key: 'shipments', label: 'Shipments', icon: Truck, count: shipmentTotal, color: 'purple' },
    { key: 'challans', label: 'Delivery Challans', icon: FileCheck, count: challanTotal, color: 'blue' },
  ];

  const shipmentStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'failed', label: 'Failed' },
  ];

  const challanStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'generated', label: 'Generated' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck size={24} className="text-rentr-primary" />
          <h1 className="text-2xl sm:text-3xl font-brand font-black uppercase tracking-tight text-foreground">Logistics</h1>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Shipments', value: shipmentTotal, color: 'purple' },
          { label: 'In Transit', value: shipmentsByStatus.in_transit, color: 'amber' },
          { label: 'Delivered', value: shipmentsByStatus.delivered, color: 'emerald' },
          { label: 'Total Challans', value: challanTotal, color: 'blue' },
          { label: 'Dispatched', value: challansByStatus.dispatched, color: 'amber' },
          { label: 'Challan Delivered', value: challansByStatus.delivered, color: 'emerald' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl">
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-2">{stat.label}</span>
            <span className={`text-2xl font-brand font-black tracking-tighter text-${stat.color}-500`}>{stat.value}</span>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex items-center gap-1 p-1 bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setStatusFilter(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab.key
                ? `bg-${tab.color}-500/10 text-${tab.color}-500 border border-${tab.color}-500/20`
                : 'text-foreground/30 hover:text-foreground/60 border border-transparent'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${
              activeTab === tab.key ? `bg-${tab.color}-500/20` : 'bg-foreground/[0.05]'
            }`}>{tab.count}</span>
          </button>
        ))}
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex items-center justify-end">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 focus:outline-none focus:border-rentr-primary/50 transition-all"
        >
          {(activeTab === 'shipments' ? shipmentStatusOptions : challanStatusOptions).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </motion.div>

      {/* Shipments Table */}
      {activeTab === 'shipments' && (
        <motion.div variants={item}>
          <DataTable
            columns={[
              { key: 'shipment_number', label: 'Shipment #', render: (v) => <span className="font-mono font-bold">{v}</span> },
              { key: 'order_id', label: 'Order', render: (v) => v ? <span className="text-rentr-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${v}`); }}>ORD-{String(v).padStart(5, '0')}</span> : '-' },
              { key: 'shipment_type', label: 'Type', render: (v) => (
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                  v === 'return' ? 'bg-red-500/10 text-red-400 border border-red-500/15' :
                  v === 'replacement' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                }`}>{v}</span>
              )},
              { key: 'logistics_partner', label: 'Logistics Partner', render: (v) => v || '-' },
              { key: 'tracking_number', label: 'AWB / Tracking #', render: (v) => v ? <span className="font-mono text-foreground/60">{v}</span> : '-' },
              { key: 'customer_name', label: 'Customer' },
              { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              { key: 'estimated_delivery', label: 'ETA', render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
            ]}
            data={shipments}
            loading={loading}
            onRowClick={(row) => navigate(`/shipments/${row.id}`)}
            emptyMessage="No shipments found."
          />
        </motion.div>
      )}

      {/* Delivery Challans Table */}
      {activeTab === 'challans' && (
        <motion.div variants={item}>
          <DataTable
            columns={[
              { key: 'dc_number', label: 'DC #', render: (v) => <span className="font-mono font-bold">{v}</span> },
              { key: 'order_id', label: 'Order', render: (v) => v ? <span className="text-rentr-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${v}`); }}>ORD-{String(v).padStart(5, '0')}</span> : '-' },
              { key: 'challan_type', label: 'Type', render: (v) => (
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                  v === 'inward' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                }`}>{(v || '').replace(/_/g, ' ')}</span>
              )},
              { key: 'customer_name', label: 'Customer' },
              { key: 'transporter_name', label: 'Transporter', render: (v) => v || '-' },
              { key: 'vehicle_number', label: 'Vehicle', render: (v) => v ? <span className="font-mono text-foreground/60">{v}</span> : '-' },
              { key: 'eway_bill_number', label: 'E-Way Bill', render: (v) => v ? <span className="font-mono text-foreground/60">{v}</span> : '-' },
              { key: 'total_value', label: 'Value', render: (v) => v ? `₹${fmt(v)}` : '-' },
              { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
            ]}
            data={challans}
            loading={loading}
            onRowClick={(row) => navigate(`/delivery-challans/${row.id}`)}
            emptyMessage="No delivery challans found."
          />
        </motion.div>
      )}
    </motion.div>
  );
}
