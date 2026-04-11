import { Check } from 'lucide-react'
import Logo from '../../layout/Logo'

/* ------------------------------------------------------------------ */
/*  Customer Stepper Bar (dark navbar with dot separators)             */
/* ------------------------------------------------------------------ */

export function CustomerStepperBar({ steps }) {
  return (
    <div className="bg-[#17113e] py-4">
      <div className="section-container">
        <div className="flex items-center justify-center gap-0 overflow-x-auto">
          {steps.map((s, i) => {
            const isActive = i === 0
            const isCompleted = false
            return (
              <div key={s.key} className="flex items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${
                      isActive
                        ? 'bg-white text-[#17113e] border-white'
                        : isCompleted
                        ? 'bg-[#6d5ed6] border-[#6d5ed6] text-white'
                        : 'border-white/40 text-white/40'
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-sm font-['Poppins'] whitespace-nowrap hidden sm:inline ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-white/60 font-normal'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="mx-4 flex items-center gap-1">
                    <span className="w-1.5 h-0.5 bg-white/30 rounded-full" />
                    <span className="w-1.5 h-0.5 bg-white/30 rounded-full" />
                    <span className="w-1.5 h-0.5 bg-white/30 rounded-full" />
                    <span className="w-1.5 h-0.5 bg-white/30 rounded-full" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Distributor Stepper Bar (dark navbar with progress line)           */
/* ------------------------------------------------------------------ */

export function DistributorStepperBar({ steps, step, onStepClick }) {
  return (
    <div className="bg-dark w-full">
      <div className="section-container">
        <div className="flex items-center py-4 gap-3 md:gap-6">
          {/* Logo */}
          <div className="shrink-0 mr-2 md:mr-4 hidden md:block">
            <Logo size="sm" dark={true} />
          </div>

          {/* Steps */}
          <nav className="flex-1">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((s, i) => {
                const isActive = i === step
                const isCompleted = i < step

                return (
                  <div key={s.key} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => onStepClick && onStepClick(i)}
                      className={`flex flex-col items-center ${
                        i <= step ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isActive
                            ? 'bg-primary text-white ring-2 ring-primary/30'
                            : isCompleted
                            ? 'bg-primary text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {isCompleted ? <Check size={14} /> : i + 1}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 font-medium whitespace-nowrap hidden sm:block ${
                          isActive
                            ? 'text-white'
                            : isCompleted
                            ? 'text-primary-light'
                            : 'text-white/30'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                    {i < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 mt-[-14px] rounded-full transition-colors ${
                          i < step ? 'bg-primary' : 'bg-white/10'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}
