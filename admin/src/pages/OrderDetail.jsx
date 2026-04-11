import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Calendar, CreditCard, FileText, Download, HardDrive, RotateCcw, LifeBuoy, RefreshCw, Upload, Eye, ClipboardList, Truck, FileCheck, Shield, Receipt, ArrowRightLeft, Banknote, CheckCircle2, Clock, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import DataTable from '../components/DataTable';

const gradeColors = {
  A: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  B: 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  C: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  D: 'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  E: 'bg-red-500/10 text-red-400 border border-red-500/15',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [uploadingSO, setUploadingSO] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(setOrder)
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (order?.id) {
      api.get(`/contracts/?order_id=${order.id}`)
        .then((data) => {
          const items = Array.isArray(data) ? data : data.items || [];
          if (items.length > 0) setContract(items[0]);
        })
        .catch(() => {});
    }
  }, [order?.id]);

  const handleUploadSalesOrder = async (files) => {
    if (!files?.length) return;
    setUploadingSO(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      const result = await api.upload(`/orders/${id}/sales-order-pdf`, formData);
      setOrder(prev => ({ ...prev, sales_order_pdf: result.sales_order_pdf }));
    } catch (e) {
      console.error('Upload failed:', e);
    }
    setUploadingSO(false);
  };

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.put(`/orders/${id}`, { status });
      setOrder(updated);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
  const shipping = order.shipping_address;
  const billing = order.billing_address;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/orders')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 transition-all text-foreground/40"
          >
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Hero */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
              Order
            </span>
            <span className="text-[10px] font-mono text-foreground/20">{order.order_number}</span>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
              order.source === 'crm'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
            }`}>
              {order.source === 'crm' ? 'CRM' : 'Website'}
            </span>
            {order.crm_order_id && (
              <span className="text-[10px] font-mono text-foreground/20">CRM: {order.crm_order_id}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
            <span className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(order.customer_email)}`)}>{order.customer_name}</span>
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Monthly Rent</span>
          <div className="text-3xl font-brand font-black tracking-tighter text-foreground">{`\u20B9${fmt(order.total_monthly)}`}<span className="text-base text-foreground/30">/mo</span></div>
        </div>
      </div>

      {/* Order Info Grid */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div className="flex items-start gap-2">
            <User size={16} className="text-foreground/30 mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span>
              <span className="font-medium text-foreground">
                <span className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(order.customer_email)}`)}>{order.customer_name}</span>
                <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  order.customer_type === 'partner'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                }`}>
                  {order.customer_type === 'partner' ? 'Partner' : 'Customer'}
                </span>
              </span>
              <span className="text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors block text-xs" onClick={() => navigate(`/customers/${encodeURIComponent(order.customer_email)}`)}>{order.customer_email}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CreditCard size={16} className="text-foreground/30 mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Monthly Rent</span>
              <span className="font-medium text-foreground text-lg">{`\u20B9${fmt(order.total_monthly)}`}/mo</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-foreground/30 mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Rental Tenure</span>
              <span className="font-medium text-foreground">{order.rental_months} months</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-foreground/30 mt-0.5 shrink-0" />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Order Date</span>
              <span className="font-medium text-foreground">
                {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery & Billing Status Banner */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
          <Truck size={18} className="text-blue-500" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Delivery & Billing Status</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Delivery Status</span>
            <StatusBadge status={order.delivery_status || 'pending'} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Billing Status</span>
            <StatusBadge status={order.billing_status || 'not_started'} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Billing Start</span>
            <span className="font-medium text-foreground">
              {order.billing_start_date
                ? new Date(order.billing_start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : <span className="text-foreground/30 italic">After delivery</span>}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Billing End</span>
            <span className="font-medium text-foreground">
              {order.billing_end_date
                ? new Date(order.billing_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '-'}
            </span>
          </div>
        </div>
        {/* Delivery Timeline */}
        {(() => {
          const steps = [
            { key: 'pending', label: 'Order Placed' },
            { key: 'proforma_sent', label: 'Proforma Sent' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'dispatched', label: 'Dispatched' },
            { key: 'in_transit', label: 'In Transit' },
            { key: 'out_for_delivery', label: 'Out for Delivery' },
            { key: 'delivered', label: 'Delivered' },
          ];
          const currentIdx = steps.findIndex(s => s.key === (order.delivery_status || 'pending'));
          return (
            <div className="flex items-center gap-1 mt-6 overflow-x-auto">
              {steps.map((step, i) => (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center min-w-[70px]">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      i < currentIdx ? 'bg-emerald-500' : i === currentIdx ? 'bg-rentr-primary' : 'bg-foreground/[0.08]'
                    }`}>
                      {i < currentIdx ? <CheckCircle2 size={14} className="text-white" /> : i === currentIdx ? <Clock size={14} className="text-white" /> : <Circle size={10} className="text-foreground/20" />}
                    </div>
                    <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 text-center ${
                      i <= currentIdx ? 'text-foreground/60' : 'text-foreground/20'
                    }`}>{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 w-6 sm:w-10 ${i < currentIdx ? 'bg-emerald-500' : 'bg-foreground/[0.08]'}`} />
                  )}
                </div>
              ))}
            </div>
          );
        })()}
        {order.delivered_at && (
          <div className="mt-4 text-xs text-foreground/40">
            Delivered on {new Date(order.delivered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {order.delivery_confirmed_by && ` — confirmed by ${order.delivery_confirmed_by}`}
          </div>
        )}
      </div>

      {/* Next Billing Date */}
      {order.next_billing_date && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Calendar size={20} className="text-amber-500" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 block">Next Billing Date</span>
              <span className="text-lg font-brand font-black text-foreground">
                {new Date(order.next_billing_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 block">Amount Due</span>
            <span className="text-lg font-brand font-black text-foreground">{`\u20B9${fmt(order.total_monthly)}`}<span className="text-sm text-foreground/30">/mo + tax</span></span>
          </div>
        </div>
      )}

      {/* Sales Order PDF (CRM orders only) */}
      {order.source === 'crm' && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-orange-500" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Sales Order</h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-orange-500/10 text-orange-400 border border-orange-500/15">CRM</span>
            </div>
            <div className="flex items-center gap-2">
              {order.sales_order_pdf && (
                <>
                  <a
                    href={order.sales_order_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest hover:text-foreground hover:border-foreground/20 transition-all"
                  >
                    <Eye size={14} />
                    View PDF
                  </a>
                  <a
                    href={order.sales_order_pdf}
                    download
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
                  >
                    <Download size={14} />
                    Download
                  </a>
                </>
              )}
              <label className="flex items-center gap-2 px-5 py-3 rounded-full border border-foreground/[0.05] text-foreground/40 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-foreground hover:border-foreground/20 transition-all">
                <Upload size={14} />
                {uploadingSO ? 'Uploading...' : order.sales_order_pdf ? 'Replace' : 'Upload PDF'}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled={uploadingSO}
                  onChange={(e) => handleUploadSalesOrder(e.target.files)}
                />
              </label>
            </div>
          </div>
          {!order.sales_order_pdf && (
            <p className="text-foreground/20 text-sm mt-4">No sales order PDF uploaded yet. Upload the CRM sales order document.</p>
          )}
          {order.sales_order_pdf && (
            <div className="mt-4 flex items-center gap-3 py-3 px-4 bg-foreground/[0.01] rounded-2xl border border-foreground/[0.04]">
              <FileText size={18} className="text-orange-400" />
              <div>
                <span className="text-sm font-medium text-foreground">Sales Order PDF</span>
                <span className="block text-[10px] text-foreground/30">{order.sales_order_pdf.split('/').pop()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
          <Package size={18} className="text-foreground/40" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Order Items</h2>
        </div>
        {order.items && order.items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-foreground/[0.05]">
                <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3" colSpan="2">Product</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3">Qty</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3 text-right">Price/mo</th>
                <th className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 pb-3 text-right">Subtotal/mo</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-foreground/[0.04] last:border-0">
                  <td className="py-3 w-16">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-14 h-14 object-cover rounded-lg border border-foreground/[0.06] bg-muted"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg border border-foreground/[0.06] bg-muted flex items-center justify-center">
                        <Package size={20} className="text-foreground/20" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-foreground font-medium">{item.product_name || item.description || 'Product'}</td>
                  <td className="py-3 text-foreground/70">{item.quantity}</td>
                  <td className="py-3 text-foreground/70 text-right">{`\u20B9${fmt(item.price_per_month || item.unit_price || 0)}`}</td>
                  <td className="py-3 text-foreground font-medium text-right">
                    {`\u20B9${fmt((item.price_per_month || item.unit_price || 0) * (item.quantity || 1))}`}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-foreground/[0.05]">
                <td colSpan="4" className="pt-3 text-right font-semibold text-foreground/70">Total Monthly Rent</td>
                <td className="pt-3 text-right font-bold text-foreground text-base">{`\u20B9${fmt(order.total_monthly)}`}/mo</td>
              </tr>
              <tr>
                <td colSpan="4" className="pt-1 text-right text-foreground/40 text-xs">Total Contract Value ({order.rental_months} months)</td>
                <td className="pt-1 text-right font-semibold text-foreground/70">{`\u20B9${fmt(order.total_monthly * order.rental_months)}`}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <p className="text-foreground/30 text-sm">No items</p>
        )}
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shipping && (
          <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
              <MapPin size={16} className="text-foreground/40" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Shipping Address</h3>
            </div>
            <div className="text-sm text-foreground/70 space-y-1">
              {(shipping.firstName || shipping.lastName) && (
                <p className="font-medium">{`${shipping.firstName || ''} ${shipping.lastName || ''}`.trim()}</p>
              )}
              <p>{shipping.address1 || shipping.streetAddress1}</p>
              {(shipping.address2 || shipping.streetAddress2) && <p>{shipping.address2 || shipping.streetAddress2}</p>}
              <p>{[shipping.townCity || shipping.city, shipping.state || shipping.countryArea].filter(Boolean).join(', ')}</p>
              <p>{shipping.pinCode || shipping.postalCode} {shipping.country || 'India'}</p>
            </div>
          </div>
        )}
        {billing && (
          <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
              <MapPin size={16} className="text-foreground/40" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Billing Address</h3>
            </div>
            <div className="text-sm text-foreground/70 space-y-1">
              {(billing.firstName || billing.lastName) && (
                <p className="font-medium">{`${billing.firstName || ''} ${billing.lastName || ''}`.trim()}</p>
              )}
              <p>{billing.address1 || billing.streetAddress1}</p>
              {(billing.address2 || billing.streetAddress2) && <p>{billing.address2 || billing.streetAddress2}</p>}
              <p>{[billing.townCity || billing.city, billing.state || billing.countryArea].filter(Boolean).join(', ')}</p>
              <p>{billing.pinCode || billing.postalCode} {billing.country || 'India'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rental Agreement */}
      {contract && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-green-600" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Rental Agreement</h2>
            </div>
            <div className="flex items-center gap-2">
              {contract.document_url && (
                <a
                  href={`/api/contracts/${contract.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-rentr-primary hover:text-white transition-all duration-500"
                >
                  <Download size={14} />
                  Download PDF
                </a>
              )}
              <button
                onClick={() => navigate(`/contracts/${contract.id}`)}
                className="p-3 rounded-full border border-foreground/[0.05] text-foreground/40 hover:text-foreground hover:border-foreground/20 transition-all"
              >
                View Contract
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Contract #</span>
              <span className="font-medium text-foreground">{contract.contract_number}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Status</span>
              <span className="font-medium text-foreground capitalize">{contract.status}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Period</span>
              <span className="font-medium text-foreground">{contract.start_date} to {contract.end_date}</span>
            </div>
            {contract.signed_at && (
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Auto-Signed</span>
                <span className="font-medium text-green-600">
                  {new Date(contract.signed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linked Assets */}
      {order.assets && order.assets.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Linked Assets</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'uid', label: 'UID', render: (v) => <span className="font-mono font-bold">{v}</span> },
                { key: 'oem', label: 'OEM / Model', render: (_, row) => [row.oem, row.model].filter(Boolean).join(' / ') || '-' },
                { key: 'category', label: 'Category' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'condition_grade', label: 'Grade', render: (v) => v ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${gradeColors[v] || 'bg-foreground/[0.05] text-foreground/60'}`}>Grade {v}</span> : '-' },
                { key: 'monthly_rate', label: 'Monthly Rate', render: (v) => v ? `₹${fmt(v)}` : '-' },
              ]}
              data={order.assets}
              loading={false}
              onRowClick={(row) => navigate(`/assets/${row.id}`)}
              emptyMessage="No assets."
            />
          </div>
        </div>
      )}

      {/* Linked Invoices */}
      {order.invoices && order.invoices.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Linked Invoices</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'invoice_number', label: 'Invoice #' },
                { key: 'total', label: 'Total', render: (v) => `₹${fmt(v)}` },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'due_date', label: 'Due Date', render: (v) => v || '-' },
              ]}
              data={order.invoices}
              loading={false}
              onRowClick={(row) => navigate(`/invoices/${row.id}`)}
              emptyMessage="No invoices."
            />
          </div>
        </div>
      )}

      {/* Linked Payments */}
      {order.payments && order.payments.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Linked Payments</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'invoice_number', label: 'Invoice #' },
                { key: 'amount', label: 'Amount', render: (v) => `₹${fmt(v)}` },
                { key: 'method', label: 'Method', render: (v) => (v || '').replace(/_/g, ' ') },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'transaction_id', label: 'Transaction ID' },
              ]}
              data={order.payments}
              loading={false}
              emptyMessage="No payments."
            />
          </div>
        </div>
      )}

      {/* Linked Returns */}
      {order.returns && order.returns.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Linked Returns</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'return_number', label: 'Return #' },
                { key: 'reason', label: 'Reason' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'asset_uids', label: 'Assets', render: (v) => Array.isArray(v) ? v.length : 0 },
                { key: 'damage_charges', label: 'Damage', render: (v) => v ? `₹${fmt(v)}` : '-' },
              ]}
              data={order.returns}
              loading={false}
              onRowClick={(row) => navigate(`/returns/${row.id}`)}
              emptyMessage="No returns."
            />
          </div>
        </div>
      )}

      {/* Linked Support Tickets */}
      {order.tickets && order.tickets.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Linked Support Tickets</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'ticket_number', label: 'Ticket #' },
                { key: 'subject', label: 'Subject' },
                { key: 'priority', label: 'Priority', render: (v) => <StatusBadge status={v} /> },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              ]}
              data={order.tickets}
              loading={false}
              onRowClick={(row) => navigate(`/support/${row.id}`)}
              emptyMessage="No tickets."
            />
          </div>
        </div>
      )}

      {/* Advance Replacements */}
      {order.advance_replacements && order.advance_replacements.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
            <RefreshCw size={18} className="text-orange-500" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Advance Replacements</h2>
          </div>
          <div className="space-y-3">
            {order.advance_replacements.map((ar, i) => (
              <div key={i} className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className="font-mono font-bold text-red-500 cursor-pointer hover:underline"
                      onClick={() => ar.faulty_id && navigate(`/assets/${ar.faulty_id}`)}
                    >
                      {ar.faulty_uid}
                    </span>
                    <span className="text-foreground/30">→</span>
                    {ar.replacement_uid ? (
                      <span
                        className="font-mono font-bold text-green-500 cursor-pointer hover:underline"
                        onClick={() => ar.replacement_id && navigate(`/assets/${ar.replacement_id}`)}
                      >
                        {ar.replacement_uid}
                      </span>
                    ) : (
                      <span className="text-foreground/30 italic">Awaiting replacement</span>
                    )}
                  </div>
                  <StatusBadge status={ar.status} />
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-foreground/40">
                  {ar.faulty_model && <span>Faulty: {ar.faulty_model}</span>}
                  {ar.replacement_model && <span>Replacement: {ar.replacement_model}</span>}
                  {ar.reason && <span>Reason: {ar.reason}</span>}
                  {ar.return_id && <span className="text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/returns?search=${ar.return_id}`)}>Return: {ar.return_id}</span>}
                  {ar.created_at && <span>{new Date(ar.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </div>
                {ar.notes && <p className="text-xs text-foreground/50 mt-1">{ar.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proforma Invoices */}
      {order.proforma_invoices && order.proforma_invoices.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Proforma Invoices</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'pi_number', label: 'PI #', render: (v) => <span className="font-mono font-bold">{v}</span> },
                { key: 'total', label: 'Total', render: (v) => `₹${fmt(v)}` },
                { key: 'security_deposit', label: 'Security Deposit', render: (v) => v ? `₹${fmt(v)}` : '-' },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' },
              ]}
              data={order.proforma_invoices}
              loading={false}
              onRowClick={(row) => navigate(`/proforma-invoices/${row.id}`)}
              emptyMessage="No proforma invoices."
            />
          </div>
        </div>
      )}

      {/* Logistics — Combined Shipments & Delivery Challans */}
      {((order.shipments && order.shipments.length > 0) || (order.delivery_challans && order.delivery_challans.length > 0) || order.logistics) && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-foreground/[0.05]">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-rentr-primary" />
              <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Logistics</h2>
            </div>
            <div className="flex items-center gap-3">
              {order.logistics && (
                <>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[9px] font-bold uppercase tracking-widest border border-purple-500/15">
                    {order.logistics.total_shipments || (order.shipments || []).length} Shipment{((order.logistics?.total_shipments ?? (order.shipments || []).length) !== 1) ? 's' : ''}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest border border-blue-500/15">
                    {order.logistics.total_challans || (order.delivery_challans || []).length} Challan{((order.logistics?.total_challans ?? (order.delivery_challans || []).length) !== 1) ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Shipments Sub-Section */}
          {(order.shipments || order.logistics?.shipments || []).length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">Shipments</h3>
              </div>
              <div className="space-y-3">
                {(order.shipments || order.logistics?.shipments || []).map((s) => (
                  <div key={s.id} className="p-4 bg-purple-500/5 border border-purple-500/15 rounded-xl cursor-pointer hover:bg-purple-500/10 transition-colors"
                       onClick={() => navigate(`/shipments/${s.id}`)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-purple-500">{s.shipment_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                          s.shipment_type === 'return' ? 'bg-red-500/10 text-red-400' :
                          s.shipment_type === 'replacement' ? 'bg-orange-500/10 text-orange-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>{s.shipment_type}</span>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-foreground/40">
                      {s.logistics_partner && <span>Partner: {s.logistics_partner}</span>}
                      {s.tracking_number && <span>AWB: {s.tracking_number}</span>}
                      {s.estimated_delivery && <span>ETA: {new Date(s.estimated_delivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {s.created_at && <span>Created: {new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                      {s.asset_uids && <span>Assets: {s.asset_uids.length}</span>}
                      {s.tracking_url && (
                        <a href={s.tracking_url} target="_blank" rel="noopener noreferrer"
                           className="text-rentr-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                          Track Shipment
                        </a>
                      )}
                    </div>
                    {/* Shipment Timeline */}
                    {s.timeline && s.timeline.length > 0 && (
                      <div className="flex items-center gap-1 mt-3 overflow-x-auto">
                        {s.timeline.map((step, i) => (
                          <div key={i} className="flex items-center">
                            <div className="flex flex-col items-center min-w-[60px]">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                i < s.timeline.length - 1 ? 'bg-emerald-500' : 'bg-rentr-primary'
                              }`}>
                                {i < s.timeline.length - 1
                                  ? <CheckCircle2 size={12} className="text-white" />
                                  : <Clock size={12} className="text-white" />}
                              </div>
                              <span className="text-[7px] font-bold uppercase tracking-widest mt-1 text-center text-foreground/40">
                                {(step.status || step.description || '').replace(/_/g, ' ').substring(0, 12)}
                              </span>
                            </div>
                            {i < s.timeline.length - 1 && (
                              <div className="h-0.5 w-4 sm:w-6 bg-emerald-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Challans Sub-Section */}
          {(order.delivery_challans || order.logistics?.delivery_challans || []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/40">Delivery Challans</h3>
              </div>
              <div className="space-y-3">
                {(order.delivery_challans || order.logistics?.delivery_challans || []).map((dc) => (
                  <div key={dc.id} className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors"
                       onClick={() => navigate(`/delivery-challans/${dc.id}`)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-blue-500">{dc.dc_number}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                          dc.challan_type === 'inward' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                        }`}>{(dc.challan_type || '').replace(/_/g, ' ')}</span>
                      </div>
                      <StatusBadge status={dc.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs mt-2">
                      {dc.transporter_name && (
                        <div>
                          <span className="text-foreground/20 block text-[8px] uppercase tracking-widest">Transporter</span>
                          <span className="text-foreground/60">{dc.transporter_name}</span>
                        </div>
                      )}
                      {dc.vehicle_number && (
                        <div>
                          <span className="text-foreground/20 block text-[8px] uppercase tracking-widest">Vehicle</span>
                          <span className="text-foreground/60 font-mono">{dc.vehicle_number}</span>
                        </div>
                      )}
                      {dc.eway_bill_number && (
                        <div>
                          <span className="text-foreground/20 block text-[8px] uppercase tracking-widest">E-Way Bill</span>
                          <span className="text-foreground/60 font-mono">{dc.eway_bill_number}</span>
                        </div>
                      )}
                      {dc.total_value > 0 && (
                        <div>
                          <span className="text-foreground/20 block text-[8px] uppercase tracking-widest">Value</span>
                          <span className="text-foreground/60 font-semibold">{`\u20B9${fmt(dc.total_value)}`}</span>
                        </div>
                      )}
                    </div>
                    {dc.items && dc.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-500/10">
                        <span className="text-[8px] uppercase tracking-widest text-foreground/20 mb-1 block">Items ({dc.items.length})</span>
                        <div className="flex flex-wrap gap-2">
                          {dc.items.slice(0, 5).map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-500/5 border border-blue-500/10 rounded text-[9px] font-mono text-foreground/40">
                              {item.uid || item.description || `Item ${idx + 1}`}
                            </span>
                          ))}
                          {dc.items.length > 5 && (
                            <span className="px-2 py-0.5 text-[9px] text-foreground/30">+{dc.items.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Replacements (Unified: Normal + Advance) */}
      {order.replacements && order.replacements.length > 0 && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.05]">
            <ArrowRightLeft size={18} className="text-orange-500" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground">Replacements</h2>
          </div>
          <div className="space-y-3">
            {order.replacements.map((r) => (
              <div key={r.id} className="p-4 bg-orange-500/5 border border-orange-500/15 rounded-xl cursor-pointer hover:bg-orange-500/10 transition-colors"
                   onClick={() => navigate(`/replacements/${r.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-orange-500">{r.replacement_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                      r.replacement_type === 'advance'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'
                    }`}>{r.replacement_type}</span>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="font-mono text-red-500" onClick={(e) => { e.stopPropagation(); r.faulty_id && navigate(`/assets/${r.faulty_id}`); }}>
                    {r.faulty_uid}
                  </span>
                  <span className="text-foreground/30">→</span>
                  {r.replacement_uid ? (
                    <span className="font-mono text-green-500" onClick={(e) => { e.stopPropagation(); r.replacement_id && navigate(`/assets/${r.replacement_id}`); }}>
                      {r.replacement_uid}
                    </span>
                  ) : (
                    <span className="text-foreground/30 italic">Awaiting replacement</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-foreground/40">
                  {r.faulty_reason && <span>Reason: {r.faulty_reason}</span>}
                  {r.faulty_model && <span>Faulty: {r.faulty_model}</span>}
                  {r.replacement_model && <span>Replacement: {r.replacement_model}</span>}
                  {r.outbound_dc_number && <span>Out DC: {r.outbound_dc_number}</span>}
                  {r.inbound_dc_number && <span>In DC: {r.inbound_dc_number}</span>}
                  {r.damage_charges > 0 && <span className="text-red-400">Damage: ₹{fmt(r.damage_charges)}</span>}
                  {r.return_id && <span className="text-rentr-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/returns?search=${r.return_id}`); }}>Return: {r.return_id}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Deposits */}
      {order.security_deposits && order.security_deposits.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Security Deposits</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'deposit_number', label: 'Deposit #', render: (v) => <span className="font-mono font-bold">{v}</span> },
                { key: 'amount', label: 'Amount', render: (v) => `₹${fmt(v)}` },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
                { key: 'received_date', label: 'Received', render: (v) => v || '-' },
                { key: 'refund_amount', label: 'Refund', render: (v) => v > 0 ? `₹${fmt(v)}` : '-' },
                { key: 'deductions', label: 'Deductions', render: (v) => v > 0 ? `₹${fmt(v)}` : '-' },
              ]}
              data={order.security_deposits}
              loading={false}
              emptyMessage="No security deposits."
            />
          </div>
        </div>
      )}

      {/* Credit / Debit Notes */}
      {order.credit_notes && order.credit_notes.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Credit / Debit Notes</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'cn_number', label: 'Note #', render: (v) => <span className="font-mono font-bold">{v}</span> },
                { key: 'note_type', label: 'Type', render: (v) => <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${v === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{v}</span> },
                { key: 'reason', label: 'Reason' },
                { key: 'total', label: 'Amount', render: (v) => `₹${fmt(v)}` },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              ]}
              data={order.credit_notes}
              loading={false}
              emptyMessage="No credit/debit notes."
            />
          </div>
        </div>
      )}

      {/* Insurance Policies */}
      {order.insurance_policies && order.insurance_policies.length > 0 && (
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground mb-6">Insurance Policies</h2>
          <div className="border-t border-foreground/[0.05]">
            <DataTable
              columns={[
                { key: 'policy_number', label: 'Policy #' },
                { key: 'provider', label: 'Provider' },
                { key: 'coverage_type', label: 'Coverage' },
                { key: 'sum_insured', label: 'Sum Insured', render: (v) => `₹${fmt(v)}` },
                { key: 'premium', label: 'Premium', render: (v) => `₹${fmt(v)}` },
                { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
              ]}
              data={order.insurance_policies}
              loading={false}
              emptyMessage="No insurance policies."
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {order.customer_note && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-brand font-black uppercase tracking-tight text-foreground border-b border-foreground/[0.05] pb-4 mb-4">Customer Note</h3>
          <p className="text-sm text-foreground/60">{order.customer_note}</p>
        </div>
      )}

      {/* Saleor Reference */}
      {order.saleor_order_id && (
        <div className="text-xs text-foreground/30 text-right">
          Saleor Ref: {order.saleor_order_id}
        </div>
      )}
    </motion.div>
  );
}
