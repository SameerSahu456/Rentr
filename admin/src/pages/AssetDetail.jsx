import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, HardDrive, Calendar, CreditCard, User, Package, Shield, MapPin, FileText, ArrowRight, RotateCcw, LifeBuoy, Tag as TagIcon, History, CheckCircle2, Clock, ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TagsManager from '../components/TagsManager';

const gradeColors = {
  A: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  B: 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  C: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  D: 'bg-orange-500/10 text-orange-400 border border-orange-500/15',
  E: 'bg-red-500/10 text-red-400 border border-red-500/15',
};

const dataWipeStatusColors = {
  'Not Requested': 'bg-foreground/[0.05] text-foreground/50 border border-foreground/[0.08]',
  'Requested': 'bg-blue-500/10 text-blue-400 border border-blue-500/15',
  'In Progress': 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15',
  'Issued': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
  'Delivered': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

function getWarrantyInfo(warrantyExpiry) {
  if (!warrantyExpiry) return { status: 'unknown', label: 'Unknown', days: null, color: 'text-foreground/40', bgColor: 'bg-foreground/[0.05] text-foreground/50 border border-foreground/[0.08]' };
  const now = new Date();
  const expiry = new Date(warrantyExpiry);
  const diffMs = expiry - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', label: 'Expired', days: Math.abs(diffDays), color: 'text-red-400', bgColor: 'bg-red-500/10 text-red-400 border border-red-500/15' };
  }
  if (diffDays <= 90) {
    return { status: 'expiring_soon', label: 'Expiring Soon', days: diffDays, color: 'text-amber-400', bgColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/15' };
  }
  return { status: 'active', label: 'Active', days: diffDays, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' };
}

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextState, setNextState] = useState('');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [tags, setTags] = useState([]);
  const [dataWipeStatus, setDataWipeStatus] = useState('');
  const [updatingWipeStatus, setUpdatingWipeStatus] = useState(false);

  useEffect(() => {
    api.get(`/assets/${id}`)
      .then((data) => {
        // API returns {asset: {...}, lifecycle_events: [...], order, contract, returns, tickets}
        const a = data.asset || data;
        a.lifecycle_events = data.lifecycle_events || data.events || [];
        a.order = data.order || null;
        a.contract = data.contract || null;
        a.returns = data.returns || [];
        a.tickets = data.tickets || [];
        setAsset(a);
        setTags(a.tags || []);
        setDataWipeStatus(a.data_wipe_status || 'Not Requested');
      })
      .catch(() => navigate('/assets'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleTransition = async () => {
    if (!nextState) return;
    setTransitioning(true);
    try {
      const data = await api.post(`/assets/${id}/transition`, {
        to_state: nextState,
        notes: transitionNotes,
      });
      const a = data.asset || data;
      a.lifecycle_events = data.lifecycle_events || data.events || asset.lifecycle_events || [];
      a.order = data.order || asset.order;
      a.contract = data.contract || asset.contract;
      a.returns = data.returns || asset.returns || [];
      a.tickets = data.tickets || asset.tickets || [];
      setAsset(a);
      setNextState('');
      setTransitionNotes('');
    } catch { /* ignore */ }
    setTransitioning(false);
  };

  const handleDataWipeStatusChange = async (newStatus) => {
    setUpdatingWipeStatus(true);
    try {
      await api.patch(`/assets/${id}`, { data_wipe_status: newStatus });
      setDataWipeStatus(newStatus);
      setAsset((prev) => ({ ...prev, data_wipe_status: newStatus }));
    } catch { /* ignore */ }
    setUpdatingWipeStatus(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!asset) return null;

  const validStates = asset.valid_transitions || [
    'in_warehouse', 'staged', 'in_transit', 'deployed', 'return_initiated', 'in_repair', 'retired',
  ];

  const events = asset.events || asset.lifecycle_events || [];
  const warrantyInfo = getWarrantyInfo(asset.warranty_expiry);

  const handleTagsChange = async (newTags) => {
    setTags(newTags);
    try {
      await api.patch(`/assets/${id}`, { tags: newTags });
    } catch { /* ignore - local state already updated */ }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Sticky Header Bar */}
      <div className="flex items-center justify-between border-b border-foreground/[0.06] pb-6">
        <button
          onClick={() => navigate('/assets')}
          className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Assets
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={asset.status} />
          {asset.condition_grade && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${gradeColors[asset.condition_grade] || 'bg-foreground/[0.05] text-foreground/60'}`}>
              Grade {asset.condition_grade}
            </span>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Primary Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 rounded-md bg-rentr-primary/10 text-rentr-primary text-[9px] font-bold uppercase tracking-widest border border-rentr-primary/20">
                  {asset.category || 'Asset'}
                </span>
                <span className="text-[10px] font-mono text-foreground/20">{asset.uid}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase leading-none">
                {[asset.oem, asset.model].filter(Boolean).join(' ') || asset.uid}
              </h1>
            </div>
            {asset.monthly_rate && (
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-1">Monthly Rate</p>
                <p className="text-3xl font-brand font-black text-rentr-primary">₹{fmt(asset.monthly_rate)}</p>
              </div>
            )}
          </div>

          {/* Specs Grid */}
          <div className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
            <h2 className="text-lg font-brand font-bold uppercase tracking-tight text-foreground mb-6 pb-4 border-b border-foreground/[0.04]">
              Asset Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <InfoItem icon={HardDrive} label="OEM / Model" value={[asset.oem, asset.model].filter(Boolean).join(' / ') || '-'} />
              <InfoItem icon={Package} label="Specs" value={asset.specs && typeof asset.specs === 'object' ? Object.entries(asset.specs).map(([k, v]) => `${k}: ${v}`).join(', ') : (asset.specs || '-')} />
              <InfoItem icon={FileText} label="Serial Number" value={asset.serial_number || '-'} />
              <InfoItem icon={CreditCard} label="Acquisition Cost" value={`₹${fmt(asset.acquisition_cost)}`} />
              <InfoItem icon={Calendar} label="Acquisition Date" value={asset.acquisition_date ? new Date(asset.acquisition_date).toLocaleDateString('en-IN') : '-'} />
              <InfoItem icon={Shield} label="Warranty Expiry" value={asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString('en-IN') : '-'} />
              <InfoItem icon={Shield} label="Warranty Provider" value={asset.warranty_provider || '-'} />
              <InfoItem icon={MapPin} label="Site" value={asset.site || '-'} />
              {asset.customer_email ? (
                <div className="flex items-start gap-2">
                  <User size={16} className="text-foreground/20 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Customer</span>
                    <span className="text-sm font-bold text-rentr-primary hover:text-rentr-primary-light cursor-pointer hover:underline transition-colors" onClick={() => navigate(`/customers/${encodeURIComponent(asset.customer_email)}`)}>{asset.customer_name || asset.customer || '-'}</span>
                  </div>
                </div>
              ) : (
                <InfoItem icon={User} label="Customer" value={asset.customer_name || asset.customer || '-'} />
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-brand font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-rentr-primary" />
                Asset Tags
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">{tags.length} Tags</span>
            </div>
            <TagsManager tags={tags} onTagsChange={handleTagsChange} />
          </div>
        </div>

        {/* Right: Status & Timeline */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.06] space-y-6">
            <div className="space-y-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Current Status</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rentr-primary/10 border border-rentr-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-rentr-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-brand font-black text-foreground uppercase">{(asset.status || '').replace(/_/g, ' ')}</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-background border border-foreground/[0.05]">
                <Clock className="w-3.5 h-3.5 text-rentr-primary mb-1.5" />
                <p className="text-[8px] font-bold uppercase tracking-widest text-foreground/20">Category</p>
                <p className="text-xs font-bold text-foreground">{asset.category || '-'}</p>
              </div>
              <div className="p-3 rounded-xl bg-background border border-foreground/[0.05]">
                <Shield className="w-3.5 h-3.5 text-rentr-primary mb-1.5" />
                <p className="text-[8px] font-bold uppercase tracking-widest text-foreground/20">Condition</p>
                <p className="text-xs font-bold text-foreground">Grade {asset.condition_grade || '-'}</p>
              </div>
            </div>
          </div>

          {/* Warranty Status Card */}
          <div className="p-6 rounded-2xl bg-foreground/[0.02] border border-foreground/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">Warranty Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${warrantyInfo.bgColor}`}>
                {warrantyInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                warrantyInfo.status === 'expired' ? 'bg-red-500/10 border border-red-500/20' :
                warrantyInfo.status === 'expiring_soon' ? 'bg-amber-500/10 border border-amber-500/20' :
                warrantyInfo.status === 'active' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                'bg-foreground/[0.05] border border-foreground/[0.08]'
              }`}>
                {warrantyInfo.status === 'expired' ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : warrantyInfo.status === 'expiring_soon' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                {warrantyInfo.days !== null ? (
                  <>
                    <h3 className={`text-lg font-brand font-black ${warrantyInfo.color}`}>
                      {warrantyInfo.status === 'expired'
                        ? `${warrantyInfo.days} days ago`
                        : `${warrantyInfo.days} days left`}
                    </h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20">
                      {warrantyInfo.status === 'expired' ? 'Warranty expired' : 'Until expiry'}
                    </p>
                  </>
                ) : (
                  <h3 className="text-sm font-bold text-foreground/40">No warranty date set</h3>
                )}
              </div>
            </div>

            {warrantyInfo.status === 'expiring_soon' && (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-400">
                    Warranty expiring within 90 days. Consider renewal or warranty claim.
                  </p>
                </div>
              </div>
            )}

            {warrantyInfo.status === 'expired' && (
              <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-[10px] font-bold text-red-400">
                    Warranty has expired. Any repairs will not be covered.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-background border border-foreground/[0.05]">
                <Calendar className="w-3.5 h-3.5 text-rentr-primary mb-1.5" />
                <p className="text-[8px] font-bold uppercase tracking-widest text-foreground/20">Expiry Date</p>
                <p className="text-xs font-bold text-foreground">
                  {asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString('en-IN') : '-'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-background border border-foreground/[0.05]">
                <Shield className="w-3.5 h-3.5 text-rentr-primary mb-1.5" />
                <p className="text-[8px] font-bold uppercase tracking-widest text-foreground/20">Provider</p>
                <p className="text-xs font-bold text-foreground">{asset.warranty_provider || '-'}</p>
              </div>
            </div>
          </div>

          {/* Lifecycle Timeline (compact) */}
          {events.length > 0 && (
            <div className="p-6 space-y-6">
              <h2 className="text-base font-brand font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-rentr-primary" />
                History
              </h2>
              <div className="space-y-6 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[1px] before:bg-foreground/[0.06]">
                {events.slice(0, 5).map((event, i) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-background border border-foreground/[0.06] flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-rentr-primary" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-0.5">
                      {event.timestamp ? new Date(event.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                    </p>
                    <h4 className="text-xs font-bold text-foreground">
                      {(event.from_state || '').replace(/_/g, ' ')} → {(event.to_state || '').replace(/_/g, ' ')}
                    </h4>
                    <p className="text-[9px] text-foreground/30 uppercase tracking-widest mt-0.5">
                      {event.triggered_by && `By ${event.triggered_by}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Transition */}
      <div className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
        <h2 className="text-lg font-brand font-bold uppercase tracking-tight text-foreground mb-6 pb-4 border-b border-foreground/[0.04]">State Transition</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={nextState}
            onChange={(e) => setNextState(e.target.value)}
            className="w-full bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rentr-primary/30 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/15 text-foreground flex-1"
          >
            <option value="">Select next state...</option>
            {validStates.filter((s) => s !== asset.status).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={transitionNotes}
            onChange={(e) => setTransitionNotes(e.target.value)}
            className="w-full bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rentr-primary/30 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/15 text-foreground flex-1"
          />
          <button
            onClick={handleTransition}
            disabled={!nextState || transitioning}
            className="group flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] bg-foreground text-background rounded-xl border border-foreground/10 hover:bg-rentr-primary hover:text-white hover:border-rentr-primary/30 transition-all duration-500 disabled:opacity-50"
          >
            {transitioning ? 'Transitioning...' : 'Transition'}
          </button>
        </div>
      </div>

      {/* Data Wipe Certificate Tracking */}
      <div className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.04]">
          <ShieldCheck size={18} className="text-foreground/40" />
          <h2 className="text-lg font-brand font-bold uppercase tracking-tight text-foreground">Data Wipe Certificate</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              dataWipeStatus === 'Issued' || dataWipeStatus === 'Delivered'
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : dataWipeStatus === 'In Progress'
                ? 'bg-yellow-500/10 border border-yellow-500/20'
                : dataWipeStatus === 'Requested'
                ? 'bg-blue-500/10 border border-blue-500/20'
                : 'bg-foreground/[0.05] border border-foreground/[0.08]'
            }`}>
              <ShieldCheck className={`w-5 h-5 ${
                dataWipeStatus === 'Issued' || dataWipeStatus === 'Delivered'
                  ? 'text-emerald-400'
                  : dataWipeStatus === 'In Progress'
                  ? 'text-yellow-400'
                  : dataWipeStatus === 'Requested'
                  ? 'text-blue-400'
                  : 'text-foreground/30'
              }`} />
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${dataWipeStatusColors[dataWipeStatus] || dataWipeStatusColors['Not Requested']}`}>
                {dataWipeStatus}
              </span>
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 mt-1.5">Certificate Status</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(dataWipeStatus === 'Issued' || dataWipeStatus === 'Delivered') && asset.data_wipe_cert_url && (
              <a
                href={asset.data_wipe_cert_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15 hover:bg-emerald-500/20 transition-all duration-500"
              >
                <Download className="w-3.5 h-3.5" />
                Download Certificate
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-foreground/[0.04]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 mb-3">Update Status</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={dataWipeStatus}
              onChange={(e) => handleDataWipeStatusChange(e.target.value)}
              disabled={updatingWipeStatus}
              className="w-full sm:w-auto bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rentr-primary/30 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/15 text-foreground disabled:opacity-50"
            >
              <option value="Not Requested">Not Requested</option>
              <option value="Requested">Requested</option>
              <option value="In Progress">In Progress</option>
              <option value="Issued">Issued</option>
              <option value="Delivered">Delivered</option>
            </select>
            {updatingWipeStatus && (
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                <div className="w-3.5 h-3.5 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      {(asset.order || asset.contract || asset.customer_email) && (
        <div>
          <h2 className="text-lg font-brand font-bold uppercase tracking-tight text-foreground mb-3">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            {asset.order && (
              <button
                onClick={() => navigate(`/orders/${asset.order.id}`)}
                className="flex items-center gap-3 bg-card/50 rounded-2xl border border-foreground/[0.06] p-4 backdrop-blur-sm hover:border-rentr-primary/20 hover:bg-rentr-primary/[0.02] transition-all duration-500 text-left"
              >
                <Package size={18} className="text-blue-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">Order {asset.order.order_number}</div>
                  <StatusBadge status={asset.order.status} />
                </div>
              </button>
            )}
            {asset.contract && (
              <button
                onClick={() => navigate(`/contracts/${asset.contract.id}`)}
                className="flex items-center gap-3 bg-card/50 rounded-2xl border border-foreground/[0.06] p-4 backdrop-blur-sm hover:border-rentr-primary/20 hover:bg-rentr-primary/[0.02] transition-all duration-500 text-left"
              >
                <FileText size={18} className="text-green-500" />
                <div>
                  <div className="text-sm font-medium text-foreground">Contract {asset.contract.contract_number}</div>
                  <StatusBadge status={asset.contract.status} />
                </div>
              </button>
            )}
            {asset.customer_email && (
              <button
                onClick={() => navigate(`/customers/${encodeURIComponent(asset.customer_email)}`)}
                className="flex items-center gap-3 bg-card/50 rounded-2xl border border-foreground/[0.06] p-4 backdrop-blur-sm hover:border-rentr-primary/20 hover:bg-rentr-primary/[0.02] transition-all duration-500 text-left"
              >
                <User size={18} className="text-purple-500" />
                <div className="text-sm font-medium text-foreground">Customer: {asset.customer_name || asset.customer_email}</div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Linked Returns */}
      {asset.returns && asset.returns.length > 0 && (
        <div className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.04]">
            <RotateCcw size={18} className="text-foreground/40" />
            <h2 className="text-lg font-brand font-bold uppercase tracking-tight text-foreground">Linked Returns</h2>
          </div>
          <div className="divide-y divide-foreground/[0.04]">
            {asset.returns.map((ret) => (
              <button
                key={ret.id}
                onClick={() => navigate(`/returns/${ret.id}`)}
                className="w-full flex items-center justify-between py-3 px-2 hover:bg-rentr-primary/[0.02] hover:border-rentr-primary/10 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-foreground">#{ret.return_number || ret.id}</span>
                  <StatusBadge status={ret.status} />
                  <span className="text-foreground/40">{ret.reason || '-'}</span>
                </div>
                <ArrowRight size={14} className="text-foreground/30" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Linked Tickets */}
      {asset.tickets && asset.tickets.length > 0 && (
        <div className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-foreground/[0.04]">
            <LifeBuoy size={18} className="text-foreground/40" />
            <h2 className="text-lg font-brand font-bold uppercase tracking-tight text-foreground">Linked Tickets</h2>
          </div>
          <div className="divide-y divide-foreground/[0.04]">
            {asset.tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/support/${t.id}`)}
                className="w-full flex items-center justify-between py-3 px-2 hover:bg-rentr-primary/[0.02] hover:border-rentr-primary/10 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-foreground">#{t.ticket_number || t.id}</span>
                  <span className="text-foreground/70">{t.subject}</span>
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
                <ArrowRight size={14} className="text-foreground/30" />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={16} className="text-foreground/20 mt-0.5 shrink-0" />
      <div className="space-y-0.5">
        <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">{label}</span>
        <span className="text-sm font-bold text-foreground">{value}</span>
      </div>
    </div>
  );
}
