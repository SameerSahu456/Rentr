import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('limit', '50');
    api.get(`/shipments/?${params}`)
      .then((data) => { setShipments(data.items || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck size={24} className="text-purple-500" />
          <h1 className="text-2xl sm:text-3xl font-brand font-black uppercase tracking-tight text-foreground">Shipments</h1>
          <span className="text-foreground/30 text-sm font-mono">{total}</span>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 focus:outline-none">
          <option value="">All Status</option>
          <option value="preparing">Preparing</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_transit">In Transit</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <DataTable
        columns={[
          { key: 'shipment_number', label: 'Shipment #', render: (v) => <span className="font-mono font-bold">{v}</span> },
          { key: 'order_id', label: 'Order' },
          { key: 'shipment_type', label: 'Type', render: (v) => <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${v === 'return' ? 'bg-red-500/10 text-red-400' : v === 'replacement' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{v}</span> },
          { key: 'logistics_partner', label: 'Logistics', render: (v) => v || '-' },
          { key: 'tracking_number', label: 'Tracking #', render: (v) => v || '-' },
          { key: 'customer_name', label: 'Customer' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          { key: 'estimated_delivery', label: 'ETA', render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-' },
        ]}
        data={shipments}
        loading={loading}
        onRowClick={(row) => navigate(`/shipments/${row.id}`)}
        emptyMessage="No shipments found."
      />
    </div>
  );
}
