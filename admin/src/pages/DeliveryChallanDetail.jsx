import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, MapPin, Truck, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

export default function DeliveryChallanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dc, setDc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/delivery-challans/${id}`)
      .then(setDc)
      .catch((err) => setError(err.message || 'Failed to load delivery challan'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      await api.put(`/delivery-challans/${id}`, { status });
      setDc((prev) => ({ ...prev, status }));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/delivery-challans')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!dc) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-foreground/[0.06]">
        <button onClick={() => navigate('/delivery-challans')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={dc.status} />
          <select value={dc.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60">
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck size={18} className="text-blue-500" />
            <span className="font-mono text-sm text-foreground/40">{dc.dc_number}</span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">{(dc.challan_type || '').replace(/_/g, ' ')}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{dc.customer_name}</h1>
        </div>
        <div className="text-right">
          <span className="text-xs text-foreground/40">Declared Value</span>
          <div className="text-xl font-bold text-foreground">₹{Number(dc.total_value || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Transport Details */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">Transport & Document Info</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-foreground/40 block mb-0.5">Order</span>
            {dc.order_id ? <span className="text-sm font-medium text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${dc.order_id}`)}>#{dc.order_id}</span> : <span className="text-sm text-foreground/40">-</span>}
          </div>
          <Field label="Transporter" value={dc.transporter_name} />
          <Field label="Vehicle" value={dc.vehicle_number} />
          <Field label="E-way Bill" value={dc.eway_bill_number} mono />
        </div>
      </div>

      {/* Linked Shipments */}
      {dc.shipments && dc.shipments.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2"><Truck size={16} className="text-purple-500" /> Linked Shipments</h2>
          <div className="space-y-2">
            {dc.shipments.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-foreground/[0.03] cursor-pointer transition-colors"
                onClick={() => navigate(`/shipments/${s.id}`)}>
                <div className="flex items-center gap-3">
                  <Truck size={14} className="text-foreground/30" />
                  <span className="font-mono text-sm font-medium">{s.shipment_number}</span>
                  {s.logistics_partner && <span className="text-sm text-foreground/40">{s.logistics_partner}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {s.tracking_number && <span className="text-xs font-mono text-foreground/40">{s.tracking_number}</span>}
                  <StatusBadge status={s.status} />
                  <ExternalLink size={12} className="text-foreground/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Linked Assets */}
      {dc.linked_assets && dc.linked_assets.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Assets on Challan ({dc.linked_assets.length})</h2>
          <DataTable
            columns={[
              { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-medium">{v}</span> },
              { key: 'oem', label: 'OEM' },
              { key: 'model', label: 'Model' },
              { key: 'serial_number', label: 'Serial #' },
              { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              { key: 'condition_grade', label: 'Grade' },
            ]}
            data={dc.linked_assets}
            loading={false}
            onRowClick={(row) => navigate(`/assets/${row.id}`)}
            emptyMessage="No assets."
          />
        </div>
      )}

      {/* Addresses */}
      {(dc.dispatch_from || dc.ship_to) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dc.dispatch_from && (
            <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><MapPin size={14} className="text-foreground/40" /> Dispatch From</h3>
              <div className="text-sm text-foreground/60 space-y-0.5">
                {dc.dispatch_from.name && <p className="font-medium text-foreground">{dc.dispatch_from.name}</p>}
                <p>{dc.dispatch_from.address1 || dc.dispatch_from.streetAddress1}</p>
                <p>{[dc.dispatch_from.city, dc.dispatch_from.state, dc.dispatch_from.pinCode || dc.dispatch_from.postalCode].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          )}
          {dc.ship_to && (
            <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><MapPin size={14} className="text-foreground/40" /> Ship To</h3>
              <div className="text-sm text-foreground/60 space-y-0.5">
                {dc.ship_to.name && <p className="font-medium text-foreground">{dc.ship_to.name}</p>}
                <p>{dc.ship_to.address1 || dc.ship_to.streetAddress1}</p>
                <p>{[dc.ship_to.city, dc.ship_to.state, dc.ship_to.pinCode || dc.ship_to.postalCode].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <span className="text-xs text-foreground/40 block mb-0.5">{label}</span>
      <span className={`text-sm font-medium text-foreground ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
    </div>
  );
}
