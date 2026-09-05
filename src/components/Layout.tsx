import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import SideNav from './SideNav'
import UserMenu from './UserMenu'
import { Award } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/passport':     'Skill Passport',
  '/projects':     'Projects',
  '/projects/add': 'Add Project',
  '/skills/add':   'Add Skill',
  '/endorse':      'Client Endorsement',
  '/discover':     'Discover Talent',
  '/pitch':        'About SkillProof',
}

export default function Layout() {
  const { pathname } = useLocation()
  const isPitch = pathname === '/pitch'

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Desktop sidebar (lg+) ── */}
      <SideNav />

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 xl:ml-72">

        {/* Mobile top bar (hidden on lg+) */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Award size={16} className="text-white" />
            </div>
            <span className="font-black text-gray-900 text-base">
              Skill<span className="text-orange-500">Proof</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              {PAGE_TITLES[pathname] ?? ''}
            </span>
            <UserMenu />
          </div>
        </header>

        {/* Desktop page title bar (hidden on mobile) */}
        {!isPitch && (
          <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
            <h1 className="text-xl font-bold text-gray-900">
              {PAGE_TITLES[pathname] ?? ''}
            </h1>
            <UserMenu />
          </div>
        )}

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto ${isPitch ? '' : 'px-4 lg:px-8 pt-5'} pb-24 lg:pb-8`}>
          {/* On desktop, cap content width for readability */}
          <div className={isPitch ? '' : 'max-w-4xl mx-auto'}>
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </div>
  )
}
