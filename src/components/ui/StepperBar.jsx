import { Check } from 'lucide-react'

export default function StepperBar({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, i) => {
        const label = typeof step === 'string' ? step : step.label
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep
        const isClickable = onStepClick && i <= currentStep

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <button
              onClick={isClickable ? () => onStepClick(i) : undefined}
              disabled={!isClickable}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-body shrink-0 transition-colors ${
                isCompleted
                  ? 'bg-[#6d5ed6] text-white cursor-pointer'
                  : isCurrent
                  ? 'bg-[#6d5ed6] text-white'
                  : 'bg-[#e0e0e0] text-[#828282]'
              }`}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
            </button>

            {/* Label */}
            <span
              className={`ml-2 text-xs font-body hidden sm:inline ${
                isCompleted || isCurrent
                  ? 'text-[#333] font-medium'
                  : 'text-[#828282]'
              }`}
            >
              {label}
            </span>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 ${
                  isCompleted ? 'bg-[#6d5ed6]' : 'bg-[#e0e0e0]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
