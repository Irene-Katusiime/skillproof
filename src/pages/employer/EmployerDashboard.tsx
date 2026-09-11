import { Link } from 'react-router-dom'
import {
  Search, Users, Briefcase, ShieldCheck,
  ChevronRight, Star, MapPin, UserCheck, Clock,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function EmployerDashboard() {
  const { employerProfile, allWorkers } = useApp()
  if (!employerProfile) return null

  const savedWorkers      = allWorkers.filter(w => employerProfile.savedWorkerIds.includes(w.id))
  const recentRequests    = employerProfile.hireRequests.slice(-5).reverse()
  const verifiedWorkers   = allWorkers.filter(w => w.onboardingComplete && w.skills.some(s => s.verified))
  const pendingRequests   = employerProfile.hireRequests.filter(r => r.status === 'pending').length

  const stats = [
    { label: 'Saved Talent',      value: savedWorkers.length,              icon: Users,      color: 'bg-blue-100 text-blue-600'   },
    { label: 'Hire Requests Sent', value: employerProfile.hireRequests.length, icon: Briefcase, color: 'bg-orange-100 text-orange-600' },
    { label: 'Pending Responses', value: pendingRequests,                  icon: Clock,       color: 'bg-amber-100 text-amber-600'  },
    { label: 'Verified Workers',   value: verifiedWorkers.length,          icon: ShieldCheck, color: 'bg-green-100 text-green-600'  },
  ]

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black shrink-0">
            {employerProfile.companyName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold leading-tight">{employerProfile.companyName}</h2>
            <p className="text-blue-200 text-sm mt-0.5">{employerProfile.industry}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin size={13} className="text-blue-300 shrink-0" />
              <span className="text-xs text-blue-200">{employerProfile.location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {stats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-blue-200 mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="section-title">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/employer/discover"
            className="card flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors shrink-0">
              <Search size={22} className="text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Discover Talent</p>
              <p className="text-xs text-gray-500 mt-0.5">Search verified workers by skill & location</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
          </Link>

          <Link to="/employer/saved"
            className="card flex items-center gap-4 hover:shadow-md hover:border-orange-200 transition-all group">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors shrink-0">
              <Users size={22} className="text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">Saved Talent</p>
              <p className="text-xs text-gray-500 mt-0.5">{savedWorkers.length} worker{savedWorkers.length !== 1 ? 's' : ''} bookmarked</p>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
          </Link>
        </div>
      </div>

      {/* Saved workers preview */}
      {savedWorkers.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Saved Talent</h3>
            <Link to="/employer/saved" className="btn-ghost text-sm py-1 px-3">View all</Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {savedWorkers.slice(0, 3).map(worker => (
              <Link key={worker.id} to={`/talent/${worker.id}`}
                className="card flex items-start gap-3 hover:shadow-md hover:border-blue-200 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-xl font-black text-white shrink-0">
                  {worker.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{worker.name}</p>
                  <p className="text-xs text-gray-500 truncate">{worker.profession}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={10} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400 truncate">{worker.location}</span>
                  </div>
                </div>
                {worker.onboardingComplete && (
                  <span className="badge-green shrink-0 text-[10px]"><ShieldCheck size={10} /></span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent hire requests */}
      {recentRequests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Hire Requests</h3>
            <Link to="/employer/requests" className="btn-ghost text-sm py-1 px-3">View all</Link>
          </div>
          <div className="space-y-2.5">
            {recentRequests.map(req => (
              <div key={req.id} className="card flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{req.jobTitle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">To: {req.workerName}</p>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  req.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                  req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                              'bg-red-100 text-red-700'
                }`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — new employer */}
      {savedWorkers.length === 0 && recentRequests.length === 0 && (
        <div className="card text-center py-12 space-y-3">
          <div className="text-5xl">👷</div>
          <p className="font-bold text-gray-800 text-lg">Start discovering talent</p>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Browse verified workers with real Skill Passports — confirmed projects, assessed skills, and client reviews.
          </p>
          <Link to="/employer/discover" className="btn-primary inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700">
            <Search size={16} /> Find Workers
          </Link>
        </div>
      )}

      <div className="h-4" />
    </div>
  )
}
