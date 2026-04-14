import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, MapPin, Truck, ExternalLink, Package } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function DeliveryChallanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dc, setDc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');

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

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (error) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/delivery-challans')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Delivery Challans</button>
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400 text-sm">{error}</div>
    </div>
  );
  if (!dc) return <p className="text-foreground/30">Delivery Challan not found</p>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'assets', label: `Assets (${dc.linked_assets?.length || 0})` },
    { key: 'addresses', label: 'Addresses' },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/delivery-challans')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Delivery Challans
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-foreground/30">{dc.dc_number}</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400">{(dc.challan_type || '').replace(/_/g, ' ')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-brand font-bold text-foreground">{dc.customer_name}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
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

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Declared Value</p>
            <p className="text-lg font-bold">₹{Number(dc.total_value || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Order</p>
            {dc.order_id ? <p className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${dc.order_id}`)}>#{dc.order_id}</p> : <p className="text-sm font-bold">-</p>}
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Transporter</p>
            <p className="text-sm font-bold">{dc.transporter_name || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Vehicle</p>
            <p className="text-sm font-bold">{dc.vehicle_number || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">E-way Bill</p>
            <p className="text-sm font-bold font-mono">{dc.eway_bill_number || '-'}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Assets</p>
            <p className="text-lg font-bold">{dc.linked_assets?.length || 0}</p>
          </div>
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
            <h2 className="text-sm font-bold text-foreground mb-4">Transport & Document Info</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-foreground/25 uppercase tracking-widest block mb-0.5">Order</span>
                {dc.order_id ? <span className="text-sm font-bold text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders/${dc.order_id}`)}>#{dc.order_id}</span> : <span className="text-sm text-foreground/40">-</span>}
              </div>
              <Field label="Transporter" value={dc.transporter_name} />
              <Field label="Vehicle" value={dc.vehicle_number} />
              <Field label="E-way Bill" value={dc.eway_bill_number} mono />
            </div>
          </div>

          {dc.shipments && dc.shipments.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2"><Truck size={16} className="text-purple-500" /> Linked Shipments</h2>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {dc.shipments.map((s) => (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/shipments/${s.id}`)}>
                    <div className="flex items-center gap-3">
                      <Truck size={14} className="text-foreground/30" />
                      <span className="font-mono text-sm font-bold">{s.shipment_number}</span>
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
        </div>
      )}

      {tab === 'assets' && (
        <>
          {dc.linked_assets && dc.linked_assets.length > 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="divide-y divide-foreground/[0.03]">
                {dc.linked_assets.map((asset) => (
                  <div key={asset.id || asset.uid} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors"
                    onClick={() => navigate(`/assets/${asset.id}`)}>
                    <div className="flex items-center gap-3">
                      <Package size={14} className="text-foreground/30" />
                      <div>
                        <span className="font-mono text-sm font-bold">{asset.uid}</span>
                        {(asset.oem || asset.model) && <span className="text-foreground/40 text-sm ml-2">{[asset.oem, asset.model].filter(Boolean).join(' ')}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {asset.serial_number && <span className="text-xs font-mono text-foreground/30">{asset.serial_number}</span>}
                      {asset.condition_grade && <span className="text-xs px-2 py-0.5 bg-foreground/[0.05] rounded">{asset.condition_grade}</span>}
                      {asset.status && <StatusBadge status={asset.status} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No assets on this challan.</p>
          )}
        </>
      )}

      {tab === 'addresses' && (
        <>
          {(dc.dispatch_from || dc.ship_to) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dc.dispatch_from && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><MapPin size={14} className="text-foreground/40" /> Dispatch From</h3>
                  <div className="text-sm text-foreground/60 space-y-0.5">
                    {dc.dispatch_from.name && <p className="font-medium text-foreground">{dc.dispatch_from.name}</p>}
                    <p>{dc.dispatch_from.address1 || dc.dispatch_from.streetAddress1}</p>
                    <p>{[dc.dispatch_from.city, dc.dispatch_from.state, dc.dispatch_from.pinCode || dc.dispatch_from.postalCode].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              )}
              {dc.ship_to && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><MapPin size={14} className="text-foreground/40" /> Ship To</h3>
                  <div className="text-sm text-foreground/60 space-y-0.5">
                    {dc.ship_to.name && <p className="font-medium text-foreground">{dc.ship_to.name}</p>}
                    <p>{dc.ship_to.address1 || dc.ship_to.streetAddress1}</p>
                    <p>{[dc.ship_to.city, dc.ship_to.state, dc.ship_to.pinCode || dc.ship_to.postalCode].filter(Boolean).join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No address information available.</p>
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
