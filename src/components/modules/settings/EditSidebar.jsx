import { ChevronDown } from 'lucide-react'

export default function EditSidebar({ sidebarTab, setSidebarTab, companyExpanded, setCompanyExpanded, companySubTab, setCompanySubTab }) {
  const handleCompanyClick = () => {
    const willExpand = !companyExpanded
    setCompanyExpanded(willExpand)
    if (willExpand) {
      setSidebarTab('company')
      setCompanySubTab('company')
    }
  }

  const handleCompanySubClick = (sub) => {
    setSidebarTab('company')
    setCompanySubTab(sub)
  }

  const companySubItems = [
    { key: 'company', label: 'Company' },
    { key: 'reference', label: 'Reference Contact' },
    { key: 'address', label: 'Address' },
  ]

  const linkClass = (isActive) =>
    `w-full text-left px-5 py-3.5 text-sm font-body transition-colors cursor-pointer ${
      isActive ? 'font-bold text-[#333]' : 'text-[#828282] hover:text-[#4f4f4f]'
    }`

  return (
    <div className="w-full lg:w-[278px] shrink-0">
      <div className="bg-[rgba(242,242,242,0.15)] rounded-xl border border-[#f2f2f2] overflow-hidden">
        {/* Edit Profile */}
        <button
          onClick={() => { setSidebarTab('profile'); setCompanyExpanded(false) }}
          className={`${linkClass(sidebarTab === 'profile')} border-b border-[#f2f2f2]`}
        >
          Edit Profile
        </button>

        {/* Password */}
        <button
          onClick={() => { setSidebarTab('password'); setCompanyExpanded(false) }}
          className={`${linkClass(sidebarTab === 'password')} border-b border-[#f2f2f2]`}
        >
          Password
        </button>

        {/* Company details */}
        <button
          onClick={handleCompanyClick}
          className={`${linkClass(sidebarTab === 'company')} flex items-center justify-between`}
        >
          <span className={sidebarTab === 'company' ? 'font-bold text-[#333]' : ''}>Company details</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${companyExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {companyExpanded && (
          <div className="border-t border-[#f2f2f2]">
            {companySubItems.map((sub) => (
              <button
                key={sub.key}
                onClick={() => handleCompanySubClick(sub.key)}
                className={`w-full text-left pl-9 pr-5 py-2.5 text-sm font-body transition-colors cursor-pointer ${
                  sidebarTab === 'company' && companySubTab === sub.key
                    ? 'font-semibold text-[#333]'
                    : 'text-[#828282] hover:text-[#4f4f4f]'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
