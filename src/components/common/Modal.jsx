import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  children,
  onClose,
  maxWidth = 'max-w-md',
  className = '',
  showClose = true,
  overlayClass = 'bg-[#17113e]/60',
}) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClass} px-4`}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} p-6 relative ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#828282] hover:text-[#333] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
