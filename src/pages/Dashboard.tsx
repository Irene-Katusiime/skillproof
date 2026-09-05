import { Link } from 'react-router-dom'
import {
  MapPin, Star, Briefcase, Award, ShieldCheck,
  Plus, ChevronRight, TrendingUp, Users,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import StarRating from '../components/StarRating'

export default function Dashboard() {
  const { profile } = useApp()
  const verifiedSkills    = profile.skills.filter(s => s.verified).length
  const confirmedProjects = profile.projects.filter(p => p.confirmed).length
  const passedAssessments = profile.assessments.filter(a => a.passed).length

  const progressStats = [
    { label: 'Verified Skills',     value: verifiedSkills,   total: profile.skills.length,        icon: ShieldCheck, color: 'green'  },
    { label: 'Confirmed Projects',  value: confirmedProjects, total: profile.projects.length,      icon: Briefcase,   color: 'blue'   },
    { label: 'Assessments Passed',  value: passedAssessments, total: profile.assessments.length,   icon: TrendingUp,  color: 'purple' },
    { label: 'Client Endorsements', value: profile.endorsements.filter(e => e.verified).length,
                                     total: profile.endorsements.length,                            icon: Users,       color: 'orange' },
  ]

  const colorMap: Record<string, string> = {
    green:  'bg-green-100 text-green-600',
    blue:   'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="space-y-6">

      {/* ── Hero + Passport CTA — side-by-side on lg ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Hero card — spans 2 cols on lg */}
        <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl lg:text-4xl font-bold shrink-0">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg lg:text-2xl font-bold leading-tight">{profile.name}</h2>
              <p className="text-orange-100 text-sm lg:text-base mt-0.5">{profile.tagline}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={13} className="text-orange-200 shrink-0" />
                <span className="text-xs lg:text-sm text-orange-200">{profile.location}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Jobs Done',    value: profile.completedJobs },
              { label: 'Years Active', value: profile.yearsActive   },
              { label: 'Rating',       value: profile.rating        },
            ].map(stat => (
              <div key={stat.label} className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-xl lg:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-orange-200 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <StarRating rating={profile.rating} size={16} />
            <span className="text-sm font-semibold">{profile.rating}/5</span>
            <span className="text-xs text-orange-200">({profile.endorsements.length} reviews)</span>
          </div>
        </div>

        {/* Passport CTA — full card on lg */}
        <div className="flex flex-col gap-3">
          <Link
            to="/passport"
            className="card flex items-center gap-4 hover:shadow-md transition-shadow group flex-1"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Award size={24} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800">My Skill Passport</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">ID: {profile.passportId}</p>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-orange-500 transition-colors shrink-0" />
          </Link>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <Link
              to="/projects/add"
              className="card flex items-center gap-3 hover:border-orange-200 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors shrink-0">
                <Plus size={18} className="text-orange-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Add Project</span>
            </Link>
            <Link
              to="/skills/add"
              className="card flex items-center gap-3 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors shrink-0">
                <Star size={18} className="text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Add Skill</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Progress stats — 2 cols mobile, 4 cols desktop ── */}
      <div>
        <h3 className="section-title">Your Progress</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {progressStats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="card">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  <span className="text-sm font-normal text-gray-400">/{stat.total}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Recent Projects ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Recent Projects</h3>
          <Link to="/projects" className="btn-ghost text-sm py-1 px-3">View all</Link>
        </div>
        {/* 1 col mobile → 2 col lg → 3 col xl */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {profile.projects.slice(0, 6).map(project => (
            <div key={project.id} className="card flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                <Briefcase size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 line-clamp-1">{project.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {project.clientName} · {new Date(project.completedAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              {project.confirmed
                ? <span className="badge-green shrink-0">Confirmed</span>
                : <span className="badge-gray shrink-0">Pending</span>
              }
            </div>
          ))}
        </div>
      </div>

      <div className="h-2" />
    </div>
  )
}
