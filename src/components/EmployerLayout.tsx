import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Award, LayoutDashboard, Search, Bookmark,
  ClipboardList, LogOut, ChevronDown, Building2,
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'

const navItems = [
  { to: '/employer/dashboard', icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/employer/discover',  icon: Search,           label: 'Discover Talent' },
  { to: '/employer/saved',     icon: Bookmark,         label: 'Saved Talent'    },
  { to: '/employer/requests',  icon: ClipboardList,    label: 'Hire Requests'   },
]

const PAGE_TITLES: Record<string, string> = {
  '/employer/dashboard': 'Dashboard',
  '/employer/discover':  'Discover Talent',
  '/employer/saved':     'Saved Talent',
  '/employer/requests':  'Hire Requests',
}

function EmployerSideNav() {
  const { employerProfile, logout } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 min-h-screen bg-white border-r border-gray-100 fixed left-0 top-0 bottom-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Award size={18} className="text-white" />
        </div>
        <div>
          <span className="font-black text-xl text-gray-900">Skill<span className="text-blue-600">Proof</span></span>
          <span className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest -mt-0.5">Employer</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }>
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
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-base font-bold text-blue-600 shrink-0">
            {employerProfile?.companyName.charAt(0) ?? 'E'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-800 truncate">{employerProfile?.companyName ?? 'Employer'}</p>
            <p className="text-xs text-gray-400 truncate">{employerProfile?.industry ?? ''}</p>
          </div>
          <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="mt-1 bg-gray-50 rounded-xl p-2 text-xs text-gray-500 space-y-1">
            {employerProfile?.email && <p className="truncate">{employerProfile.email}</p>}
            {employerProfile?.location && <p>{employerProfile.location}</p>}
          </div>
        )}

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 group transition-colors mt-1">
          <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
            <LogOut size={15} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          </div>
          <span className="text-sm font-medium text-gray-500 group-hover:text-red-600 transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  )
}

function EmployerBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex items-center justify-around py-1.5 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default function EmployerLayout() {
  const { pathname } = useLocation()
  const { employerProfile, logout } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <EmployerSideNav />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 xl:ml-72">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Award size={15} className="text-white" />
            </div>
            <span className="font-black text-gray-900 text-base">
              Skill<span className="text-blue-600">Proof</span>
            </span>
            <span className="text-[10px] font-bold text-blue-500 uppercase ml-1">Employer</span>
          </div>
          <button onClick={() => { logout(); navigate('/login') }}
            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </header>

        {/* Desktop title bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{PAGE_TITLES[pathname] ?? ''}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 size={15} className="text-blue-500" />
            <span className="font-semibold text-gray-700">{employerProfile?.companyName}</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 pt-5 pb-24 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>

        <EmployerBottomNav />
      </div>
    </div>
  )
}
