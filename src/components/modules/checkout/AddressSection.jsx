import { Plus } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Customer Address Section (split-panel: address + reference)        */
/* ------------------------------------------------------------------ */

export function CustomerAddressSection({
  address,
  onAddressChange,
  reference,
  onReferenceChange,
  showMoreDetails,
  onToggleMoreDetails,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left half: Address form */}
        <div className="flex-1 p-6 lg:p-8">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-[#17113e] mb-6">
            Delivery Address
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Country Region
              </label>
              <select
                name="country"
                value={address.country}
                onChange={onAddressChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] focus:outline-none focus:border-[#6d5ed6] transition-colors bg-white"
              >
                <option value="India">India</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Address Line 1
              </label>
              <input
                type="text"
                name="address1"
                value={address.address1}
                onChange={onAddressChange}
                placeholder="Street address, P.O. box"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Address Line 2
              </label>
              <input
                type="text"
                name="address2"
                value={address.address2}
                onChange={onAddressChange}
                placeholder="Apartment, suite, unit, building, floor"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Pin code
              </label>
              <input
                type="text"
                name="pinCode"
                value={address.pinCode}
                onChange={onAddressChange}
                placeholder="110001"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Area / Colony
              </label>
              <input
                type="text"
                name="area"
                value={address.area}
                onChange={onAddressChange}
                placeholder="Enter area or colony"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Town / city
              </label>
              <input
                type="text"
                name="townCity"
                value={address.townCity}
                onChange={onAddressChange}
                placeholder="Enter city"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                State
              </label>
              <input
                type="text"
                name="state"
                value={address.state}
                onChange={onAddressChange}
                placeholder="Select state"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-px bg-[#e0e0e0] my-6" />

        {/* Right half: Reference / Contact person */}
        <div className="flex-1 p-6 lg:p-8 border-t lg:border-t-0">
          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#17113e] mb-6">
            Reference / Contact person
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={reference.name}
                onChange={onReferenceChange}
                placeholder="Contact person name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={reference.contactNumber}
                onChange={onReferenceChange}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                Email ID
              </label>
              <input
                type="email"
                name="email"
                value={reference.email}
                onChange={onReferenceChange}
                placeholder="contact@company.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>

            {/* Add more details toggle */}
            <button
              onClick={onToggleMoreDetails}
              className="inline-flex items-center gap-1.5 text-sm font-['Poppins'] text-[#6d5ed6] font-medium hover:underline"
            >
              <Plus size={15} />
              Add more details
            </button>

            {showMoreDetails && (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={reference.designation}
                    onChange={onReferenceChange}
                    placeholder="e.g. IT Manager"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={reference.department}
                    onChange={onReferenceChange}
                    placeholder="e.g. Information Technology"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                    Skype ID
                  </label>
                  <input
                    type="text"
                    name="skypeId"
                    value={reference.skypeId}
                    onChange={onReferenceChange}
                    placeholder="live:example"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Poppins'] font-medium text-[#4f4f4f] mb-1.5">
                    FAX
                  </label>
                  <input
                    type="text"
                    name="fax"
                    value={reference.fax}
                    onChange={onReferenceChange}
                    placeholder="+91-11-12345678"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-['Poppins'] text-[#333] placeholder:text-[#bdbdbd] focus:outline-none focus:border-[#6d5ed6] transition-colors"
                  />
                </div>
              </div>
            )}

            <button className="w-full bg-[#6d5ed6] text-white font-['Poppins'] font-medium py-2.5 rounded-lg hover:bg-[#5b4ec4] transition-colors mt-4">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Distributor Address Form (reusable sub-form)                       */
/* ------------------------------------------------------------------ */

export function DistributorAddressForm({ title, address, onChange }) {
  return (
    <div>
      <h4 className="font-heading font-semibold text-dark mb-4">{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-2 mb-1">Country/Region</label>
          <select
            name="country"
            value={address.country}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="India">India</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-2 mb-1">Address Line 1</label>
          <input
            type="text"
            name="address1"
            value={address.address1}
            onChange={onChange}
            placeholder="Building, Street"
            className="w-full border border-gray-300 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-2 mb-1">Address Line 2</label>
          <input
            type="text"
            name="address2"
            value={address.address2}
            onChange={onChange}
            placeholder="Landmark, Area (optional)"
            className="w-full border border-gray-300 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-2 mb-1">Pin code (6 digit)</label>
          <input
            type="text"
            name="pinCode"
            value={address.pinCode}
            onChange={onChange}
            placeholder="500001"
            maxLength={6}
            className="w-full border border-gray-300 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-2 mb-1">Area/Colony/Street</label>
          <input
            type="text"
            name="area"
            value={address.area}
            onChange={onChange}
            placeholder="Area / Colony / Street"
            className="w-full border border-gray-300 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-2 mb-1">Town/City</label>
          <input
            type="text"
            name="townCity"
            value={address.townCity}
            onChange={onChange}
            placeholder="Town / City"
            className="w-full border border-gray-300 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-2 mb-1">State/Province/Region</label>
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={onChange}
            placeholder="Telangana"
            className="w-full border border-gray-300 rounded-lg h-[48px] px-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Distributor Billing + Shipping Address Section (accordion content) */
/* ------------------------------------------------------------------ */

export function DistributorAddressSection({
  billingAddress,
  onBillingChange,
  shippingAddress,
  onShippingChange,
  sameAsBilling,
  onSameAsBillingChange,
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Billing Address */}
      <div className="flex-1 min-w-0">
        <DistributorAddressForm
          title="Billing Address"
          address={billingAddress}
          onChange={onBillingChange}
        />
      </div>

      {/* Shipping Address */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-heading font-semibold text-dark">Shipping Address</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={onSameAsBillingChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">Same as billing address</span>
          </label>
        </div>

        {sameAsBilling ? (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-dark mb-1">Using billing address</p>
            <p>
              {[billingAddress.address1, billingAddress.address2, billingAddress.townCity, billingAddress.state, billingAddress.pinCode, billingAddress.country]
                .filter(Boolean)
                .join(', ') || 'Fill in billing address first'}
            </p>
          </div>
        ) : (
          <DistributorAddressForm
            title=""
            address={shippingAddress}
            onChange={onShippingChange}
          />
        )}
      </div>
    </div>
  )
}
