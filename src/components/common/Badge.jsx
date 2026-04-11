const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-teal-100 text-teal-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-red-100 text-red-700',
  overdue: 'bg-orange-100 text-orange-700',
  refunded: 'bg-gray-100 text-gray-700',
  open: 'bg-orange-100 text-orange-700',
  resolved: 'bg-green-100 text-green-700',
  default: 'bg-gray-100 text-gray-700',
}

export default function Badge({ status, children, className = '' }) {
  const key = status?.toLowerCase?.() || 'default'
  const style = STATUS_STYLES[key] || STATUS_STYLES.default

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold font-body rounded-full capitalize ${style} ${className}`}
    >
      {children || status}
    </span>
  )
}
