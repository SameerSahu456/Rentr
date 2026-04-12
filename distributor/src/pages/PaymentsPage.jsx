import { useState, useEffect } from 'react';
import { CreditCard, Search } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/').then(r => setPayments(r.items || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'invoice_number', label: 'Invoice' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'amount', label: 'Amount', render: (v) => `₹${(v || 0).toLocaleString('en-IN')}` },
    { key: 'method', label: 'Method', render: (v) => v || '-' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'paid_at', label: 'Paid', render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-brand font-bold text-gradient">Payments</h1>

      <div className="glass rounded-2xl overflow-hidden">
        <DataTable columns={columns} data={payments} loading={loading}
          emptyMessage="No payments recorded yet" emptyIcon={<CreditCard className="w-16 h-16" />} />
      </div>
    </div>
  );
}
