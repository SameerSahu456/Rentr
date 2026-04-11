import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function ReplacementsPage() {
  const navigate = useNavigate();
  const [replacements, setReplacements] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set('replacement_type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    params.set('limit', '50');
    api.get(`/replacements/?${params}`)
      .then((data) => { setReplacements(data.items || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter, statusFilter]);

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowRightLeft size={24} className="text-orange-500" />
          <h1 className="text-2xl sm:text-3xl font-brand font-black uppercase tracking-tight text-foreground">Replacements</h1>
          <span className="text-foreground/30 text-sm font-mono">{total}</span>
        </div>
        <div className="flex gap-2">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 focus:outline-none">
            <option value="">All Types</option>
            <option value="advance">Advance</option>
            <option value="normal">Normal</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground/40 focus:outline-none">
            <option value="">All Status</option>
            <option value="initiated">Initiated</option>
            <option value="approved">Approved</option>
            <option value="replacement_staged">Staged</option>
            <option value="replacement_shipped">Shipped</option>
            <option value="replacement_delivered">Delivered</option>
            <option value="faulty_in_transit">Faulty In Transit</option>
            <option value="faulty_received">Faulty Received</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'replacement_number', label: 'RPL #', render: (v) => <span className="font-mono font-bold">{v}</span> },
          { key: 'replacement_type', label: 'Type', render: (v) => <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${v === 'advance' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>{v}</span> },
          { key: 'order_id', label: 'Order' },
          { key: 'customer_name', label: 'Customer' },
          { key: 'faulty_asset_uid', label: 'Faulty', render: (v) => <span className="font-mono text-red-500">{v}</span> },
          { key: 'replacement_asset_uid', label: 'Replacement', render: (v) => v ? <span className="font-mono text-green-500">{v}</span> : <span className="text-foreground/30 italic">Pending</span> },
          { key: 'faulty_reason', label: 'Reason', render: (v) => (v || '').replace(/_/g, ' ') },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
          { key: 'damage_charges', label: 'Damage', render: (v) => v > 0 ? `₹${fmt(v)}` : '-' },
        ]}
        data={replacements}
        loading={loading}
        onRowClick={(row) => navigate(`/replacements/${row.id}`)}
        emptyMessage="No replacements found."
      />
    </div>
  );
}
