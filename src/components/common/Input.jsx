import { forwardRef } from 'react'

const SHAPES = {
  rounded: 'rounded-full px-5 py-3',
  rect: 'rounded-lg px-4 py-3',
}

const Input = forwardRef(function Input(
  {
    label,
    error,
    shape = 'rounded',
    icon: Icon,
    iconPosition = 'left',
    className = '',
    wrapperClassName = '',
    labelClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const baseInput =
    'w-full border border-gray-300 text-sm font-body focus:outline-none focus:border-[#6d5ed6] focus:ring-1 focus:ring-[#6d5ed6] transition-colors placeholder-gray-400'

  const errorInput = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : ''

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className={`block text-sm font-semibold font-body text-[#333] mb-1.5 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#828282]" />
        )}
        <input
          ref={ref}
          className={`${baseInput} ${SHAPES[shape] || ''} ${errorInput} ${
            Icon && iconPosition === 'left' ? 'pl-10' : ''
          } ${Icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <Icon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#828282]" />
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 font-body">{error}</p>
      )}
    </div>
  )
})

export default Input
