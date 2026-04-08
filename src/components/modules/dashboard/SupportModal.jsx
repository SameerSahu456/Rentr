import { X, Plus } from 'lucide-react'

// ─── Support Modal ───
// variant: 'customer' | 'distributor'

export default function SupportModal({
  variant = 'customer',
  show,
  onClose,
  supportForm,
  setSupportForm,
  toggleIssue,
  subscriptionData,
}) {
  if (!show) return null

  if (variant === 'distributor') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-heading text-lg font-bold text-dark">New Support Request</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Asset</label>
              <select
                value={supportForm.asset}
                onChange={(e) => setSupportForm({ ...supportForm, asset: e.target.value })}
                className="input-field-rect w-full text-sm"
              >
                <option value="">Select Asset</option>
                {subscriptionData.map((a) => (
                  <option key={a.id} value={a.serial}>{a.brand} {a.model}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Serial Number</label>
              <input type="text" value={supportForm.serial} onChange={(e) => setSupportForm({ ...supportForm, serial: e.target.value })} className="input-field-rect w-full text-sm" placeholder="Auto-filled on asset select" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Address</label>
              <input type="text" value={supportForm.address} onChange={(e) => setSupportForm({ ...supportForm, address: e.target.value })} className="input-field-rect w-full text-sm" placeholder="Service address" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Mobile</label>
              <input type="tel" value={supportForm.mobile} onChange={(e) => setSupportForm({ ...supportForm, mobile: e.target.value })} className="input-field-rect w-full text-sm" placeholder="+91" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Issues</label>
              <div className="flex flex-wrap gap-2">
                {['Hardware', 'Software', 'Network', 'Display', 'Power', 'Other'].map((issue) => (
                  <button
                    key={issue}
                    onClick={() => toggleIssue(issue)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      supportForm.issues.includes(issue) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-2 hover:bg-gray-200'
                    }`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-3 font-semibold mb-1.5">Description</label>
              <textarea value={supportForm.query} onChange={(e) => setSupportForm({ ...supportForm, query: e.target.value })} className="input-field-rect w-full text-sm min-h-[80px] resize-none" placeholder="Describe your issue..." />
            </div>
            <button onClick={onClose} className="btn-primary w-full py-3 text-sm font-semibold">
              Submit Request
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Customer variant
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-1">Support Request</h3>
          <button onClick={onClose} className="text-gray-3 hover:text-gray-1 cursor-pointer"><X size={20} /></button>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <p className="text-sm text-gray-3">Having a problem? Raise a support request and we will replace or repair those assets and help you out.</p>
          <p className="text-sm font-semibold text-gray-1">Select the asset you require assitance for *</p>
          <div>
            <label className="block text-sm text-gray-1 mb-1.5">Asset*</label>
            <select value={supportForm.asset} onChange={(e) => setSupportForm({ ...supportForm, asset: e.target.value })} className="input-field-rect">
              <option value="">Choose an asset from the dropdown</option>
              {subscriptionData.map((a) => (<option key={a.id} value={a.name}>{a.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-1 mb-1.5">Hardware serial no.</label>
            <select className="input-field-rect"><option value="">Choose hardware serial number *</option></select>
          </div>
          <button className="flex items-center gap-1 text-sm text-primary font-medium cursor-pointer"><Plus size={14} /> Add another asset</button>
          <div>
            <label className="block text-sm text-gray-1 mb-1.5">Confirm Address*</label>
            <input type="text" value={supportForm.address} onChange={(e) => setSupportForm({ ...supportForm, address: e.target.value })} className="input-field-rect" />
          </div>
          <div>
            <label className="block text-sm text-gray-1 mb-1.5">Mobile number</label>
            <input type="tel" value={supportForm.mobile} onChange={(e) => setSupportForm({ ...supportForm, mobile: e.target.value })} className="input-field-rect" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-1 mb-3">What is the issue with the asset</p>
            <div className="space-y-3">
              {['Product malfunction', 'Product damaged', 'Overheating', 'Not starting up', 'Item or parts missing'].map((issue) => (
                <label key={issue} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={supportForm.issues.includes(issue)} onChange={() => toggleIssue(issue)} className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-gray-1">{issue}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-1 mb-1.5">Query details</label>
            <textarea value={supportForm.query} onChange={(e) => setSupportForm({ ...supportForm, query: e.target.value })}
              className="input-field-rect min-h-[100px] resize-none" placeholder="Share more details about the problem..." />
          </div>
          <p className="text-xs text-gray-3 italic">Our support staff will respond to your query within 24hrs</p>
          <button onClick={onClose}
            className="bg-primary text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors">Call me</button>
        </div>
      </div>
    </div>
  )
}
