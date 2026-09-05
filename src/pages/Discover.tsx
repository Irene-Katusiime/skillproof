import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, MapPin, ShieldCheck, Star, Briefcase,
  SlidersHorizontal, X, Award, ArrowRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { WorkerProfile } from '../types'

const SKILL_FILTERS = [
  'All Skills', 'Tailor', 'Mechanic', 'Electrician', 'Plumber',
  'Builder', 'Carpenter', 'Hair Stylist', 'Cook', 'Farmer',
]

const LOCATION_FILTERS = [
  'All Locations', 'Nairobi, Kenya', 'Mombasa, Kenya', 'Lagos, Nigeria',
  'Accra, Ghana', 'Kampala, Uganda', 'Dar es Salaam, Tanzania',
]

function WorkerCard({ worker }: { worker: WorkerProfile }) {
  const verifiedSkills = worker.skills.filter(s => s.verified)
  const confirmedProjects = worker.projects.filter(p => p.confirmed).length
  const topSkills = worker.skills.slice(0, 3)

  return (
    <Link to={`/talent/${worker.id}`}
      className="card hover:shadow-md hover:border-orange-200 transition-all group flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-2xl font-black text-white shrink-0">
          {worker.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-gray-900 leading-tight truncate">{worker.name}</h3>
            {worker.onboardingComplete && (
              <span className="badge-green shrink-0 text-[10px]">
                <ShieldCheck size={10} /> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{worker.profession}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={11} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 truncate">{worker.location}</span>
          </div>
        </div>
      </div>

      {/* Rating + stats */}
      <div className="flex items-center gap-3">
        {worker.rating > 0 && (
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={12}
                className={i <= Math.round(worker.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
            ))}
            <span className="text-xs font-semibold text-gray-700 ml-0.5">{worker.rating}</span>
          </div>
        )}
        <span className="text-xs text-gray-400">{worker.completedJobs} jobs</span>
        {verifiedSkills.length > 0 && (
          <span className="text-xs text-green-600 font-semibold">{verifiedSkills.length} verified skills</span>
        )}
      </div>

      {/* Skill tags */}
      {topSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map(s => (
            <span key={s.id}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                s.verified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'
              }`}>
              {s.verified && <ShieldCheck size={9} />} {s.name}
            </span>
          ))}
          {worker.skills.length > 3 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              +{worker.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Projects badge */}
      {confirmedProjects > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-xl px-3 py-1.5">
          <Briefcase size={12} />
          <span>{confirmedProjects} confirmed project{confirmedProjects !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Passport ID */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-[10px] font-mono text-gray-400">{worker.passportId}</span>
        <span className="text-xs font-semibold text-orange-500 group-hover:underline flex items-center gap-1">
          View Passport <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}

export default function Discover() {
  const { allWorkers } = useApp()
  const [search,   setSearch]   = useState('')
  const [skillF,   setSkillF]   = useState('All Skills')
  const [locF,     setLocF]     = useState('All Locations')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return allWorkers.filter(w => {
      const q = search.toLowerCase()
      const matchSearch = !q
        || w.name.toLowerCase().includes(q)
        || w.profession.toLowerCase().includes(q)
        || w.skills.some(s => s.name.toLowerCase().includes(q))
        || w.location.toLowerCase().includes(q)

      const matchSkill = skillF === 'All Skills'
        || w.profession.toLowerCase().includes(skillF.toLowerCase())
        || w.skills.some(s => s.name.toLowerCase().includes(skillF.toLowerCase()))

      const matchLoc = locF === 'All Locations'
        || w.location.toLowerCase().includes(locF.toLowerCase())

      return matchSearch && matchSkill && matchLoc
    })
  }, [allWorkers, search, skillF, locF])

  const activeFilters = (skillF !== 'All Skills' ? 1 : 0) + (locF !== 'All Locations' ? 1 : 0)

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Discover Talent</h1>
        <p className="text-sm text-gray-500 mt-1">Browse verified workers with proven skills and real project histories.</p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            className="input pl-9 pr-4"
            placeholder="Search by name, skill, or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
            showFilters || activeFilters > 0
              ? 'border-orange-400 bg-orange-50 text-orange-600'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>
          <SlidersHorizontal size={16} />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 space-y-4">
          <div>
            <label className="label">Skill / Profession</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_FILTERS.map(s => (
                <button key={s} onClick={() => setSkillF(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    skillF === s
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <div className="flex flex-wrap gap-2">
              {LOCATION_FILTERS.map(l => (
                <button key={l} onClick={() => setLocF(l)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    locF === l
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setSkillF('All Skills'); setLocF('All Locations') }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold">
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-500 mb-4 font-medium">
        {filtered.length} worker{filtered.length !== 1 ? 's' : ''} found
        {search && <span className="text-orange-500"> for "{search}"</span>}
      </p>

      {/* Worker grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="font-bold text-gray-700">No workers found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search or clear your filters</p>
          <button onClick={() => { setSearch(''); setSkillF('All Skills'); setLocF('All Locations') }}
            className="btn-secondary mt-4 text-sm py-2 px-6">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(w => <WorkerCard key={w.id} worker={w} />)}
        </div>
      )}

      {/* Employer CTA */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Award size={22} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold">Are you a skilled worker?</p>
          <p className="text-sm text-blue-200 mt-0.5">Build your own verified Skill Passport and get discovered by employers.</p>
        </div>
        <Link to="/register" className="btn-primary bg-white text-blue-600 hover:bg-blue-50 text-sm py-2.5 px-5 shrink-0">
          Build My Passport
        </Link>
      </div>
      <div className="h-4" />
    </div>
  )
}
