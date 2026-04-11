export default function BenefitsMarquee({ items }) {
  return (
    <div className="mt-5 overflow-hidden">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 whitespace-nowrap">
            {item}
            {i < items.length - 1 && <span className="mx-1">•</span>}
          </span>
        ))}
        <button className="text-primary font-medium whitespace-nowrap">View All &gt;</button>
      </div>
    </div>
  )
}
