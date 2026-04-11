import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', dark = true }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  }

  const lineSizes = {
    sm: 'h-[2px]',
    md: 'h-[2px]',
    lg: 'h-[3px]',
    xl: 'h-[3px]'
  }

  const dotSizes = {
    sm: 'h-[2px] w-[2px]',
    md: 'h-[2px] w-[2px]',
    lg: 'h-[3px] w-[3px]',
    xl: 'h-[3px] w-[3px]'
  }

  return (
    <Link to="/" className="inline-flex flex-col font-heading font-black uppercase leading-none tracking-tight select-none no-underline">
      <div className={`flex items-baseline ${sizes[size]}`}>
        <span className={dark ? 'text-white' : 'text-dark'}> RENT</span>
        <span className="text-primary">R</span>
      </div>
      <div className="flex gap-[3px] mt-[0.08em] w-full">
        <div className={`${lineSizes[size]} flex-1 rounded-full bg-primary`} />
        <div className={`${dotSizes[size]} rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-300'}`} />
        <div className={`${dotSizes[size]} rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-300'}`} />
        <div className={`${dotSizes[size]} rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-300'}`} />
      </div>
    </Link>
  )
}
