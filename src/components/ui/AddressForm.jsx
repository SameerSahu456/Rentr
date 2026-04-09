export default function AddressForm({
  title,
  address = {},
  onChange,
  className = '',
}) {
  const handleChange = (field) => (e) => {
    onChange({ ...address, [field]: e.target.value })
  }

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors'

  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-heading font-bold text-[#17113e] mb-4">{title}</h3>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
            Address Line 1
          </label>
          <input
            type="text"
            value={address.line1 || ''}
            onChange={handleChange('line1')}
            placeholder="Flat/House No., Building Name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
            Address Line 2
          </label>
          <input
            type="text"
            value={address.line2 || ''}
            onChange={handleChange('line2')}
            placeholder="Street, Area, Landmark"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              City
            </label>
            <input
              type="text"
              value={address.city || ''}
              onChange={handleChange('city')}
              placeholder="City"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              State
            </label>
            <input
              type="text"
              value={address.state || ''}
              onChange={handleChange('state')}
              placeholder="State"
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              value={address.pincode || ''}
              onChange={handleChange('pincode')}
              placeholder="Pincode"
              className={inputClass}
              maxLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              Phone
            </label>
            <input
              type="tel"
              value={address.phone || ''}
              onChange={handleChange('phone')}
              placeholder="Phone number"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
