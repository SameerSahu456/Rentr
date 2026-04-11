import { Link } from 'react-router-dom'
import { Phone, Mail, MessageCircle } from 'lucide-react'
import Logo from './Logo'

const footerLinks = {
  'Information': [
    { label: "FAQ's", to: '/#faqs' },
    { label: 'Documents required', to: '/#docs' },
    { label: 'Corporate Enquiries', to: '/corporate-enquiries' },
  ],
  'Company': [
    { label: 'My account', to: '/settings' },
    { label: 'Wishlist', to: '/dashboard' },
    { label: 'Order History', to: '/dashboard' },
  ],
  'Policies': [
    { label: 'Shipping Policy', to: '/shipping-policy' },
    { label: 'Cancellation and return', to: '/cancellation-return' },
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Rental terms and conditions', to: '/rental-terms' },
    { label: 'Referral terms and conditions', to: '/referral-terms' },
  ],
}

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Our Benefits', to: '/benefits' },
  { label: 'Contact', to: '/about#contact' },
]

export default function Footer() {
  return (
    <footer className="bg-white/50 border-t border-gray-200">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-8">
          {/* Logo + company links */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Logo size="md" />
            <ul className="mt-6 space-y-3">
              {companyLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-black text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-sm mb-4 text-black">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-black text-sm hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Need Help */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-4 text-black">Need Help</h4>
            <ul className="space-y-3">
              <li className="text-black text-sm">022-67654063</li>
              <li className="text-black text-sm">022-67654064</li>
              <li className="text-gray-500 text-xs">(9AM - PM)</li>
            </ul>
          </div>

          {/* Chat / Email */}
          <div className="flex flex-col gap-4 mt-0 md:mt-6">
            <a href="#" className="flex items-center gap-2 text-[#3b3b3b] text-sm hover:text-primary underline">
              <MessageCircle size={14} />
              Chat with Us
            </a>
            <a href="mailto:help@rentr.com" className="flex items-center gap-2 text-[#3b3b3b] text-sm hover:text-primary underline">
              <Mail size={14} />
              help@rentr.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-300 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-black font-heading font-medium">Copyright &copy; 2019 ComprintComputers. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  )
}
