import { Check } from 'lucide-react'

export default function Timeline({ steps, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const isCompleted = step.completed
        const isCurrent = step.current

        return (
          <div key={i} className="flex gap-3">
            {/* Indicator column */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-[#6d5ed6] text-white'
                    : isCurrent
                    ? 'border-2 border-[#6d5ed6] bg-white'
                    : 'border-2 border-[#e0e0e0] bg-white'
                }`}
              >
                {isCompleted && <Check className="h-3.5 w-3.5" />}
                {isCurrent && <div className="w-2 h-2 rounded-full bg-[#6d5ed6]" />}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    isCompleted ? 'bg-[#6d5ed6]' : 'bg-[#e0e0e0]'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-sm font-body font-medium ${
                  isCompleted || isCurrent ? 'text-[#333]' : 'text-[#828282]'
                }`}
              >
                {step.title}
              </p>
              {step.subtitle && (
                <p className="text-xs font-body text-[#828282] mt-0.5">{step.subtitle}</p>
              )}
              {step.date && (
                <p className="text-xs font-body text-[#828282] mt-0.5">{step.date}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
