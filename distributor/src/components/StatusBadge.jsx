import { cn } from '../lib/utils';

const statusConfig = {
  paid: { color: 'emerald', label: 'Paid' },
  active: { color: 'emerald', label: 'Active' },
  completed: { color: 'emerald', label: 'Completed' },
  approved: { color: 'emerald', label: 'Approved' },
  deployed: { color: 'emerald', label: 'Deployed' },
  confirmed: { color: 'blue', label: 'Confirmed' },
  sent: { color: 'blue', label: 'Sent' },
  in_progress: { color: 'blue', label: 'In Progress' },
  draft: { color: 'amber', label: 'Draft' },
  pending: { color: 'amber', label: 'Pending' },
  pending_signature: { color: 'amber', label: 'Pending Signature' },
  under_review: { color: 'amber', label: 'Under Review' },
  overdue: { color: 'red', label: 'Overdue' },
  rejected: { color: 'red', label: 'Rejected' },
  failed: { color: 'red', label: 'Failed' },
  cancelled: { color: 'gray', label: 'Cancelled' },
  closed: { color: 'gray', label: 'Closed' },
  expired: { color: 'gray', label: 'Expired' },
};

const colorMap = {
  emerald: { dot: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/15' },
  blue: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/15' },
  amber: { dot: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/15' },
  red: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/15' },
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
