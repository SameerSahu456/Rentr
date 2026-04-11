import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, Truck, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

export default function DeliveryChallanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dc, setDc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/delivery-challans/${id}`)
      .then(setDc)
      .catch(() => navigate('/delivery-challans'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.put(`/delivery-challans/${id}`, { status });
      setDc(updated);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!dc) return null;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/delivery-challans')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={dc.status} />
          <select value={dc.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
            <option value="draft">Draft</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <FileCheck size={20} className="text-blue-500" />
            <span className="font-mono text-foreground/20">{dc.dc_number}</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400">{(dc.challan_type || '').replace(/_/g, ' ')}</span>
          </div>
          <h1 className="text-3xl font-brand font-black tracking-tighter text-foreground uppercase">{dc.customer_name}</h1>
          <span className="text-sm text-foreground/40">{dc.customer_email}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Declared Value</span>
          <div className="text-2xl font-brand font-black text-foreground">₹{fmt(dc.total_value)}</div>
        </div>
      </div>

      {/* Transport & Document Info */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Order</span><span className="font-medium text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders?search=${dc.order_id}`)}>{dc.order_id}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Transporter</span><span className="font-medium">{dc.transporter_name || '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Vehicle</span><span className="font-medium">{dc.vehicle_number || '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Transport Mode</span><span className="font-medium capitalize">{dc.transport_mode || '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">LR / AWB #</span><span className="font-medium font-mono">{dc.lr_number || '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">E-way Bill</span><span className="font-medium font-mono">{dc.eway_bill_number || '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">GSTIN</span><span className="font-medium font-mono">{dc.customer_gstin || '-'}</span></div>
          {dc.received_by && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Received By</span><span className="font-medium">{dc.received_by}</span></div>}
        </div>
        {dc.dispatched_at && <div className="mt-4 text-xs text-foreground/30">Dispatched: {new Date(dc.dispatched_at).toLocaleString('en-IN')}</div>}
        {dc.delivered_at && <div className="text-xs text-emerald-500">Delivered: {new Date(dc.delivered_at).toLocaleString('en-IN')}</div>}
      </div>

      {/* Linked Assets */}
      {dc.linked_assets && dc.linked_assets.length > 0 && (
        <div>
          <h2 className="text-xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Assets on Challan</h2>
          <DataTable
            columns={[
              { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-bold">{v}</span> },
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dc.dispatch_from && (
          <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4"><MapPin size={16} className="text-foreground/40" /><h3 className="text-lg font-brand font-black uppercase">Dispatch From</h3></div>
            <div className="text-sm text-foreground/70 space-y-1">
              {dc.dispatch_from.name && <p className="font-medium">{dc.dispatch_from.name}</p>}
              <p>{dc.dispatch_from.address1 || dc.dispatch_from.streetAddress1}</p>
              <p>{[dc.dispatch_from.city, dc.dispatch_from.state].filter(Boolean).join(', ')}</p>
              <p>{dc.dispatch_from.pinCode || dc.dispatch_from.postalCode}</p>
            </div>
          </div>
        )}
        {dc.ship_to && (
          <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
            <div className="flex items-center gap-2 mb-4"><MapPin size={16} className="text-foreground/40" /><h3 className="text-lg font-brand font-black uppercase">Ship To</h3></div>
            <div className="text-sm text-foreground/70 space-y-1">
              {dc.ship_to.name && <p className="font-medium">{dc.ship_to.name}</p>}
              <p>{dc.ship_to.address1 || dc.ship_to.streetAddress1}</p>
              <p>{[dc.ship_to.city, dc.ship_to.state].filter(Boolean).join(', ')}</p>
              <p>{dc.ship_to.pinCode || dc.ship_to.postalCode}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
