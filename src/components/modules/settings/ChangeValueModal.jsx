import { useState } from 'react'
import Modal from '../../common/Modal'

export default function ChangeValueModal({ type, onClose, onSubmit }) {
  const [value, setValue] = useState('')
  const isPhone = type === 'phone'

  return (
    <Modal onClose={onClose}>
      <h2 className="font-heading text-xl font-bold text-[#17113e] mb-4">
        {isPhone ? 'Update mobile number' : 'Update email id'}
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
          {isPhone ? 'Mobile Number' : 'Email ID'}
        </label>
        {isPhone ? (
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#e0e0e0] bg-[#f2f2f2] text-[#828282] text-sm font-body">
              +91
            </span>
            <input
              type="tel"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter mobile number"
              className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-r-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
          </div>
        ) : (
          <input
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your new email id here"
            className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSubmit(isPhone ? `+91 ${value}` : value)}
          disabled={!value}
          className="flex-1 py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] disabled:opacity-60 cursor-pointer transition-colors"
        >
          Submit
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-full border border-[#e0e0e0] text-[#4f4f4f] font-body font-medium text-sm hover:bg-[#f2f2f2] cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}
