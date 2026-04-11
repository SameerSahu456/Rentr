import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, HardDrive, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function ReplacementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rpl, setRpl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/replacements/${id}`)
      .then(setRpl)
      .catch(() => navigate('/replacements'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (status) => {
    try {
      const updated = await api.put(`/replacements/${id}`, { status });
      setRpl(updated);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-rentr-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!rpl) return null;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between border-b border-foreground/[0.05] pb-6">
        <button onClick={() => navigate('/replacements')} className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-foreground/30 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        <div className="flex items-center gap-3">
          <StatusBadge status={rpl.status} />
          <select value={rpl.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-full px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
            <option value="initiated">Initiated</option>
            <option value="approved">Approved</option>
            <option value="replacement_staged">Replacement Staged</option>
            <option value="replacement_shipped">Replacement Shipped</option>
            <option value="replacement_delivered">Replacement Delivered</option>
            <option value="faulty_pickup_scheduled">Faulty Pickup Scheduled</option>
            <option value="faulty_in_transit">Faulty In Transit</option>
            <option value="faulty_received">Faulty Received</option>
            <option value="inspection">Inspection</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <ArrowRightLeft size={20} className="text-orange-500" />
          <span className="font-mono text-foreground/20">{rpl.replacement_number}</span>
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${rpl.replacement_type === 'advance' ? 'bg-red-500/10 text-red-400 border border-red-500/15' : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'}`}>{rpl.replacement_type} Replacement</span>
        </div>
        <h1 className="text-3xl font-brand font-black tracking-tighter text-foreground uppercase">{rpl.customer_name}</h1>
        <span className="text-sm text-foreground/40">{rpl.customer_email}</span>
      </div>

      {/* Info */}
      <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Order</span><span className="font-medium text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/orders?search=${rpl.order_id}`)}>{rpl.order_id}</span></div>
          {rpl.contract_id && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Contract</span><span className="font-medium">{rpl.contract_id}</span></div>}
          <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Reason</span><span className="font-medium capitalize">{(rpl.faulty_reason || '-').replace(/_/g, ' ')}</span></div>
          {rpl.ticket_id && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Ticket</span><span className="font-medium">{rpl.ticket_id}</span></div>}
          {rpl.return_id && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Return</span><span className="font-medium text-rentr-primary cursor-pointer hover:underline" onClick={() => navigate(`/returns?search=${rpl.return_id}`)}>{rpl.return_id}</span></div>}
          {rpl.initiated_by && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Initiated By</span><span className="font-medium">{rpl.initiated_by}</span></div>}
        </div>
        {rpl.fault_description && <div className="mt-4 p-3 bg-red-500/5 border border-red-500/15 rounded-lg text-sm text-foreground/60"><AlertTriangle size={14} className="text-red-500 inline mr-2" />{rpl.fault_description}</div>}
      </div>

      {/* Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl sm:rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={16} className="text-red-500" />
            <h3 className="text-lg font-brand font-black uppercase">Faulty Asset</h3>
          </div>
          {rpl.faulty_asset ? (
            <div className="space-y-2 text-sm cursor-pointer" onClick={() => navigate(`/assets/${rpl.faulty_asset.id}`)}>
              <div className="font-mono font-bold text-red-500">{rpl.faulty_asset.uid}</div>
              <div>{rpl.faulty_asset.oem} {rpl.faulty_asset.model}</div>
              {rpl.faulty_asset.serial_number && <div className="text-foreground/40">S/N: {rpl.faulty_asset.serial_number}</div>}
              <StatusBadge status={rpl.faulty_asset.status} />
            </div>
          ) : (
            <span className="font-mono text-red-500">{rpl.faulty_asset_uid}</span>
          )}
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl sm:rounded-[2rem] p-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={16} className="text-emerald-500" />
            <h3 className="text-lg font-brand font-black uppercase">Replacement Asset</h3>
          </div>
          {rpl.replacement_asset ? (
            <div className="space-y-2 text-sm cursor-pointer" onClick={() => navigate(`/assets/${rpl.replacement_asset.id}`)}>
              <div className="font-mono font-bold text-emerald-500">{rpl.replacement_asset.uid}</div>
              <div>{rpl.replacement_asset.oem} {rpl.replacement_asset.model}</div>
              {rpl.replacement_asset.serial_number && <div className="text-foreground/40">S/N: {rpl.replacement_asset.serial_number}</div>}
              <StatusBadge status={rpl.replacement_asset.status} />
            </div>
          ) : (
            <span className="text-foreground/30 italic">Not yet assigned</span>
          )}
        </div>
      </div>

      {/* Damage Assessment */}
      {rpl.damage_found && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl sm:rounded-[2rem] p-6">
          <h3 className="text-lg font-brand font-black uppercase text-foreground mb-3">Damage Assessment</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Damage Charges</span><span className="font-bold text-red-500 text-lg">₹{fmt(rpl.damage_charges)}</span></div>
            {rpl.damage_notes && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Notes</span><span className="text-foreground/60">{rpl.damage_notes}</span></div>}
          </div>
        </div>
      )}

      {/* DC References */}
      {(rpl.outbound_dc_number || rpl.inbound_dc_number) && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
          <h3 className="text-lg font-brand font-black uppercase text-foreground mb-3">Delivery Challans</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {rpl.outbound_dc_number && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Outbound (Replacement)</span><span className="font-mono">{rpl.outbound_dc_number}</span></div>}
            {rpl.inbound_dc_number && <div><span className="text-[9px] font-bold uppercase tracking-widest text-foreground/20 block">Inbound (Faulty Return)</span><span className="font-mono">{rpl.inbound_dc_number}</span></div>}
          </div>
        </div>
      )}

      {rpl.notes && (
        <div className="bg-foreground/[0.02] border border-foreground/[0.05] rounded-xl sm:rounded-[2rem] p-6">
          <h3 className="text-lg font-brand font-black uppercase text-foreground mb-3">Notes</h3>
          <p className="text-sm text-foreground/60">{rpl.notes}</p>
        </div>
      )}
    </motion.div>
  );
}
