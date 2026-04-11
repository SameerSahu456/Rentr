import Modal from '../../common/Modal'
import { Check } from 'lucide-react'

export default function SuccessModal({ type, value, onClose }) {
  const isPhone = type === 'phone'
  return (
    <Modal onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="font-heading text-xl font-bold text-[#17113e] mb-2">Successful</h2>
        <p className="text-sm font-body text-[#828282] mb-6">
          Your {isPhone ? 'mobile number' : 'email ID'} has changed to{' '}
          <span className="font-medium text-[#17113e]">{value}</span> successfully
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] cursor-pointer transition-colors"
        >
          Done
        </button>
      </div>
    </Modal>
  )
}
