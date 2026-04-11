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
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/shipments/${id}`)
      .then(setShipment)
      .catch((err) => setError(err.message || 'Failed to load shipment'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.put(`/shipments/${id}`, { status });
      setShipment(updated);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/shipments')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Shipments
      </button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!shipment) return null;

  const steps = [
    { key: 'preparing', label: 'Preparing' },
    { key: 'dispatched', label: 'Dispatched' },
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
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <Truck size={20} className="text-purple-500" />
          <span className="font-mono text-foreground/20">{shipment.shipment_number}</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${shipment.shipment_type === 'return' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{shipment.shipment_type}</span>
        </div>
        {shipment.order_id && (
          <h1 className="text-3xl font-brand font-black tracking-tighter text-foreground uppercase">
            Order <span className="text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${shipment.order_id}`)}>#{shipment.order_id}</span>
          </h1>
        )}
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
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span><span className="font-medium">{shipment.customer_name}</span></div>
        </div>
      </div>

      {/* Order Info */}
      {shipment.order && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
          <h2 className="text-xl font-brand font-black uppercase tracking-tight text-foreground mb-4 pb-4 border-b border-foreground/[0.05]">Order Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Order ID</span><span className="font-medium font-mono cursor-pointer text-rentr-primary hover:underline" onClick={() => navigate(`/orders/${shipment.order.id}`)}>#{shipment.order.id}</span></div>
            <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Status</span><StatusBadge status={shipment.order.status} /></div>
            <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Amount</span><span className="font-medium">{shipment.order.total_amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span></div>
            <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Rental Period</span><span className="font-medium">{shipment.order.rental_months} month{shipment.order.rental_months !== 1 ? 's' : ''}</span></div>
          </div>
          {shipment.order.shipping_address && (
            <div className="mt-4 pt-4 border-t border-foreground/[0.05]">
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block mb-1">Shipping Address</span>
              <span className="text-sm text-foreground/60">
                {[shipment.order.shipping_address.line1, shipment.order.shipping_address.line2, shipment.order.shipping_address.city, shipment.order.shipping_address.state, shipment.order.shipping_address.pincode].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tracking History */}
      {shipment.timeline && shipment.timeline.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
          <h2 className="text-xl font-brand font-black uppercase tracking-tight text-foreground mb-6 pb-4 border-b border-foreground/[0.05]">Tracking History</h2>
          <div className="space-y-3">
            {[...shipment.timeline].reverse().map((event, idx) => (
              <div key={idx} className="flex items-start gap-4 py-2 border-b border-foreground/[0.03] last:border-0">
                <div className="w-2 h-2 rounded-full bg-rentr-primary mt-2 shrink-0" />
                <div>
                  <StatusBadge status={event.status} />
                  <span className="text-[10px] text-foreground/30 ml-2">{new Date(event.timestamp).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assets in Shipment */}
      {shipment.assets && shipment.assets.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
          <h2 className="text-xl font-brand font-black uppercase tracking-tight text-foreground mb-4 pb-4 border-b border-foreground/[0.05]">Assets in Shipment</h2>
          <div className="space-y-2">
            {shipment.assets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between py-3 px-4 bg-foreground/[0.02] rounded-xl hover:bg-foreground/[0.04] transition-colors cursor-pointer"
                onClick={() => navigate(`/assets?search=${asset.asset_uid}`)}>
                <div className="flex items-center gap-4">
                  <Package size={16} className="text-foreground/30" />
                  <div>
                    <span className="font-mono font-bold text-sm">{asset.asset_uid}</span>
                    {asset.asset_model && <span className="text-foreground/40 text-xs ml-2">{asset.asset_model}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {asset.asset_category && <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-foreground/[0.05] rounded">{asset.asset_category}</span>}
                  {asset.asset_status && <StatusBadge status={asset.asset_status} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
