import { useState } from 'react'
import { Phone } from 'lucide-react'

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', product: '', company: '', email: '', details: '',
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary'

  return (
    <div className="section-container py-10">
      <div className="max-w-xl">
        <h2 className="font-heading text-xl font-bold text-dark mb-2">
          Can&apos;t find what your looking for
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Get in touch? We&apos;d love to hear from you. Here&apos;s how you can reach out
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange('name')}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">Product name</label>
            <input
              type="text"
              placeholder="Eg. Desktop"
              value={form.product}
              onChange={handleChange('product')}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark block mb-1.5">Company</label>
              <input
                type="text"
                placeholder="Eg. SBI Mutual"
                value={form.company}
                onChange={handleChange('company')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-dark block mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="xyz@email.com"
                value={form.email}
                onChange={handleChange('email')}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-dark block mb-1.5">Additional Details</label>
            <textarea
              placeholder="How can we help ?"
              value={form.details}
              onChange={handleChange('details')}
              className={`${inputClass} h-20 resize-none`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-primary text-white font-semibold px-8 py-2.5 rounded-full hover:bg-primary-dark transition-colors text-sm">
              Submit
            </button>
            <button className="border border-gray-300 text-dark font-medium px-6 py-2.5 rounded-full hover:border-primary hover:text-primary transition-colors text-sm flex items-center gap-2">
              <Phone size={14} />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
