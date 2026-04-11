import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, Package, CheckCircle2, Clock, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/shipments/${id}`)
      .then(setShipment)
      .catch(() => navigate('/shipments'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.put(`/shipments/${id}`, { status });
      setShipment(updated);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!shipment) return null;

  const steps = [
    { key: 'preparing', label: 'Preparing' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];
  const currentIdx = steps.findIndex(s => s.key === shipment.status);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/shipments')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Shipments
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={shipment.status} />
          <select value={shipment.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
            {steps.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            <option value="failed">Failed</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <Truck size={20} className="text-purple-500" />
          <span className="font-mono text-foreground/20">{shipment.shipment_number}</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${shipment.shipment_type === 'return' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{shipment.shipment_type}</span>
        </div>
        <h1 className="text-3xl font-brand font-black tracking-tighter text-foreground uppercase">
          <span className="text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders?search=${shipment.order_id}`)}>{shipment.order_id}</span>
        </h1>
      </div>

      {/* Timeline */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i < currentIdx ? 'bg-emerald-500' : i === currentIdx ? 'bg-rentr-primary' : 'bg-foreground/[0.08]'}`}>
                  {i < currentIdx ? <CheckCircle2 size={16} className="text-white" /> : i === currentIdx ? <Clock size={16} className="text-white" /> : <Circle size={12} className="text-foreground/20" />}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 text-center ${i <= currentIdx ? 'text-foreground/60' : 'text-foreground/20'}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`h-0.5 w-8 sm:w-14 ${i < currentIdx ? 'bg-emerald-500' : 'bg-foreground/[0.08]'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Logistics Partner</span><span className="font-medium">{shipment.logistics_partner || '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Tracking #</span><span className="font-medium font-mono">{shipment.tracking_number || '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">ETA</span><span className="font-medium">{shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Packages</span><span className="font-medium">{shipment.package_count} {shipment.total_weight ? `(${shipment.total_weight} kg)` : ''}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span><span className="font-medium">{shipment.customer_name}</span></div>
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">DC #</span><span className="font-medium font-mono">{shipment.dc_number || '-'}</span></div>
          {shipment.received_by && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Received By</span><span className="font-medium">{shipment.received_by}</span></div>}
          {shipment.tracking_url && <div><a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="text-rentr-primary hover:underline text-sm">Track Package →</a></div>}
        </div>
      </div>

      {/* Tracking Events */}
      {shipment.tracking_events && shipment.tracking_events.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
          <h2 className="text-xl font-brand font-black uppercase tracking-tight text-foreground mb-6 pb-4 border-b border-foreground/[0.05]">Tracking History</h2>
          <div className="space-y-3">
            {[...shipment.tracking_events].reverse().map((event) => (
              <div key={event.id} className="flex items-start gap-4 py-2 border-b border-foreground/[0.03] last:border-0">
                <div className="w-2 h-2 rounded-full bg-rentr-primary mt-2 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={event.status} />
                    {event.location && <span className="text-xs text-foreground/40">{event.location}</span>}
                  </div>
                  {event.description && <p className="text-sm text-foreground/60 mt-0.5">{event.description}</p>}
                  <span className="text-[10px] text-foreground/30">{new Date(event.event_time).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assets */}
      {shipment.asset_uids && shipment.asset_uids.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
          <h2 className="text-xl font-brand font-black uppercase tracking-tight text-foreground mb-4">Assets in Shipment</h2>
          <div className="flex flex-wrap gap-2">
            {shipment.asset_uids.map((uid) => (
              <span key={uid} className="font-mono text-sm px-3 py-1 bg-foreground/[0.04] rounded-lg cursor-pointer hover:bg-foreground/[0.08] transition-colors">{uid}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
