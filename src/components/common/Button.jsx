import { forwardRef } from 'react'

const VARIANTS = {
  primary:
    'bg-[#6d5ed6] text-white hover:bg-[#5a4bb8] active:scale-[0.98]',
  outline:
    'border border-gray-300 text-gray-700 hover:bg-gray-50',
  ghost:
    'text-[#6d5ed6] hover:bg-[#6d5ed6]/5',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  dark:
    'bg-[#17113e] text-white hover:bg-[#231754] active:scale-[0.98]',
}

const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-sm',
  xl: 'px-10 py-3.5 text-base',
}

const SHAPES = {
  rounded: 'rounded-full',
  rect: 'rounded-lg',
  pill: 'rounded-full',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'lg',
    shape = 'rounded',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    type = 'button',
    ...props
  },
  ref
) {
  const base =
    'inline-flex items-center justify-center font-medium font-body transition-all duration-200 cursor-pointer'
  const disabledClass = 'disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant] || ''} ${SIZES[size] || ''} ${SHAPES[shape] || ''} ${disabledClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="h-4 w-4 mr-2 shrink-0" />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="h-4 w-4 ml-2 shrink-0" />
      )}
    </button>
  )
})

export default Button
