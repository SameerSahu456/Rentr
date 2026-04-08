export default function Card({
  children,
  className = '',
  padding = 'p-6',
  border = true,
  rounded = 'rounded-xl',
  shadow = false,
  onClick,
  ...props
}) {
  return (
    <div
      className={`bg-white ${rounded} ${padding} ${
        border ? 'border border-[#f2f2f2]' : ''
      } ${shadow ? 'shadow-lg' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardRow({ label, value, className = '', divided = true }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center px-6 sm:px-8 py-4 ${
        divided ? 'border-b border-[#f2f2f2]' : ''
      } ${className}`}
    >
      <span className="text-[14px] font-semibold font-body text-[#333] sm:w-56 shrink-0">
        {label}
      </span>
      <span className="text-[14px] font-medium font-body text-[#4f4f4f]">{value}</span>
    </div>
  )
}
