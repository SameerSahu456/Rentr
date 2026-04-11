import { DollarSign, Shield, RefreshCw, Zap } from 'lucide-react'

const benefits = [
  {
    icon: <DollarSign size={28} className="text-primary" />,
    title: "Pay as you use",
    description: "The rental model offers flexibility and makes sure that you pay only for your usage. This allows healthier cash flows for better financial health of your business.",
  },
  {
    icon: <Shield size={28} className="text-primary" />,
    title: "Tax advantages",
    description: "All the rental or leasing payments are 100% tax deductible unlike depreciation with IT ownership. Renting and leasing is an educated financial decision.",
  },
  {
    icon: <RefreshCw size={28} className="text-primary" />,
    title: "Hassle free refresh",
    description: "Technology changes every year. Why shouldn't you have the latest and the greatest? Rentr solves this with easy, no-cost upgrades whenever you need them.",
  },
  {
    icon: <Zap size={28} className="text-primary" />,
    title: "Financing with Rentr",
    description: "We help you in getting the best finance for your IT requirements. Renting and leasing is a smarter way to keep your business running with latest tech.",
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        {/* Header */}
        <div className="mb-10">
          <p className="text-primary text-sm font-medium mb-2">Why you should rent</p>
          <h2 className="font-heading text-[24px] md:text-[28px] font-bold text-gray-1 leading-tight max-w-lg">
            A smarter way to equip your business with the latest technology.
          </h2>
        </div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="max-w-full sm:max-w-[276px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-sm font-bold text-gray-2 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-3 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
