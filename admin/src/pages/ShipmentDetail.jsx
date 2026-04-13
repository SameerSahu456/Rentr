import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle2, Clock, Circle, FileCheck, ExternalLink } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');

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

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (error) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/shipments')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Shipments</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!shipment) return <p className="text-foreground/30">Shipment not found</p>;

  const steps = [
    { key: 'preparing', label: 'Preparing' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];
  const currentIdx = steps.findIndex(s => s.key === shipment.status);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'tracking', label: `Tracking (${shipment.timeline?.length || 0})` },
    { key: 'assets', label: `Assets (${shipment.assets?.length || 0})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/shipments')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shipments
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-foreground/30">{shipment.shipment_number}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${shipment.shipment_type === 'return' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{shipment.shipment_type}</span>
            </div>
            <h1 className="text-2xl font-brand font-bold text-foreground">{shipment.customer_name}</h1>
            {shipment.order_id && (
              <p className="text-foreground/40 text-xs mt-1 cursor-pointer hover:text-rentr-primary" onClick={() => navigate(`/orders/${shipment.order_id}`)}>
                Order #{shipment.order_id}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={shipment.status} />
            <select value={shipment.status} onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm text-foreground/60">
              {steps.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Logistics Partner</p>
            <p className="text-lg font-bold">{shipment.logistics_partner || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Tracking #</p>
            <p className="text-sm font-bold font-mono">{shipment.tracking_number || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">ETA</p>
            <p className="text-sm font-bold">{shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Customer</p>
            <p className="text-sm font-bold">{shipment.customer_name || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Assets</p>
            <p className="text-lg font-bold">{shipment.assets?.length || 0}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Type</p>
            <p className="text-sm font-bold capitalize">{shipment.shipment_type || '-'}</p>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="glass rounded-2xl p-5">
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
      <div className="flex gap-1 border-b border-foreground/[0.05] overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${tab === t.key ? 'border-rentr-primary text-rentr-primary' : 'border-transparent text-foreground/25 hover:text-foreground/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">Shipment Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Logistics Partner" value={shipment.logistics_partner} />
              <Field label="Tracking #" value={shipment.tracking_number} mono />
              <Field label="ETA" value={shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null} />
              <Field label="Customer" value={shipment.customer_name} />
            </div>
          </div>

          {shipment.order && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground">Order Details</h2>
                <button onClick={() => navigate(`/orders/${shipment.order.id}`)} className="text-sm text-rentr-primary hover:underline flex items-center gap-1">View Order <ExternalLink size={12} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Order ID" value={`#${shipment.order.id}`} />
                <div><span className="text-[10px] text-foreground/25 uppercase tracking-widest block mb-0.5">Status</span><StatusBadge status={shipment.order.status} /></div>
                <Field label="Amount" value={shipment.order.total_amount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                <Field label="Rental Period" value={shipment.order.rental_months ? `${shipment.order.rental_months} month${shipment.order.rental_months !== 1 ? 's' : ''}` : null} />
              </div>
            </div>
          )}

          {shipment.delivery_challan && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><FileCheck size={16} className="text-blue-500" /> Delivery Challan</h2>
                <button onClick={() => navigate(`/delivery-challans/${shipment.delivery_challan.id}`)} className="text-sm text-rentr-primary hover:underline flex items-center gap-1">View DC <ExternalLink size={12} /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="DC Number" value={shipment.delivery_challan.dc_number} mono />
                <Field label="Type" value={shipment.delivery_challan.challan_type} />
                <div><span className="text-[10px] text-foreground/25 uppercase tracking-widest block mb-0.5">Status</span><StatusBadge status={shipment.delivery_challan.status} /></div>
                <Field label="Value" value={shipment.delivery_challan.total_value ? `₹${Number(shipment.delivery_challan.total_value).toLocaleString('en-IN')}` : null} />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'tracking' && (
        <>
          {shipment.timeline && shipment.timeline.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-foreground/[0.03]">
                {[...shipment.timeline].reverse().map((event, idx) => (
                  <div key={idx} className="px-6 py-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rentr-primary shrink-0" />
                    <StatusBadge status={event.status} />
                    <span className="text-xs text-foreground/40">{new Date(event.timestamp).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No tracking events yet.</p>
          )}
        </>
      )}

      {tab === 'assets' && (
        <>
          {shipment.assets && shipment.assets.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-foreground/[0.03]">
                {shipment.assets.map((asset) => (
                  <div key={asset.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/assets?search=${asset.asset_uid}`)}>
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-foreground/30" />
                      <span className="font-mono text-sm font-bold">{asset.asset_uid}</span>
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
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No assets in this shipment.</p>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div>
      <span className="text-[10px] text-foreground/25 uppercase tracking-widest block mb-0.5">{label}</span>
      <span className={`text-sm font-bold text-foreground ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
    </div>
  );
}
