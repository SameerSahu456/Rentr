import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  renderOption,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(
    (opt) => (typeof opt === 'string' ? opt : opt.value) === value
  )
  const label = selected
    ? typeof selected === 'string'
      ? selected
      : selected.label
    : placeholder

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 w-full px-4 py-2.5 text-sm font-body border border-gray-300 rounded-lg bg-white hover:border-[#6d5ed6] transition-colors cursor-pointer ${buttonClassName}`}
      >
        <span className={value ? 'text-[#333]' : 'text-[#828282]'}>{label}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#828282] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-20 top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto ${menuClassName}`}
        >
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value
            const lbl = typeof opt === 'string' ? opt : opt.label
            const isActive = val === value

            return (
              <button
                key={val}
                onClick={() => { onChange(val); setOpen(false) }}
                className={`w-full text-left px-4 py-2.5 text-sm font-body transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#6d5ed6]/10 text-[#6d5ed6] font-medium'
                    : 'text-[#333] hover:bg-[#f8f8f8]'
                }`}
              >
                {renderOption ? renderOption(opt, isActive) : lbl}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
