import { cn } from '../lib/utils';

const statusConfig = {
  // Green statuses
  paid: { color: 'emerald', label: 'Paid' },
  active: { color: 'emerald', label: 'Active' },
  resolved: { color: 'emerald', label: 'Resolved' },
  completed: { color: 'emerald', label: 'Completed' },
  approved: { color: 'emerald', label: 'Approved' },
  deployed: { color: 'emerald', label: 'Deployed' },
  verified: { color: 'emerald', label: 'Verified' },
  on_track: { color: 'emerald', label: 'On Track' },
  available: { color: 'emerald', label: 'Available' },
  // Blue statuses
  confirmed: { color: 'blue', label: 'Confirmed' },
  sent: { color: 'blue', label: 'Sent' },
  in_progress: { color: 'blue', label: 'In Progress' },
  'in progress': { color: 'blue', label: 'In Progress' },
  in_warehouse: { color: 'blue', label: 'In Warehouse' },
  processing: { color: 'blue', label: 'Processing' },
  shipped: { color: 'blue', label: 'Shipped' },
  delivered: { color: 'blue', label: 'Delivered' },
  // Indigo
  staged: { color: 'indigo', label: 'Staged' },
  // Cyan
  in_transit: { color: 'cyan', label: 'In Transit' },
  // Amber/Yellow
  draft: { color: 'amber', label: 'Draft' },
  pending: { color: 'amber', label: 'Pending' },
  pending_signature: { color: 'amber', label: 'Pending Signature' },
  open: { color: 'amber', label: 'Open' },
  under_review: { color: 'amber', label: 'Under Review' },
  pickup_scheduled: { color: 'amber', label: 'Pickup Scheduled' },
  // Orange
  at_risk: { color: 'orange', label: 'At Risk' },
  in_repair: { color: 'orange', label: 'In Repair' },
  damage_review: { color: 'orange', label: 'Damage Review' },
  maintenance: { color: 'orange', label: 'Maintenance' },
  // Red
  overdue: { color: 'red', label: 'Overdue' },
  urgent: { color: 'red', label: 'Urgent' },
  rejected: { color: 'red', label: 'Rejected' },
  return_initiated: { color: 'red', label: 'Return Initiated' },
  breached: { color: 'red', label: 'Breached' },
  failed: { color: 'red', label: 'Failed' },
  // Teal
  received_grn: { color: 'teal', label: 'Received GRN' },
  // Gray
  cancelled: { color: 'gray', label: 'Cancelled' },
  closed: { color: 'gray', label: 'Closed' },
  expired: { color: 'gray', label: 'Expired' },
  retired: { color: 'gray', label: 'Retired' },
};

const colorMap = {
  emerald: { dot: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/15' },
  blue: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/15' },
  indigo: { dot: 'bg-indigo-500', text: 'text-indigo-400', bg: 'bg-indigo-500/5', border: 'border-indigo-500/15' },
  cyan: { dot: 'bg-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-500/5', border: 'border-cyan-500/15' },
  amber: { dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/15' },
  orange: { dot: 'bg-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/15' },
  red: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/15' },
  teal: { dot: 'bg-teal-500', text: 'text-teal-400', bg: 'bg-teal-500/5', border: 'border-teal-500/15' },
  gray: { dot: 'bg-foreground/30', text: 'text-foreground/40', bg: 'bg-foreground/[0.03]', border: 'border-foreground/[0.08]' },
};

export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().replace(/ /g, '_');
  const config = statusConfig[normalized];
  const colors = colorMap[config?.color] || colorMap.gray;

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border',
      colors.bg, colors.text, colors.border
    )}>
      <span className={cn('w-1 h-1 rounded-full', colors.dot)} />
      {config?.label || status}
    </span>
  );
}
