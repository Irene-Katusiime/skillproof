import { useState } from 'react'
import {
  Award, ShieldCheck, MapPin, Phone, Mail,
  Briefcase, CheckCircle2, Share2, Download,
  ExternalLink, Calendar, Copy, Link2, X,
  Star, TrendingUp,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import StarRating from '../components/StarRating'
import SkillBadge from '../components/SkillBadge'

function ShareModal({ passportId, onClose }: { passportId: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = `https://skillproof.africa/passport/${passportId}`

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  const channels = [
    { label: 'WhatsApp',  color: 'bg-green-500',  emoji: '💬', href: `https://wa.me/?text=Check%20out%20my%20Skill%20Passport%3A%20${encodeURIComponent(url)}` },
    { label: 'LinkedIn',  color: 'bg-blue-600',   emoji: '💼', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: 'Twitter/X', color: 'bg-black',       emoji: '🐦', href: `https://twitter.com/intent/tweet?text=My%20verified%20Skill%20Passport%3A%20${encodeURIComponent(url)}` },
    { label: 'Email',     color: 'bg-orange-500',  emoji: '📧', href: `mailto:?subject=My%20SkillProof%20Passport&body=Check%20out%20my%20verified%20Skill%20Passport%3A%20${url}` },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Share Your Passport</h3>
            <p className="text-xs text-gray-500 mt-0.5">Let clients, employers, and lenders see your verified skills</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Copy link */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
          <Link2 size={15} className="text-gray-400 shrink-0" />
          <p className="text-xs text-gray-600 flex-1 truncate font-mono">{url}</p>
          <button onClick={copy}
            className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
              copied ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share channels */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">Share on</p>
          <div className="grid grid-cols-4 gap-3">
            {channels.map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group">
                <div className={`w-12 h-12 ${c.color} rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform`}>
                  {c.emoji}
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{c.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Download hint */}
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
          <Download size={16} className="text-orange-500 shrink-0" />
          <p className="text-xs text-orange-700">
            <span className="font-semibold">Print / Download</span> — Use your browser's print function to save as PDF.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SkillPassport() {
  const { profile } = useApp()
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'assessments' | 'endorsements'>('skills')
  const [showShare, setShowShare] = useState(false)

  const tabs = [
    { id: 'skills',       label: 'Skills',      count: profile.skills.length       },
    { id: 'projects',     label: 'Projects',    count: profile.projects.length      },
    { id: 'assessments',  label: 'Assessments', count: profile.assessments.length   },
    { id: 'endorsements', label: 'Reviews',     count: profile.endorsements.length  },
  ] as const

  return (
    <>
      {showShare && <ShareModal passportId={profile.passportId} onClose={() => setShowShare(false)} />}

      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-6 space-y-5 lg:space-y-0">

        {/* ── LEFT: Passport card (sticky on desktop) ── */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">

          {/* Green passport card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white shadow-xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-yellow-300" />
                  <span className="text-xs font-bold tracking-widest text-yellow-300 uppercase">SkillProof Passport</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowShare(true)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors" aria-label="Share">
                    <Share2 size={15} />
                  </button>
                  <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors" aria-label="Download"
                    onClick={() => window.print()}>
                    <Download size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-[72px] h-[72px] rounded-2xl bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-4xl font-bold shrink-0">
                  {profile.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold leading-tight">{profile.name}</h2>
                  <p className="text-green-100 text-sm mt-0.5">{profile.profession}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <StarRating rating={profile.rating || 0} size={13} />
                    {profile.rating > 0 && <span className="text-sm font-semibold ml-1">{profile.rating}</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                    <span className="flex items-center gap-1 text-xs text-green-200">
                      <MapPin size={11} /> {profile.location}
                    </span>
                    {profile.yearsActive > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-200">
                        <Briefcase size={11} /> {profile.yearsActive}yr exp
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white/15 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-green-200 font-medium uppercase tracking-wide">Passport ID</p>
                  <p className="text-sm font-bold font-mono tracking-wide">{profile.passportId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-green-200 font-medium uppercase tracking-wide">Issued</p>
                  <p className="text-xs font-semibold">
                    {new Date(profile.passportIssuedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <ExternalLink size={15} className="text-green-300 shrink-0" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: 'Jobs Done',       value: profile.completedJobs },
                  { label: 'Verified Skills', value: profile.skills.filter(s => s.verified).length },
                  { label: 'Endorsements',    value: profile.endorsements.filter(e => e.verified).length },
                ].map(s => (
                  <div key={s.label} className="bg-white/15 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px] text-green-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-2">About</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio || 'No bio added yet.'}</p>
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500">
                  <Phone size={13} /> {profile.phone}
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500">
                  <Mail size={13} /> {profile.email}
                </a>
              )}
            </div>
          </div>

          {/* Share CTA */}
          <button onClick={() => setShowShare(true)}
            className="w-full card bg-orange-50 border-orange-100 hover:shadow-md transition-shadow flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <Share2 size={18} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Share your passport</p>
              <p className="text-xs text-gray-500 truncate">skillproof.africa/passport/{profile.passportId}</p>
            </div>
            <Copy size={15} className="text-orange-400 shrink-0" />
          </button>
        </div>

        {/* ── RIGHT: Tabs + content ── */}
        <div>
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${
                  activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab.label}
                <span className={`ml-1 text-[10px] font-bold ${activeTab === tab.id ? 'text-orange-400' : 'text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
              {profile.skills.length === 0
                ? <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No skills added yet. Complete your onboarding to add skills.</p>
                : profile.skills.map(skill => <SkillBadge key={skill.id} skill={skill} />)
              }
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {profile.projects.length === 0
                ? <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No projects added yet.</p>
                : profile.projects.map(project => (
                  <div key={project.id} className="card space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">{project.title}</h4>
                      {project.confirmed
                        ? <span className="badge-green shrink-0"><ShieldCheck size={11} />Confirmed</span>
                        : <span className="badge-gray shrink-0">Pending</span>
                      }
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{project.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs font-medium text-gray-700">{project.clientName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Calendar size={11} className="text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {new Date(project.completedAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      {project.rating && <StarRating rating={project.rating} size={13} />}
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

          {activeTab === 'assessments' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {profile.assessments.length === 0
                ? <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No assessments taken yet.</p>
                : profile.assessments.map(a => {
                  const pct = Math.round((a.score / a.maxScore) * 100)
                  return (
                    <div key={a.id} className="card">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-gray-800">{a.skillName}</h4>
                        <span className={a.passed ? 'badge-green' : 'badge-orange'}>
                          <CheckCircle2 size={11} />{a.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className={`h-full rounded-full ${a.passed ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 shrink-0">{pct}%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        Score: {a.score}/{a.maxScore} · {new Date(a.takenAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  )
                })
              }
            </div>
          )}

          {activeTab === 'endorsements' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {profile.endorsements.length === 0
                ? <p className="text-sm text-gray-400 col-span-2 py-8 text-center">No endorsements yet.</p>
                : profile.endorsements.map(e => (
                  <div key={e.id} className="card space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{e.clientName}</p>
                        <p className="text-xs text-gray-500">{e.clientRole}</p>
                      </div>
                      {e.verified
                        ? <span className="badge-green shrink-0"><ShieldCheck size={11} />Verified</span>
                        : <span className="badge-gray shrink-0">Unverified</span>
                      }
                    </div>
                    <StarRating rating={e.rating} size={14} />
                    <p className="text-sm text-gray-600 italic">"{e.message}"</p>
                    <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}</p>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    </>
  )
}
