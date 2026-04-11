import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

export default function HeroQuoteModal({ onClose }) {
  const [tab, setTab] = useState('customer')
  const [formData, setFormData] = useState({
    fullName: '', phoneNumber: '', productCategory: '', subcategory: '',
    productName: '', locationOfDelivery: '', rentalPeriod: '', additionalNeeds: '',
  })

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Get our team to help you find the right IT<br />solution for you
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setTab('customer')}
              className={`px-5 py-2 rounded-full text-sm font-medium ${tab === 'customer' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
              Customer
            </button>
            <button onClick={() => setTab('distributor')}
              className={`px-5 py-2 rounded-full text-sm font-medium ${tab === 'distributor' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
              Distributor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input type="text" value={formData.fullName} onChange={handleChange('fullName')}
                placeholder="Enter your name" className="input-field-rect" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <input type="tel" value={formData.phoneNumber} onChange={handleChange('phoneNumber')}
                  placeholder="Enter phone" className="input-field-rect" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" placeholder="Enter city" className="input-field-rect" />
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 pt-2">Query Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                <div className="relative">
                  <select value={formData.productCategory} onChange={handleChange('productCategory')}
                    className="input-field-rect appearance-none pr-10">
                    <option value="">Select</option>
                    <option value="servers">Servers</option>
                    <option value="laptops">Laptops</option>
                    <option value="desktops">Desktops</option>
                    <option value="workstations">Workstations</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input type="text" value={formData.productName} onChange={handleChange('productName')}
                  placeholder="Choose / enter the option" className="input-field-rect" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location of Delivery *</label>
                <input type="text" value={formData.locationOfDelivery} onChange={handleChange('locationOfDelivery')}
                  placeholder="Enter address of delivery" className="input-field-rect" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental period</label>
                <input type="text" value={formData.rentalPeriod} onChange={handleChange('rentalPeriod')}
                  placeholder="Select" className="input-field-rect" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Needs (if)</label>
              <textarea value={formData.additionalNeeds} onChange={handleChange('additionalNeeds')}
                placeholder="Tell us more" className="input-field-rect min-h-[80px] rounded-lg" rows={3} />
            </div>

            <button type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-10 py-3 rounded-full font-semibold text-sm transition-colors">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
