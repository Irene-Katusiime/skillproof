import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, UserCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/PageHeader'
import StarRating from '../components/StarRating'

type Mode = 'select' | 'endorse' | 'confirm-project' | 'done'

export default function Endorse() {
  const { profile, addEndorsement, confirmProject } = useApp()
  const [params] = useSearchParams()
  const preselectedProjectId = params.get('projectId') || ''

  const [mode, setMode] = useState<Mode>(preselectedProjectId ? 'confirm-project' : 'select')
  const [selectedProjectId, setSelectedProjectId] = useState(preselectedProjectId)
  const [rating, setRating] = useState(5)
  const [form, setForm] = useState({ clientName: '', clientRole: '', message: '' })
  const [confirmForm, setConfirmForm] = useState({ testimonial: '', rating: 5 })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const setC = (k: string, v: string | number) => setConfirmForm(f => ({ ...f, [k]: v }))
  const firstName = profile.name.split(' ')[0]

  const handleEndorse = (e: React.FormEvent) => {
    e.preventDefault()
    addEndorsement({ ...form, rating, date: new Date().toISOString().split('T')[0] })
    setMode('done')
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    confirmProject(selectedProjectId, confirmForm.testimonial, confirmForm.rating)
    setMode('done')
  }

  if (mode === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Thank you!</h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Your confirmation helps build a verified record of {firstName}'s work and skills.
        </p>
        <button onClick={() => setMode('select')} className="btn-secondary mt-2">
          Submit another
        </button>
      </div>
    )
  }

  if (mode === 'select') {
    return (
      <div>
        <PageHeader title="Client Confirmation" subtitle="Verify work or leave an endorsement" />
        <div className="max-w-2xl space-y-3">
          <div className="card bg-orange-50 border-orange-100">
            <p className="text-sm text-orange-800 font-medium">Are you a client of {firstName}?</p>
            <p className="text-xs text-orange-700 mt-1">
              Confirming work or leaving an endorsement helps build their verified Skill Passport.
            </p>
          </div>

          {/* Side-by-side on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <button
              onClick={() => setMode('confirm-project')}
              className="card text-left flex items-center gap-4 hover:border-orange-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} className="text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Confirm a specific project</p>
                <p className="text-xs text-gray-500 mt-0.5">You hired {firstName} and want to confirm the work was done</p>
              </div>
            </button>

            <button
              onClick={() => setMode('endorse')}
              className="card text-left flex items-center gap-4 hover:border-orange-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <UserCheck size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Leave a general endorsement</p>
                <p className="text-xs text-gray-500 mt-0.5">Write a review or recommendation based on your experience</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'confirm-project') {
    return (
      <div>
        <PageHeader title="Confirm a Project" subtitle="Select the project you commissioned" back />
        <form onSubmit={handleConfirm} className="max-w-2xl space-y-5">
          <div>
            <label className="label">Select Project *</label>
            {/* 2-col grid on lg for project selector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {profile.projects.map(p => (
                <button key={p.id} type="button" onClick={() => setSelectedProjectId(p.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedProjectId === p.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-200'
                  }`}>
                  <p className="font-semibold text-sm text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.clientName} · {new Date(p.completedAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                  </p>
                  {p.confirmed && <span className="badge-green text-[10px] mt-1 inline-flex">Already confirmed</span>}
                </button>
              ))}
            </div>
          </div>

          {selectedProjectId && !profile.projects.find(p => p.id === selectedProjectId)?.confirmed && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <label className="label">Your Rating *</label>
                <StarRating rating={confirmForm.rating} interactive onChange={r => setC('rating', r)} size={28} />
              </div>
              <div className="lg:col-span-2">
                <label className="label">Testimonial <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea className="input resize-none" rows={4}
                  placeholder={`Share your experience working with ${firstName}...`}
                  value={confirmForm.testimonial} onChange={e => setC('testimonial', e.target.value)} />
              </div>
              <div>
                <button type="submit" className="btn-primary w-full lg:w-auto lg:px-10 py-3 text-base">
                  Confirm This Project
                </button>
              </div>
            </div>
          )}
        </form>
        <div className="h-4" />
      </div>
    )
  }

  // Endorse mode
  return (
    <div>
      <PageHeader title="Leave an Endorsement" subtitle={`Write a review for ${firstName}`} back />
      <form onSubmit={handleEndorse} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="label">Your Name *</label>
            <input className="input" placeholder="e.g. Grace Ngugi"
              value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
          </div>
          <div>
            <label className="label">Your Role / Title *</label>
            <input className="input" placeholder="e.g. Bride, Business Owner, Neighbour"
              value={form.clientRole} onChange={e => set('clientRole', e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label">Your Rating *</label>
          <StarRating rating={rating} interactive onChange={setRating} size={28} />
        </div>
        <div>
          <label className="label">Your Message *</label>
          <textarea className="input resize-none" rows={5}
            placeholder={`Describe your experience with ${firstName}'s work and skills...`}
            value={form.message} onChange={e => set('message', e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary w-full lg:w-auto lg:px-10 py-3 text-base">
          Submit Endorsement
        </button>
      </form>
      <div className="h-4" />
    </div>
  )
}
