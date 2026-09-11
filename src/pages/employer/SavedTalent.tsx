import { Link } from 'react-router-dom'
import { BookmarkCheck, MapPin, ShieldCheck, ArrowRight, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function SavedTalent() {
  const { employerProfile, allWorkers, unsaveWorker } = useApp()
  if (!employerProfile) return null

  const saved = allWorkers.filter(w => employerProfile.savedWorkerIds.includes(w.id))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Saved Talent</h1>
        <p className="text-sm text-gray-500 mt-1">{saved.length} worker{saved.length !== 1 ? 's' : ''} bookmarked</p>
      </div>

      {saved.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <div className="text-5xl">🔖</div>
          <p className="font-bold text-gray-700">No saved workers yet</p>
          <p className="text-sm text-gray-400">Tap the bookmark icon on any worker profile to save them here.</p>
          <Link to="/employer/discover" className="btn-primary inline-flex items-center gap-2 mt-2 bg-blue-600 hover:bg-blue-700">
            Browse Workers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {saved.map(worker => (
            <div key={worker.id} className="card flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-2xl font-black text-white shrink-0">
                  {worker.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{worker.name}</h3>
                    {worker.onboardingComplete && <ShieldCheck size={14} className="text-green-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{worker.profession}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={10} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400 truncate">{worker.location}</span>
                  </div>
                </div>
                <button onClick={() => unsaveWorker(worker.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 group transition-colors shrink-0"
                  aria-label="Remove from saved">
                  <Trash2 size={15} className="text-gray-400 group-hover:text-red-500" />
                </button>
              </div>

              {worker.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills.slice(0, 3).map(s => (
                    <span key={s.id}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        s.verified ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {s.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-auto">
                <Link to={`/talent/${worker.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl py-2 transition-colors">
                  View Passport <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}
