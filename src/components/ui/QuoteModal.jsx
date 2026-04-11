import { useState } from 'react'
import Modal from '../common/Modal'

export default function QuoteModal({ onClose }) {
  const [tab, setTab] = useState('customer')
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    product: '', quantity: '', duration: '', message: '',
  })

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onClose()
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#6d5ed6] focus:ring-1 focus:ring-[#6d5ed6] transition-colors placeholder-gray-400 font-body'

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <h2 className="font-heading text-xl font-bold text-[#17113e] mb-1">
        Get a Quote
      </h2>
      <p className="text-sm text-[#828282] font-body mb-5">
        Fill in the details and we will get back to you shortly.
      </p>

      {/* Tab toggle */}
      <div className="flex bg-[#f2f2f2] rounded-full p-1 mb-6">
        {['customer', 'distributor'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium font-body rounded-full transition-colors cursor-pointer capitalize ${
              tab === t
                ? 'bg-white text-[#17113e] shadow-sm'
                : 'text-[#828282]'
            }`}
          >
            {t === 'customer' ? 'Customer' : 'Distributor'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="Enter your name"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="Enter your email"
              className={inputClass}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              placeholder="Enter phone number"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Company
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={handleChange('company')}
              placeholder="Company name"
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Product Interest
            </label>
            <select
              value={formData.product}
              onChange={handleChange('product')}
              className={inputClass}
            >
              <option value="">Select product</option>
              <option value="servers">Servers</option>
              <option value="laptops">Laptops</option>
              <option value="desktops">Desktops</option>
              <option value="storage">Storage</option>
              <option value="network">Network Equipment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              placeholder="How many units?"
              className={inputClass}
              min="1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={handleChange('message')}
            placeholder="Tell us about your requirements"
            className={`${inputClass} min-h-[80px] resize-none`}
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5a4bb8] cursor-pointer transition-colors"
        >
          Submit Request
        </button>
      </form>
    </Modal>
  )
}
