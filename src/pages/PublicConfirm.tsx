import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import StarRating from '../components/StarRating'
import { useApp } from '../context/AppContext'

export default function PublicConfirm() {
  const { token } = useParams<{ token: string }>()
  const { getEndorsementRequestByToken, completeEndorsementRequest, allWorkers } = useApp()
  const req = token ? getEndorsementRequestByToken(token) : undefined

  const worker = req ? allWorkers.find(w => w.id === req.workerId) : undefined
  const project = req && req.projectId ? worker?.projects.find(p => p.id === req.projectId) : undefined

  const [form, setForm] = useState({ clientName: req?.clientName ?? '', clientRole: req?.clientName ?? '', message: '' })
  const [rating, setRating] = useState(5)
  const [done, setDone] = useState(false)

  if (!req || !worker) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold">Invalid or expired endorsement link</h2>
        <p className="text-sm text-gray-500 mt-2">The link is not valid or the request has already been completed.</p>
      </div>
    )
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = completeEndorsementRequest(req.token, { clientName: form.clientName, clientRole: form.clientRole, message: form.message, rating })
    if (ok) setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold">Thanks — your confirmation is recorded</h2>
        <p className="text-sm text-gray-500 mt-2">Your endorsement helps {worker.name} build a verified Skill Passport.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={`Confirm ${worker.name}'s Work`} subtitle={project ? project.title : 'Leave a short endorsement'} />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        {project && (
          <div className="card">
            <p className="font-semibold">Project</p>
            <p className="text-sm text-gray-600">{project.title} · {project.clientName}</p>
          </div>
        )}

        <div>
          <label className="label">Your Name *</label>
          <input className="input" value={form.clientName} onChange={e => set('clientName', e.target.value)} required />
        </div>
        <div>
          <label className="label">Your Role / Title *</label>
          <input className="input" value={form.clientRole} onChange={e => set('clientRole', e.target.value)} required />
        </div>
        <div>
          <label className="label">Your Rating *</label>
          <StarRating rating={rating} interactive onChange={setRating} size={28} />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input resize-none" rows={4} value={form.message} onChange={e => set('message', e.target.value)} />
        </div>
        <button type="submit" className="btn-primary py-3 px-6">Submit confirmation</button>
      </form>
    </div>
  )
}
