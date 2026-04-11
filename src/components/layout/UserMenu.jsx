import { Link, useNavigate } from 'react-router-dom'
import { User, Heart, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function UserMenu({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[200px] z-50">
      <Link to={user.role === 'distributor' ? '/distributor/dashboard' : '/dashboard'} onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
        <User size={16} className="text-gray-400" /> My Account
      </Link>
      <Link to="/wishlist" onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
        <Heart size={16} className="text-gray-400" /> My Wishlist
      </Link>
      <Link to={user.role === 'distributor' ? '/distributor/settings' : '/settings'} onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
        <Settings size={16} className="text-gray-400" /> Settings
      </Link>
      <hr className="my-1" />
      <button onClick={() => { logout(); onClose(); navigate('/') }}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 cursor-pointer">
        <LogOut size={16} className="text-red-400" /> Logout
      </button>
    </div>
  )
}
