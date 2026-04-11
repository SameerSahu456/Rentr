import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle2, Clock, Circle, FileCheck, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DetailTabs from '../components/DetailTabs';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/shipments')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back to Shipments</button>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-foreground/[0.06]">
        <button onClick={() => navigate('/shipments')} className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={shipment.status} />
          <select value={shipment.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60">
            {steps.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck size={18} className="text-purple-500" />
            <span className="font-mono text-sm text-foreground/40">{shipment.shipment_number}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${shipment.shipment_type === 'return' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{shipment.shipment_type}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{shipment.customer_name}</h1>
        </div>
        {shipment.order_id && (
          <button onClick={() => navigate(`/orders/${shipment.order_id}`)} className="text-sm text-rentr-primary hover:underline">
            Order #{shipment.order_id}
          </button>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center min-w-[70px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i < currentIdx ? 'bg-emerald-500' : i === currentIdx ? 'bg-rentr-primary' : 'bg-foreground/[0.08]'}`}>
                  {i < currentIdx ? <CheckCircle2 size={16} className="text-white" /> : i === currentIdx ? <Clock size={16} className="text-white" /> : <Circle size={12} className="text-foreground/20" />}
                </div>
                <span className={`text-xs mt-1.5 text-center ${i <= currentIdx ? 'text-foreground/70 font-medium' : 'text-foreground/30'}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? 'bg-emerald-500' : 'bg-foreground/[0.08]'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <DetailTabs tabs={[
        {
          key: 'overview',
          label: 'Overview',
          content: (
            <>
              <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                <h2 className="text-base font-semibold text-foreground mb-4">Shipment Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field label="Logistics Partner" value={shipment.logistics_partner} />
                  <Field label="Tracking #" value={shipment.tracking_number} mono />
                  <Field label="ETA" value={shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
                  <Field label="Customer" value={shipment.customer_name} />
                </div>
              </div>

              {shipment.order && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-foreground">Order Details</h2>
                    <button onClick={() => navigate(`/orders/${shipment.order.id}`)} className="text-sm text-rentr-primary hover:underline flex items-center gap-1">View Order <ExternalLink size={12} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Field label="Order ID" value={`#${shipment.order.id}`} />
                    <div><span className="text-xs text-foreground/40 block mb-0.5">Status</span><StatusBadge status={shipment.order.status} /></div>
                    <Field label="Amount" value={shipment.order.total_amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                    <Field label="Rental Period" value={shipment.order.rental_months ? `${shipment.order.rental_months} month${shipment.order.rental_months !== 1 ? 's' : ''}` : null} />
                  </div>
                </div>
              )}

              {shipment.delivery_challan && (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><FileCheck size={16} className="text-blue-500" /> Delivery Challan</h2>
                    <button onClick={() => navigate(`/delivery-challans/${shipment.delivery_challan.id}`)} className="text-sm text-rentr-primary hover:underline flex items-center gap-1">View DC <ExternalLink size={12} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Field label="DC Number" value={shipment.delivery_challan.dc_number} mono />
                    <Field label="Type" value={shipment.delivery_challan.challan_type} />
                    <div><span className="text-xs text-foreground/40 block mb-0.5">Status</span><StatusBadge status={shipment.delivery_challan.status} /></div>
                    <Field label="Value" value={shipment.delivery_challan.total_value ? `₹${Number(shipment.delivery_challan.total_value).toLocaleString('en-IN')}` : null} />
                  </div>
                </div>
              )}
            </>
          ),
        },
        {
          key: 'tracking',
          label: 'Tracking',
          count: shipment.timeline?.length || 0,
          content: (
            <>
              {shipment.timeline && shipment.timeline.length > 0 ? (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-4">Tracking History</h2>
                  <div className="space-y-2">
                    {[...shipment.timeline].reverse().map((event, idx) => (
                      <div key={idx} className="flex items-center gap-3 py-2 border-b border-foreground/[0.04] last:border-0">
                        <div className="w-2 h-2 rounded-full bg-rentr-primary shrink-0" />
                        <StatusBadge status={event.status} />
                        <span className="text-xs text-foreground/40">{new Date(event.timestamp).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-foreground/30 text-sm">No tracking events yet.</div>
              )}
            </>
          ),
        },
        {
          key: 'assets',
          label: 'Assets',
          count: shipment.assets?.length || 0,
          content: (
            <>
              {shipment.assets && shipment.assets.length > 0 ? (
                <div className="bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl p-5">
                  <h2 className="text-base font-semibold text-foreground mb-4">Assets in Shipment ({shipment.assets.length})</h2>
                  <div className="space-y-2">
                    {shipment.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-foreground/[0.03] cursor-pointer transition-colors"
                        onClick={() => navigate(`/assets?search=${asset.asset_uid}`)}>
                        <div className="flex items-center gap-3">
                          <Package size={14} className="text-foreground/30" />
                          <span className="font-mono text-sm font-medium">{asset.asset_uid}</span>
                          {asset.asset_model && <span className="text-foreground/40 text-sm">{asset.asset_model}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {asset.asset_category && <span className="text-xs px-2 py-0.5 bg-foreground/[0.05] rounded">{asset.asset_category}</span>}
                          {asset.asset_status && <StatusBadge status={asset.asset_status} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-foreground/30 text-sm">No assets in this shipment.</div>
              )}
            </>
          ),
        },
      ]} />
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
