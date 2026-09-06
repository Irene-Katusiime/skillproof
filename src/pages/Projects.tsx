import { Link } from 'react-router-dom'
import { Plus, Briefcase, ShieldCheck, Calendar } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/PageHeader'
import StarRating from '../components/StarRating'
import AudioPlayer from '../components/AudioPlayer'

export default function Projects() {
  const { profile } = useApp()

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle={`${profile.projects.length} projects · ${profile.projects.filter(p => p.confirmed).length} confirmed`}
        right={
          <Link to="/projects/add" className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
            <Plus size={16} /> Add
          </Link>
        }
      />

      {/* 1 col mobile → 2 col lg → 3 col xl */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {profile.projects.map(project => (
          <div key={project.id} className="card space-y-3 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-800 leading-snug">{project.title}</h3>
                  <span className="badge-orange text-[10px] mt-1 inline-flex">{project.category}</span>
                </div>
              </div>
              {project.confirmed
                ? <span className="badge-green shrink-0"><ShieldCheck size={11} />Confirmed</span>
                : <span className="badge-gray shrink-0">Pending</span>
              }
            </div>

            <p className="text-xs text-gray-600 leading-relaxed flex-1">{project.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-700">{project.clientName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {new Date(project.completedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              {project.rating && <StarRating rating={project.rating} size={14} />}
            </div>

            {project.testimonial && (
              <blockquote className="bg-gray-50 rounded-xl p-3 border-l-4 border-orange-400">
                <p className="text-xs text-gray-600 italic">"{project.testimonial}"</p>
              </blockquote>
            )}

            {project.audioDescription && (
              <AudioPlayer src={project.audioDescription} label="Audio description" />
            )}

            {project.videoDescription && (
              <div className="rounded-xl overflow-hidden bg-black aspect-video">
                <video
                  src={project.videoDescription}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  aria-label="Video description"
                />
              </div>
            )}

            {!project.confirmed && project.clientContact && (
              <Link
  to="/endorse"
  className="block text-center text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl py-2 transition-colors"
>
  Generate client confirmation link →
</Link>
            )}
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  )
}
