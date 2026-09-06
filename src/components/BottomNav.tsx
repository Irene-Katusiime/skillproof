import { NavLink } from 'react-router-dom'
import { Home, Award, Briefcase, Globe, UserCheck } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: Home,      label: 'Home'     },
  { to: '/passport',  icon: Award,     label: 'Passport' },
  { to: '/projects',  icon: Briefcase, label: 'Projects' },
  { to: '/opportunities', icon: Globe, label: 'Opportunities' },
  { to: '/endorse',   icon: UserCheck, label: 'Endorse'  },
]

export default function BottomNav() {
  return (
    // Only visible on mobile (< lg)
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="flex items-center justify-around py-1.5 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
