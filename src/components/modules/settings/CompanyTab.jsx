import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import FileUpload from '../../common/FileUpload'

export default function CompanyTab({ user, activeSubTab = 'company', entityLabel = 'Company Name' }) {
  const [companySubTab, setCompanySubTab] = useState(activeSubTab)

  useEffect(() => {
    setCompanySubTab(activeSubTab)
  }, [activeSubTab])

  // Company state
  const [companyName, setCompanyName] = useState(user?.company_name || user?.companyName || '')
  const [industry, setIndustry] = useState(user?.industry || '')
  const [gst, setGst] = useState(user?.gst_no || '')
  const [pan, setPan] = useState(user?.company_pan || '')
  const [companyProof, setCompanyProof] = useState(null)
  const [gstProof, setGstProof] = useState(null)
  const [panProof, setPanProof] = useState(null)
  const [saving, setSaving] = useState(false)

  // Reference contact state
  const [refTitle, setRefTitle] = useState('Mr')
  const [refName, setRefName] = useState(user?.refContactName || '')
  const [refEmail, setRefEmail] = useState(user?.refContactEmail || '')
  const [refPersonalPhone, setRefPersonalPhone] = useState(user?.refContactPhone || '')
  const [refWorkPhone, setRefWorkPhone] = useState(user?.refWorkPhone || '')
  const [refDesignation, setRefDesignation] = useState(user?.refDesignation || '')
  const [refDepartment, setRefDepartment] = useState(user?.refDepartment || '')
  const [refSkype, setRefSkype] = useState(user?.refSkype || '')

  // Billing address state
  const [billAttention, setBillAttention] = useState(user?.billAttention || '')
  const [billCountry, setBillCountry] = useState(user?.billCountry || '')
  const [billAddress1, setBillAddress1] = useState(user?.billAddress1 || '')
  const [billAddress2, setBillAddress2] = useState(user?.billAddress2 || '')
  const [billCity, setBillCity] = useState(user?.billCity || '')
  const [billState, setBillState] = useState(user?.billState || '')
  const [billZip, setBillZip] = useState(user?.billZip || '')
  const [billPhone, setBillPhone] = useState(user?.billPhone || '')
  const [billFax, setBillFax] = useState(user?.billFax || '')

  // Shipping address state
  const [shipAttention, setShipAttention] = useState(user?.shipAttention || '')
  const [shipCountry, setShipCountry] = useState(user?.shipCountry || '')
  const [shipAddress1, setShipAddress1] = useState(user?.shipAddress1 || '')
  const [shipAddress2, setShipAddress2] = useState(user?.shipAddress2 || '')
  const [shipCity, setShipCity] = useState(user?.shipCity || '')
  const [shipState, setShipState] = useState(user?.shipState || '')
  const [shipZip, setShipZip] = useState(user?.shipZip || '')
  const [shipPhone, setShipPhone] = useState(user?.shipPhone || '')
  const [shipFax, setShipFax] = useState(user?.shipFax || '')

  const copyBillingToShipping = () => {
    setShipAttention(billAttention)
    setShipCountry(billCountry)
    setShipAddress1(billAddress1)
    setShipAddress2(billAddress2)
    setShipCity(billCity)
    setShipState(billState)
    setShipZip(billZip)
    setShipPhone(billPhone)
    setShipFax(billFax)
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await fetch('/api/v1/users/me/company', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          company_name: companyName, industry, gst_no: gst, company_pan: pan,
          refTitle, refContactName: refName, refContactEmail: refEmail,
          refContactPhone: refPersonalPhone, refWorkPhone, refDesignation, refDepartment, refSkype,
          billAttention, billCountry, billAddress1, billAddress2, billCity, billState, billZip, billPhone, billFax,
          shipAttention, shipCountry, shipAddress1, shipAddress2, shipCity, shipState, shipZip, shipPhone, shipFax,
        }),
      })
    } catch {
      // handle error
    } finally {
      setSaving(false)
    }
  }

  const AddressField = ({ label, value, onChange, type = 'text' }) => (
    <div>
      <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
      />
    </div>
  )

  return (
    <>
      <h2 className="font-heading text-lg font-bold text-[#333] mb-6">Company Details</h2>

      {/* Company sub-tab content */}
      {companySubTab === 'company' && (
        <div className="space-y-5 max-w-lg">
          <p className="text-sm font-body text-[#828282]">
            Enter the new company details. We require 24 hours to verify the documents and update.
          </p>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">
              {entityLabel}
              <span className="ml-1.5 inline-block text-[#bdbdbd] cursor-help align-middle" title="Your registered business name">
                <Info className="h-4 w-4 inline" />
              </span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
            <FileUpload
              file={companyProof}
              onFileChange={setCompanyProof}
              onRemove={() => setCompanyProof(null)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Technology, Manufacturing"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">GST No.</label>
            <input
              type="text"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              placeholder="Enter GST number"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
            <FileUpload
              file={gstProof}
              onFileChange={setGstProof}
              onRemove={() => setGstProof(null)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Company PAN</label>
            <input
              type="text"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              placeholder="Enter company PAN"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
            <FileUpload
              file={panProof}
              onFileChange={setPanProof}
              onRemove={() => setPanProof(null)}
            />
          </div>

          <p className="text-xs font-body text-[#bdbdbd]">Note: please enter atleast 6 characters</p>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] disabled:opacity-60 cursor-pointer transition-colors"
          >
            {saving ? 'Updating...' : 'Update changes'}
          </button>
        </div>
      )}

      {/* Reference Contact sub-tab */}
      {companySubTab === 'reference' && (
        <div className="space-y-5 max-w-lg">
          <h3 className="text-base font-semibold font-body text-[#333]">Reference contact</h3>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Primary contact</label>
            <div className="flex gap-2">
              <select
                value={refTitle}
                onChange={(e) => setRefTitle(e.target.value)}
                className="w-24 px-3 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] outline-none focus:border-[#6d5ed6] transition-colors cursor-pointer"
              >
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
              </select>
              <input
                type="text"
                value={refName}
                onChange={(e) => setRefName(e.target.value)}
                placeholder="Enter name"
                className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Email ID</label>
            <input
              type="email"
              value={refEmail}
              onChange={(e) => setRefEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Personal Contact Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#e0e0e0] bg-[#f2f2f2] text-[#828282] text-sm font-body">
                +91
              </span>
              <input
                type="tel"
                value={refPersonalPhone}
                onChange={(e) => setRefPersonalPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter personal contact number"
                className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-r-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Work contact number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#e0e0e0] bg-[#f2f2f2] text-[#828282] text-sm font-body">
                +91
              </span>
              <input
                type="tel"
                value={refWorkPhone}
                onChange={(e) => setRefWorkPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter work contact number"
                className="flex-1 px-4 py-3 border border-[#e0e0e0] rounded-r-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Designation</label>
            <input
              type="text"
              value={refDesignation}
              onChange={(e) => setRefDesignation(e.target.value)}
              placeholder="Enter designation"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Department</label>
            <input
              type="text"
              value={refDepartment}
              onChange={(e) => setRefDepartment(e.target.value)}
              placeholder="Enter department"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-[#333] mb-1.5">Skype number</label>
            <input
              type="text"
              value={refSkype}
              onChange={(e) => setRefSkype(e.target.value)}
              placeholder="Enter skype number"
              className="w-full px-4 py-3 border border-[#e0e0e0] rounded-xl text-sm font-body text-[#333] placeholder-[#bdbdbd] outline-none focus:border-[#6d5ed6] transition-colors"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] disabled:opacity-60 cursor-pointer transition-colors"
          >
            {saving ? 'Updating...' : 'Update changes'}
          </button>
        </div>
      )}

      {/* Address sub-tab */}
      {companySubTab === 'address' && (
        <div className="space-y-6">
          <div className="flex items-center justify-end">
            <button
              onClick={copyBillingToShipping}
              className="text-sm font-body text-[#6d5ed6] hover:text-[#5b4ec4] font-medium cursor-pointer"
            >
              Same as billing address
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold font-body text-[#333]">Billing Address</h3>
              <AddressField label="Attention" value={billAttention} onChange={(e) => setBillAttention(e.target.value)} />
              <AddressField label="Country/Region" value={billCountry} onChange={(e) => setBillCountry(e.target.value)} />
              <AddressField label="Address 1" value={billAddress1} onChange={(e) => setBillAddress1(e.target.value)} />
              <AddressField label="Address 2" value={billAddress2} onChange={(e) => setBillAddress2(e.target.value)} />
              <AddressField label="City" value={billCity} onChange={(e) => setBillCity(e.target.value)} />
              <AddressField label="State" value={billState} onChange={(e) => setBillState(e.target.value)} />
              <AddressField label="Zip Code" value={billZip} onChange={(e) => setBillZip(e.target.value)} />
              <AddressField label="Phone" value={billPhone} onChange={(e) => setBillPhone(e.target.value)} type="tel" />
              <AddressField label="Fax" value={billFax} onChange={(e) => setBillFax(e.target.value)} />
            </div>

            {/* Shipping Address */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold font-body text-[#333]">Shipping Address</h3>
              <AddressField label="Attention" value={shipAttention} onChange={(e) => setShipAttention(e.target.value)} />
              <AddressField label="Country/Region" value={shipCountry} onChange={(e) => setShipCountry(e.target.value)} />
              <AddressField label="Address 1" value={shipAddress1} onChange={(e) => setShipAddress1(e.target.value)} />
              <AddressField label="Address 2" value={shipAddress2} onChange={(e) => setShipAddress2(e.target.value)} />
              <AddressField label="City" value={shipCity} onChange={(e) => setShipCity(e.target.value)} />
              <AddressField label="State" value={shipState} onChange={(e) => setShipState(e.target.value)} />
              <AddressField label="Zip Code" value={shipZip} onChange={(e) => setShipZip(e.target.value)} />
              <AddressField label="Phone" value={shipPhone} onChange={(e) => setShipPhone(e.target.value)} type="tel" />
              <AddressField label="Fax" value={shipFax} onChange={(e) => setShipFax(e.target.value)} />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] disabled:opacity-60 cursor-pointer transition-colors"
          >
            {saving ? 'Updating...' : 'Update changes'}
          </button>
        </div>
      )}
    </>
  )
}
