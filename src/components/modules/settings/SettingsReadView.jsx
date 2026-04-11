export default function SettingsReadView({ user, onEdit }) {
  const rows = [
    { label: 'Full Name', value: user?.full_name || '' },
    { label: 'Email ID', value: user?.email || '' },
    { label: 'Mobile Phone Number', value: user?.phone || '' },
    { label: 'Password', value: '*****************' },
    {
      label: 'Company Details',
      value: user?.company_name
        ? `${user.company_name}${user.company_pan ? ', Pan' : ''}${user.gst_no ? ', GST no...' : ''}`
        : 'Company name, Pan, GST no...',
    },
  ]

  return (
    <div>
      {/* Title with purple underline accent */}
      <div className="mb-8">
        <h1 className="font-heading text-[20px] font-bold text-[#333] uppercase tracking-wide">
          MY SETTINGS
        </h1>
        <div className="w-16 h-1 bg-[#6d5ed6] rounded-full mt-2" />
      </div>

      {/* Card with read-only rows */}
      <div className="bg-white rounded-xl border border-[#f2f2f2] overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex flex-col sm:flex-row sm:items-center px-6 sm:px-8 py-4 ${
              i < rows.length - 1 ? 'border-b border-[#f2f2f2]' : ''
            }`}
          >
            <span className="text-[14px] font-semibold font-body text-[#333] sm:w-56 shrink-0">
              {row.label}
            </span>
            <span className="text-[14px] font-medium font-body text-[#4f4f4f]">
              {row.value}
            </span>
          </div>
        ))}

        {/* Edit Profile button */}
        <div className="px-6 sm:px-8 py-5">
          <button
            onClick={onEdit}
            className="w-full py-3 bg-[#6d5ed6] text-white font-body font-semibold text-sm rounded-full hover:bg-[#5b4ec4] cursor-pointer transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}
