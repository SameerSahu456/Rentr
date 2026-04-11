import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function DeliveryChallansPage() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    params.set('limit', '50');
    api.get(`/delivery-challans/?${params}`)
      .then((data) => { setChallans(data.items || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCheck size={24} className="text-blue-500" />
          <h1 className="text-2xl sm:text-3xl font-brand font-black uppercase tracking-tight text-foreground">Delivery Challans</h1>
          <span className="text-foreground/30 text-sm font-mono">{total}</span>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 focus:outline-none">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="dispatched">Dispatched</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="returned">Returned</option>
        </select>
      </div>
      <DataTable
        columns={[
          { key: 'dc_number', label: 'DC #', render: (v) => <span className="font-mono font-bold">{v}</span> },
          { key: 'order_id', label: 'Order' },
          { key: 'challan_type', label: 'Type', render: (v) => (v || '').replace(/_/g, ' ') },
          { key: 'customer_name', label: 'Customer' },
          { key: 'total_value', label: 'Value', render: (v) => `₹${fmt(v)}` },
          { key: 'transporter_name', label: 'Transporter', render: (v) => v || '-' },
          { key: 'eway_bill_number', label: 'E-way Bill', render: (v) => v || '-' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
        ]}
        data={challans}
        loading={loading}
        onRowClick={(row) => navigate(`/delivery-challans/${row.id}`)}
        emptyMessage="No delivery challans found."
      />
    </div>
  );
}
