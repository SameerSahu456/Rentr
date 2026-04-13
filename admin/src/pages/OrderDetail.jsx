import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Calendar, CreditCard, FileText, Download, HardDrive, RotateCcw, LifeBuoy, RefreshCw, Upload, Eye, ClipboardList, Truck, FileCheck, Shield, Receipt, ArrowRightLeft, Banknote, CheckCircle2, Clock, Circle, ScrollText } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

const gradeColors = {
  A: 'bg-emerald-500/10 text-emerald-400',
  B: 'bg-blue-500/10 text-blue-400',
  C: 'bg-yellow-500/10 text-yellow-400',
  D: 'bg-orange-500/10 text-orange-400',
  E: 'bg-red-500/10 text-red-400',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [uploadingSO, setUploadingSO] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUploadSalesOrder = async (files) => {
    if (!files?.length) return;
    setUploadingSO(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const result = await api.upload(`/orders/${id}/sales-order-pdf`, formData);
      setOrder(prev => ({ ...prev, sales_order_pdf: result.sales_order_pdf }));
    } catch (e) { console.error('Upload failed:', e); }
    setUploadingSO(false);
  };

  const handleStatusChange = async (status) => {
    try { const updated = await api.put(`/orders/${id}`, { status }); setOrder(updated); } catch { /* ignore */ }
  };

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl">&nbsp;</div>)}</div>;
  if (!order) return <p className="text-foreground/30">Order not found</p>;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
  const shipping = order.shipping_address;
  const contracts = order.contracts || [];
  const assets = order.assets || [];
  const invoices = order.invoices || [];
  const payments = order.payments || [];

  const deliverySteps = [
    { key: 'pending', label: 'Placed' },
    { key: 'proforma_sent', label: 'Proforma' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ];
  const currentDeliveryIdx = deliverySteps.findIndex(s => s.key === (order.delivery_status || 'pending'));

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'contracts', label: `Contracts (${contracts.length})` },
    { key: 'assets', label: `Assets (${assets.length})` },
    { key: 'billing', label: `Billing (${invoices.length})` },
    { key: 'logistics', label: `Logistics (${(order.shipments || []).length})` },
    { key: 'related', label: `Related (${(order.returns || []).length + (order.tickets || []).length})` },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-xs text-foreground/30 hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-brand font-bold text-foreground">{order.order_number}</h1>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${order.source === 'crm' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {order.source === 'crm' ? 'CRM' : 'Website'}
              </span>
              {order.customer_type === 'partner' && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/10 text-purple-400">Partner</span>}
            </div>
            <p className="text-foreground/30 text-sm">
              <span className="text-rentr-primary hover:underline cursor-pointer" onClick={() => navigate(`/customers/${encodeURIComponent(order.customer_email)}`)}>{order.customer_name}</span>
              {' '}&middot; {order.customer_email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <select value={order.status} onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-rentr-primary/50 text-foreground/40">
              {['confirmed', 'active', 'delivered', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Monthly Rent</p>
            <p className="text-lg font-bold text-emerald-500">₹{fmt(order.total_monthly)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Tenure</p>
            <p className="text-lg font-bold">{order.rental_months} months</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Contract Value</p>
            <p className="text-sm font-bold">₹{fmt(order.total_monthly * order.rental_months)}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Delivery</p>
            <StatusBadge status={order.delivery_status || 'pending'} />
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Billing</p>
            <StatusBadge status={order.billing_status || 'not_started'} />
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Next Billing</p>
            <p className="text-sm font-bold">{order.next_billing_date ? new Date(order.next_billing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}</p>
          </div>
        </div>

        {/* Delivery Progress */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-foreground/[0.05] overflow-x-auto">
          {deliverySteps.map((step, i) => (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center min-w-[60px]">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i < currentDeliveryIdx ? 'bg-emerald-500' : i === currentDeliveryIdx ? 'bg-rentr-primary' : 'bg-foreground/[0.08]'}`}>
                  {i < currentDeliveryIdx ? <CheckCircle2 size={14} className="text-white" /> : i === currentDeliveryIdx ? <Clock size={14} className="text-white" /> : <Circle size={10} className="text-foreground/20" />}
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 text-center ${i <= currentDeliveryIdx ? 'text-foreground/60' : 'text-foreground/20'}`}>{step.label}</span>
              </div>
              {i < deliverySteps.length - 1 && <div className={`h-0.5 w-6 sm:w-10 ${i < currentDeliveryIdx ? 'bg-emerald-500' : 'bg-foreground/[0.08]'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Order Items Summary */}
      {order.items && order.items.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <p className="text-[10px] text-foreground/25 uppercase tracking-widest mb-3">Order Items</p>
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-foreground/[0.05]"><th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-2">Product</th><th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-2 text-center">Qty</th><th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-2 text-right">Rate/mo</th><th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-2 text-right">Subtotal/mo</th></tr></thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-foreground/[0.03] last:border-0">
                  <td className="py-2 text-foreground">{item.product_name || item.description}</td>
                  <td className="py-2 text-foreground/60 text-center">{item.quantity}</td>
                  <td className="py-2 text-foreground/60 text-right">₹{fmt(item.price_per_month || item.unit_price)}</td>
                  <td className="py-2 text-foreground font-bold text-right">₹{fmt((item.price_per_month || item.unit_price || 0) * (item.quantity || 1))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-foreground/[0.05]"><td colSpan="3" className="pt-2 text-right text-foreground/50 text-xs">Total Monthly</td><td className="pt-2 text-right font-bold text-foreground">₹{fmt(order.total_monthly)}/mo</td></tr>
            </tfoot>
          </table>
        </div>
      )}

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-5">
            <ScrollText className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{contracts.length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Contracts</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <Package className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{assets.length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Assets</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <FileText className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{invoices.length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Invoices</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <LifeBuoy className="w-5 h-5 text-rentr-primary mb-2" />
            <p className="text-2xl font-bold">{(order.tickets || []).length}</p>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Tickets</p>
          </div>

          {/* Addresses */}
          {shipping && (
            <div className="col-span-full lg:col-span-2 glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><MapPin size={14} className="text-foreground/30" /><p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Shipping Address</p></div>
              <div className="text-sm text-foreground/60 space-y-0.5">
                <p className="font-medium text-foreground">{`${shipping.firstName || ''} ${shipping.lastName || ''}`.trim()}</p>
                <p>{shipping.address1 || shipping.streetAddress1}</p>
                <p>{[shipping.townCity || shipping.city, shipping.state || shipping.countryArea].filter(Boolean).join(', ')} {shipping.pinCode || shipping.postalCode}</p>
              </div>
            </div>
          )}

          {order.customer_note && (
            <div className="col-span-full glass rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-2">Customer Note</p>
              <p className="text-sm text-foreground/60">{order.customer_note}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'contracts' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {contracts.length === 0 ? (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No contracts for this order</p>
            ) : contracts.map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/contracts/${c.id}`)}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{c.contract_number}</p>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-foreground/5 text-foreground/40">v{c.version || 1}</span>
                  </div>
                  <p className="text-xs text-foreground/30">{c.start_date} - {c.end_date} &middot; {c.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  {c.signed_at && <span className="text-[9px] text-emerald-500 font-bold">Signed</span>}
                  <StatusBadge status={c.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'assets' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="divide-y divide-foreground/[0.03]">
            {assets.length === 0 ? (
              <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No assets</p>
            ) : assets.map(a => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/assets/${a.id}`)}>
                <div>
                  <p className="text-sm font-bold font-mono">{a.uid}</p>
                  <p className="text-xs text-foreground/30">{a.oem} {a.model}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm">₹{fmt(a.monthly_rate)}/mo</p>
                  {a.condition_grade && <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${gradeColors[a.condition_grade] || ''}`}>Grade {a.condition_grade}</span>}
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'billing' && (
        <div className="space-y-4">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-foreground/[0.03]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Invoices</p>
            </div>
            <div className="divide-y divide-foreground/[0.03]">
              {invoices.length === 0 ? (
                <p className="px-6 py-8 text-center text-foreground/20 text-xs italic">No invoices</p>
              ) : invoices.map(i => (
                <div key={i.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/invoices/${i.id}`)}>
                  <div>
                    <p className="text-sm font-bold">{i.invoice_number}</p>
                    <p className="text-xs text-foreground/30">Due: {i.due_date || '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm">₹{fmt(i.total)}</p>
                    <StatusBadge status={i.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {payments.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Payments</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {payments.map(p => (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">₹{fmt(p.amount)}</p>
                      <p className="text-xs text-foreground/30">{(p.method || '').replace(/_/g, ' ')} {p.transaction_id ? `· ${p.transaction_id}` : ''}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(order.proforma_invoices || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Proforma Invoices</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {order.proforma_invoices.map(pi => (
                  <div key={pi.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold font-mono">{pi.pi_number}</p>
                      <p className="text-xs text-foreground/30">Deposit: ₹{fmt(pi.security_deposit)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">₹{fmt(pi.total)}</p>
                      <StatusBadge status={pi.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(order.security_deposits || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Security Deposits</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {order.security_deposits.map(d => (
                  <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold font-mono">{d.deposit_number}</p>
                      <p className="text-xs text-foreground/30">{d.received_date || '-'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">₹{fmt(d.amount)}</p>
                      <StatusBadge status={d.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'logistics' && (
        <div className="space-y-4">
          {(order.shipments || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Shipments</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {order.shipments.map(s => (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/shipments/${s.id}`)}>
                    <div>
                      <p className="text-sm font-bold font-mono">{s.shipment_number}</p>
                      <p className="text-xs text-foreground/30">{s.logistics_partner} {s.tracking_number ? `· ${s.tracking_number}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${s.shipment_type === 'return' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{s.shipment_type}</span>
                      <StatusBadge status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(order.delivery_challans || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Delivery Challans</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {order.delivery_challans.map(dc => (
                  <div key={dc.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/delivery-challans/${dc.id}`)}>
                    <div>
                      <p className="text-sm font-bold font-mono">{dc.dc_number}</p>
                      <p className="text-xs text-foreground/30">{dc.transporter_name} {dc.vehicle_number ? `· ${dc.vehicle_number}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">₹{fmt(dc.total_value)}</p>
                      <StatusBadge status={dc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!(order.shipments || []).length && !(order.delivery_challans || []).length && (
            <p className="text-center py-8 text-foreground/20 text-xs italic">No logistics data yet</p>
          )}
        </div>
      )}

      {tab === 'related' && (
        <div className="space-y-4">
          {(order.returns || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Returns</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {order.returns.map(r => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/returns/${r.id}`)}>
                    <div>
                      <p className="text-sm font-bold">{r.return_number}</p>
                      <p className="text-xs text-foreground/30">{r.reason} · {Array.isArray(r.asset_uids) ? r.asset_uids.length : 0} asset(s)</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {(order.tickets || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Support Tickets</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {order.tickets.map(t => (
                  <div key={t.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/support/${t.id}`)}>
                    <div>
                      <p className="text-sm font-bold">{t.ticket_number}</p>
                      <p className="text-xs text-foreground/30">{t.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(order.replacements || []).length > 0 && (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-6 py-3 border-b border-foreground/[0.03]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/25">Replacements</p>
              </div>
              <div className="divide-y divide-foreground/[0.03]">
                {order.replacements.map(r => (
                  <div key={r.id} className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-foreground/[0.02] transition-colors" onClick={() => navigate(`/replacements/${r.id}`)}>
                    <div>
                      <p className="text-sm font-bold font-mono">{r.replacement_number}</p>
                      <p className="text-xs text-foreground/30">{r.faulty_uid} → {r.replacement_uid || 'Pending'}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {!(order.returns || []).length && !(order.tickets || []).length && !(order.replacements || []).length && (
            <p className="text-center py-8 text-foreground/20 text-xs italic">No related items</p>
          )}
        </div>
      )}
    </div>
  );
}
