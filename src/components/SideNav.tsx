import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Award, Briefcase, UserCheck, Mic2, LogOut, Globe } from 'lucide-react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/dashboard', icon: Home,      label: 'Dashboard' },
  { to: '/passport',  icon: Award,     label: 'Skill Passport' },
  { to: '/projects',  icon: Briefcase, label: 'Projects' },
  { to: '/opportunities', icon: Globe, label: 'Find Opportunities' },
  { to: '/endorse',   icon: UserCheck, label: 'Project Confirmations' },
  { to: '/pitch',     icon: Mic2,      label: 'About SkillProof' },
]

export default function SideNav() {
  const { profile, logout } = useApp()
  const navigate = useNavigate()

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
