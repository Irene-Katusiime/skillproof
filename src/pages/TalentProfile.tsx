import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  MapPin, Phone, Mail, ShieldCheck, Award, Briefcase,
  Star, CheckCircle2, Calendar, ArrowLeft, Send,
  MessageCircle, UserCheck, X, ExternalLink,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import StarRating from '../components/StarRating'

function ContactModal({ workerName, onClose }: { workerName: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', company: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.name && form.phone && form.message

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        {sent ? (
          <div className="flex flex-col items-center py-8 gap-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">Message Sent!</h3>
            <p className="text-sm text-gray-500">
              Your message has been sent to <strong>{workerName}</strong>. They will be in touch with you shortly.
            </p>
            <button onClick={onClose} className="btn-primary px-8 py-2.5 mt-2">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Contact {workerName.split(' ')[0]}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Send a message to discuss your project or job opportunity</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Your Name *</label>
                  <input className="input" placeholder="John Doe" value={form.name}
                    onChange={e => set('name', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Company / Role</label>
                  <input className="input" placeholder="e.g. HR Manager" value={form.company}
                    onChange={e => set('company', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Your Phone *</label>
                <input className="input" placeholder="+254 7XX XXX XXX" type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)} required />
              </div>
              <div>
                <label className="label">Your Message *</label>
                <textarea className="input resize-none" rows={4}
                  placeholder={`Tell ${workerName.split(' ')[0]} about your project, timeline, and what you need…`}
                  value={form.message} onChange={e => set('message', e.target.value)} required />
              </div>
              <button type="submit" disabled={!valid}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40">
                <Send size={16} /> Send Message
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function HireModal({ workerName, onClose }: { workerName: string; onClose: () => void }) {
  const [form, setForm] = useState({ jobTitle: '', startDate: '', duration: '', budget: '', description: '' })
  const [sent, setSent] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const valid = form.jobTitle && form.startDate && form.description

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        {sent ? (
          <div className="flex flex-col items-center py-8 gap-4 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck size={32} className="text-blue-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">Hire Request Sent!</h3>
            <p className="text-sm text-gray-500">
              Your hire request has been sent to <strong>{workerName}</strong>. They will review and respond soon.
            </p>
            <button onClick={onClose} className="btn-primary px-8 py-2.5 mt-2">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Hire {workerName.split(' ')[0]}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Submit a job offer or project request</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={e => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <div>
                <label className="label">Job / Project Title *</label>
                <input className="input" placeholder="e.g. School uniform order for 50 students"
                  value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Date *</label>
                  <input type="date" className="input" value={form.startDate}
                    onChange={e => set('startDate', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input className="input" placeholder="e.g. 2 weeks"
                    value={form.duration} onChange={e => set('duration', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Budget (optional)</label>
                <input className="input" placeholder="e.g. KES 15,000" value={form.budget}
                  onChange={e => set('budget', e.target.value)} />
              </div>
              <div>
                <label className="label">Project Description *</label>
                <textarea className="input resize-none" rows={3}
                  placeholder="Describe what you need in detail…"
                  value={form.description} onChange={e => set('description', e.target.value)} required />
              </div>
              <button type="submit" disabled={!valid}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40">
                <UserCheck size={16} /> Send Hire Request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function TalentProfile() {
  const { id } = useParams<{ id: string }>()
  const { allWorkers } = useApp()
  const navigate = useNavigate()
  const [showContact, setShowContact] = useState(false)
  const [showHire,    setShowHire]    = useState(false)
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'reviews'>('skills')

  const worker = allWorkers.find(w => w.id === id)

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-bold text-gray-800">Worker not found</h2>
        <p className="text-sm text-gray-500">This Skill Passport may have been removed.</p>
        <button onClick={() => navigate('/discover')} className="btn-primary mt-2">Back to Discover</button>
      </div>
    )
  }

  const verifiedSkills    = worker.skills.filter(s => s.verified)
  const confirmedProjects = worker.projects.filter(p => p.confirmed)
  const avgRating         = worker.endorsements.length
    ? (worker.endorsements.reduce((s, e) => s + e.rating, 0) / worker.endorsements.length).toFixed(1)
    : worker.rating?.toFixed(1) || '—'

  return (
    <>
      {showContact && <ContactModal workerName={worker.name} onClose={() => setShowContact(false)} />}
      {showHire    && <HireModal    workerName={worker.name} onClose={() => setShowHire(false)} />}

      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Discover
        </button>

        <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 space-y-5 lg:space-y-0">

          {/* ── LEFT: Profile card (sticky) ── */}
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">

            {/* Passport card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-700 to-emerald-500 text-white shadow-lg">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
              <div className="relative p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award size={14} className="text-yellow-300" />
                  <span className="text-[10px] font-bold tracking-widest text-yellow-300 uppercase">SkillProof Verified Passport</span>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black shrink-0">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg leading-tight">{worker.name}</h2>
                    <p className="text-green-200 text-sm">{worker.profession}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <StarRating rating={Number(avgRating) || 0} size={12} />
                      <span className="text-sm font-semibold">{avgRating}</span>
                      {worker.endorsements.length > 0 && (
                        <span className="text-xs text-green-300">({worker.endorsements.length})</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-green-200">
                    <MapPin size={12} className="shrink-0" /> {worker.location}
                  </div>
                  {worker.phone && (
                    <div className="flex items-center gap-2 text-xs text-green-200">
                      <Phone size={12} className="shrink-0" /> {worker.phone}
                    </div>
                  )}
                  {worker.email && (
                    <div className="flex items-center gap-2 text-xs text-green-200">
                      <Mail size={12} className="shrink-0" /> {worker.email}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Jobs',     value: worker.completedJobs },
                    { label: 'Skills',   value: verifiedSkills.length },
                    { label: 'Projects', value: confirmedProjects.length },
                  ].map(s => (
                    <div key={s.label} className="bg-white/15 rounded-xl p-2 text-center">
                      <p className="font-bold">{s.value}</p>
                      <p className="text-[10px] text-green-200">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/15 rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-green-200 uppercase tracking-wide">Passport ID</p>
                    <p className="text-xs font-mono font-bold">{worker.passportId}</p>
                  </div>
                  <ExternalLink size={14} className="text-green-300" />
                </div>
              </div>
            </div>

            {/* Bio */}
            {worker.bio && (
              <div className="card">
                <h3 className="font-bold text-sm text-gray-800 mb-2">About</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{worker.bio}</p>
              </div>
            )}

            {/* CTA buttons */}
            <div className="space-y-2.5">
              <button onClick={() => setShowHire(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                <UserCheck size={18} /> Hire {worker.name.split(' ')[0]}
              </button>
              <button onClick={() => setShowContact(true)}
                className="btn-secondary w-full py-3 flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Send a Message
              </button>
              {worker.phone && (
                <a href={`tel:${worker.phone}`}
                  className="w-full py-2.5 border-2 border-green-500 text-green-600 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-green-50 transition-colors text-sm">
                  <Phone size={15} /> Call Directly
                </a>
              )}
            </div>
          </div>

          {/* ── RIGHT: Tabs ── */}
          <div>
            <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
              {[
                { id: 'skills',   label: 'Skills',   count: worker.skills.length },
                { id: 'projects', label: 'Projects', count: worker.projects.length },
                { id: 'reviews',  label: 'Reviews',  count: worker.endorsements.length },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${
                    activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab.label} <span className="text-[10px] font-bold ml-0.5 opacity-60">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Skills */}
            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {worker.skills.length === 0
                  ? <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No skills listed.</p>
                  : worker.skills.map(skill => {
                    const levelColor: Record<string, string> = {
                      Expert: 'bg-purple-50 border-purple-200 text-purple-700',
                      Advanced: 'bg-blue-50 border-blue-200 text-blue-700',
                      Intermediate: 'bg-orange-50 border-orange-200 text-orange-700',
                      Beginner: 'bg-gray-50 border-gray-200 text-gray-600',
                    }
                    return (
                      <div key={skill.id} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${levelColor[skill.level]}`}>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm">{skill.name}</span>
                            {skill.verified && <ShieldCheck size={13} className="text-green-600" />}
                          </div>
                          <p className="text-xs opacity-70 mt-0.5">
                            {skill.level} · {skill.yearsOfExperience}yr{skill.yearsOfExperience !== 1 ? 's' : ''} · {skill.endorsements} endorsements
                          </p>
                        </div>
                        {skill.verified && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-lg">Verified</span>
                        )}
                      </div>
                    )
                  })
                }
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {worker.projects.length === 0
                  ? <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No projects listed.</p>
                  : worker.projects.map(project => (
                    <div key={project.id} className="card space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-gray-800 leading-tight">{project.title}</h4>
                        {project.confirmed
                          ? <span className="badge-green shrink-0 text-[10px]"><ShieldCheck size={10} />Confirmed</span>
                          : <span className="badge-gray shrink-0 text-[10px]">Unconfirmed</span>
                        }
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{project.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                          <p className="text-xs font-medium text-gray-700">{project.clientName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar size={10} className="text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {new Date(project.completedAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        {project.rating && <StarRating rating={project.rating} size={12} />}
                      </div>
                      {project.testimonial && (
                        <blockquote className="bg-gray-50 rounded-xl p-3 border-l-4 border-orange-400">
                          <p className="text-xs text-gray-600 italic">"{project.testimonial}"</p>
                        </blockquote>
                      )}
                    </div>
                  ))
                }
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {worker.endorsements.length === 0
                  ? <p className="text-sm text-gray-400 py-8 text-center">No reviews yet.</p>
                  : worker.endorsements.map(e => (
                    <div key={e.id} className="card space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-gray-800">{e.clientName}</p>
                          <p className="text-xs text-gray-500">{e.clientRole}</p>
                        </div>
                        {e.verified
                          ? <span className="badge-green shrink-0 text-[10px]"><ShieldCheck size={10} />Verified</span>
                          : <span className="badge-gray shrink-0 text-[10px]">Unverified</span>
                        }
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={13} className={i <= e.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 italic">"{e.message}"</p>
                      <p className="text-xs text-gray-400">
                        {new Date(e.date).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
