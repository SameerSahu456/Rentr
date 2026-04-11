import { ChevronDown } from 'lucide-react'

export function AccordionItem({
  title,
  children,
  isOpen,
  onToggle,
  icon: Icon,
  className = '',
  titleClassName = '',
  contentClassName = '',
}) {
  return (
    <div className={className}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between py-4 cursor-pointer ${titleClassName}`}
      >
        <span className="flex items-center gap-2 text-left">
          {Icon && <Icon className="h-5 w-5 text-[#6d5ed6]" />}
          <span className="font-heading font-bold text-[#17113e] text-[15px]">{title}</span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-[#828282] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && <div className={contentClassName}>{children}</div>}
    </div>
  )
}

export default function Accordion({
  items,
  openIndex,
  onChange,
  className = '',
  divided = true,
}) {
  return (
    <div className={className}>
      {items.map((item, i) => (
        <AccordionItem
          key={item.key || i}
          title={item.title}
          icon={item.icon}
          isOpen={openIndex === i}
          onToggle={() => onChange(openIndex === i ? -1 : i)}
          className={divided && i < items.length - 1 ? 'border-b border-gray-300' : ''}
          titleClassName={item.titleClassName}
          contentClassName={item.contentClassName}
        >
          {typeof item.content === 'function' ? item.content() : item.content}
        </AccordionItem>
      ))}
    </div>
  )
}
