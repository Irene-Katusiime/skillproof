import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Award, Briefcase, UserCheck, Mic2, LogOut, UserPlus, ChevronDown, Globe } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', icon: Home,      label: 'Dashboard' },
  { to: '/passport',  icon: Award,     label: 'Skill Passport' },
  { to: '/projects',  icon: Briefcase, label: 'Projects' },
  { to: '/discover',  icon: Globe,     label: 'Discover Talent' },
  { to: '/endorse',   icon: UserCheck, label: 'Endorsements' },
  { to: '/pitch',     icon: Mic2,      label: 'About SkillProof' },
]

export default function SideNav() {
  const { profile, allWorkers, logout, currentUserId } = useApp()
  const navigate = useNavigate()
  const [switcherOpen, setSwitcherOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 bottom-0 z-30">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
          <Award size={18} className="text-white" />
        </div>
        <span className="font-black text-xl text-gray-900">
          Skill<span className="text-orange-500">Proof</span>
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 p-3">
        {/* Switcher */}
        <button
          onClick={() => setSwitcherOpen(o => !o)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-base font-bold text-orange-600 shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-800 truncate">{profile.name.split(' ')[0]}</p>
            <p className="text-xs text-gray-400 truncate">{profile.profession}</p>
          </div>
          <ChevronDown size={15} className={`text-gray-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
        </button>

        {switcherOpen && (
          <div className="mt-1 bg-gray-50 rounded-xl overflow-hidden">
            {allWorkers.filter(w => w.id !== currentUserId).map(w => (
              <button
                key={w.id}
                onClick={() => { logout(); setSwitcherOpen(false); navigate('/login') }}                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                  {w.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{w.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{w.profession}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => { setSwitcherOpen(false); navigate('/register') }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white transition-colors text-left border-t border-gray-100"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <UserPlus size={13} className="text-blue-500" />
              </div>
              <span className="text-xs font-medium text-gray-600">Add new account</span>
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 group transition-colors mt-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
            <LogOut size={15} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-sm font-medium text-gray-500 group-hover:text-red-600 transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
