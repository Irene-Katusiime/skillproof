import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Mic, Video } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/PageHeader'
import AudioRecorder from '../components/AudioRecorder'
import VideoUploader from '../components/VideoUploader'

const CATEGORIES = [
  'Custom Tailoring', 'African Print Design', 'Bridal Wear', 'Corporate Uniforms',
  'Electronics Repair', 'Plumbing', 'Construction', 'Beauty & Hair', 'Mechanics',
  'Farming & Agriculture', 'Carpentry', 'Other',
]

export default function AddProject() {
  const { addProject } = useApp()
  const navigate = useNavigate()
  const [submitted,  setSubmitted]  = useState(false)
  const [audioUrl,   setAudioUrl]   = useState<string | null>(null)
  const [videoUrl,   setVideoUrl]   = useState<string | null>(null)
  const [activeTab,  setActiveTab]  = useState<'text' | 'audio' | 'video'>('text')
  const [form, setForm] = useState({
    title: '', description: '', clientName: '',
    clientContact: '', completedAt: '', category: '',
  })

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  // At least one description method must be used
  const hasDescription =
    form.description.trim().length > 0 || audioUrl !== null || videoUrl !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasDescription) return
    addProject({
      ...form,
      audioDescription: audioUrl   || undefined,
      videoDescription: videoUrl   || undefined,
    })
    setSubmitted(true)
    setTimeout(() => navigate('/projects'), 1800)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Project Added!</h2>
        <p className="text-sm text-gray-500 text-center">Your project has been saved to your Skill Passport.</p>
      </div>
    )
  }

  const descTabs = [
    { id: 'text',  icon: '✏️', label: 'Type',        done: form.description.trim().length > 0 },
    { id: 'audio', icon: '🎤', label: 'Record Audio', done: audioUrl !== null },
    { id: 'video', icon: '🎥', label: 'Record Video', done: videoUrl !== null },
  ] as const

  return (
    <div>
      <PageHeader title="Add a Project" subtitle="Document your real work" back />

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Title */}
          <div className="lg:col-span-2">
            <label className="label">Project Title *</label>
            <input
              className="input"
              placeholder="e.g. Bridal gown for Ngugi wedding"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
            />
          </div>

          {/* Description — 3 ways */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Description *</label>
              <span className="text-xs text-gray-400">pick one or more</span>
            </div>

            {/* Tab selector */}
            <div className="flex gap-1.5 mb-4">
              {descTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {tab.done && (
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 size={10} className="text-white" />
                    </span>
                  )}
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Text tab */}
            {activeTab === 'text' && (
              <div>
                <textarea
                  className="input resize-none"
                  rows={5}
                  placeholder="Describe what you did, how many pieces, timeline, special requirements…"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">{form.description.length} characters</p>
              </div>
            )}

            {/* Audio tab */}
            {activeTab === 'audio' && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Mic size={14} className="text-orange-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Record an audio description</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Press the mic button and speak about your project — what you did, who the client was, how it went.
                </p>
                <AudioRecorder onSave={setAudioUrl} />
              </div>
            )}

            {/* Video tab */}
            {activeTab === 'video' && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Video size={14} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Upload or record a video</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Show yourself and your work on camera, or upload a video you already have. Max 30 MB.
                </p>
                <VideoUploader onSave={setVideoUrl} />
              </div>
            )}

            {/* Summary of what's been filled */}
            <div className="flex flex-wrap gap-2 mt-3">
              {form.description.trim().length > 0 && (
                <span className="badge-green text-[11px]">✓ Text description</span>
              )}
              {audioUrl && (
                <span className="badge-orange text-[11px]">✓ Audio recorded</span>
              )}
              {videoUrl && (
                <span className="badge-blue text-[11px]">✓ Video added</span>
              )}
            </div>

            {!hasDescription && (
              <p className="text-xs text-orange-600 mt-2">
                Please add at least one description — text, audio, or video.
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <select
              className="input bg-white"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="label">Completion Date *</label>
            <input
              type="date"
              className="input"
              value={form.completedAt}
              onChange={e => set('completedAt', e.target.value)}
              required
            />
          </div>

          {/* Client name */}
          <div>
            <label className="label">Client Name *</label>
            <input
              className="input"
              placeholder="e.g. Grace Ngugi"
              value={form.clientName}
              onChange={e => set('clientName', e.target.value)}
              required
            />
          </div>

          {/* Client contact */}
          <div>
            <label className="label">
              Client Contact{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              className="input"
              placeholder="+254 7XX XXX XXX"
              value={form.clientContact}
              onChange={e => set('clientContact', e.target.value)}
            />
          </div>
        </div>

        {/* Tip */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-xs text-orange-700 font-medium">
            💡 Tip: A video description is the most powerful proof of your skills — employers and clients trust what they can see.
          </p>
        </div>

        <button
          type="submit"
          disabled={!hasDescription}
          className="btn-primary w-full lg:w-auto lg:px-10 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save Project to Passport
        </button>
      </form>
      <div className="h-4" />
    </div>
  )
}
