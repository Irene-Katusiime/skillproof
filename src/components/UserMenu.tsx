import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, UserPlus } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function UserMenu() {
  const { profile, logout } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/login')
  }
  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {profile.name.charAt(0)}
        </div>
        <span className="text-xs font-semibold text-gray-700 max-w-[80px] truncate hidden sm:block">
          {profile.name.split(' ')[0]}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">

          {/* Current user header */}
          <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
            <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Signed in as</p>
            <p className="font-bold text-sm text-gray-800 mt-0.5 truncate">{profile.name}</p>
            <p className="text-xs text-gray-500 truncate">{profile.profession}</p>
          </div>

          {/* Actions */}
          <div className="py-2">
            <button
              onClick={() => { setOpen(false); navigate('/register') }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <UserPlus size={15} className="text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">Add new account</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                <LogOut size={15} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-red-600 transition-colors">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
