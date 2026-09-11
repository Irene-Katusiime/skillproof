import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, CheckCircle2, ArrowRight, Plus, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import OnboardingShell from './OnboardingShell'

const CATEGORIES = [
  'Custom Tailoring', 'African Print Design', 'Bridal Wear', 'Corporate Uniforms',
  'Electronics Repair', 'Plumbing', 'Construction', 'Beauty & Hair', 'Mechanics',
  'Farming & Agriculture', 'Carpentry', 'Other',
]

interface QuizQuestion { question: string; options: string[]; correct: number }

const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    question: 'What is the most important step before cutting fabric for a custom garment?',
    options: ['Wash and press the fabric', 'Pick the colour first', 'Start sewing immediately', 'Buy new scissors'],
    correct: 0,
  },
  {
    question: 'When measuring a client for a fitted dress, which measurement is most critical?',
    options: ['Shoe size', 'Waist, hips and bust', 'Hair length', 'Height only'],
    correct: 1,
  },
  {
    question: 'A client asks for a rush order in 2 days. What should you do first?',
    options: ['Agree immediately', 'Check your schedule and material availability', 'Charge double without warning', 'Refuse'],
    correct: 1,
  },
]

export default function ProveSkills() {
  const { addProject } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'project' | 'quiz'>('project')
  const [projectAdded, setProjectAdded] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [form, setForm] = useState({ title: '', clientName: '', completedAt: '', category: '', description: '', videoDescription: '' })
  const [recording, setRecording] = useState(false)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const projectValid = form.title && form.clientName && form.completedAt && form.category && form.description

  const handleAddProject = () => {
    // include any recorded/uploaded video as base64 data URL in videoDescription
    addProject(form)
    setProjectAdded(true)
  }

  // --- Video recording handlers ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      mediaStreamRef.current = stream
      recordedChunksRef.current = []
      const chooseMime = () => {
        if (typeof MediaRecorder === 'undefined') return ''
        const options = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8,opus', 'video/webm']
        for (const o of options) if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(o)) return o
        return ''
      }
      const mime = chooseMime()
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      mr.ondataavailable = (e: BlobEvent) => { if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data) }
      mr.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: recordedChunksRef.current[0]?.type || 'video/webm' })
        if (recordedUrl) URL.revokeObjectURL(recordedUrl)
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
        // clear srcObject and set src to blob url for reliable preview
        if (videoPreviewRef.current) {
          try { videoPreviewRef.current.srcObject = null } catch (e) {}
          videoPreviewRef.current.src = url
          setTimeout(() => { videoPreviewRef.current?.play().catch(() => {}) }, 50)
        }
        // convert to base64 data URL
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          setForm(f => ({ ...f, videoDescription: base64 }))
        }
        reader.readAsDataURL(blob)
        mediaStreamRef.current?.getTracks().forEach(t => t.stop())
        mediaStreamRef.current = null
      }
      mediaRecorderRef.current = mr
      // attach preview
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream
      mr.start()
      setRecording(true)
    } catch (err) {
      console.error('Could not start video recording', err)
      alert('Could not access camera. Please allow camera access and try again.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  const handleVideoUpload = (file: File | null) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setRecordedUrl(url)
    const reader = new FileReader()
    reader.onloadend = () => setForm(f => ({ ...f, videoDescription: reader.result as string }))
    reader.readAsDataURL(file)
  }

  useEffect(() => () => {
    // cleanup object URLs and streams
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    mediaStreamRef.current?.getTracks().forEach(t => t.stop())
  }, [recordedUrl])

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    setTimeout(() => {
      const next = [...answers, i]
      setAnswers(next)
      if (current + 1 < SAMPLE_QUIZ.length) {
        setCurrent(c => c + 1)
        setSelected(null)
      } else {
        // Score is calculated from next (not yet in state)
        const score = next.filter((a, idx) => a === SAMPLE_QUIZ[idx]?.correct).length
        setQuizDone(score > 0) // only mark done (passed) if at least 1 correct
      }
    }, 900)
  }

  const quizScore = answers.filter((a, i) => a === SAMPLE_QUIZ[i]?.correct).length
  const quizFinished = answers.length === SAMPLE_QUIZ.length  // all questions answered
  const quizPassed   = quizFinished && quizScore > 0          // passed = at least 1 correct
  const canContinue  = projectAdded || quizPassed

  const handleContinue = () => navigate('/onboarding/verified')

  return (
    <OnboardingShell
      step={3}
      title="Prove Your Skills"
      subtitle="Add a real project you completed, or take a quick skill quiz. Either one adds verified proof to your passport."
    >
      {/* Tab selector */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
        {[
          { id: 'project', label: '📁 Add a Project', done: projectAdded },
          { id: 'quiz',    label: '⚡ Quick Quiz',     done: quizPassed },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as 'project' | 'quiz')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === t.id ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.done && <CheckCircle2 size={14} className="text-green-500" />}
            {t.label}
          </button>
        ))}
      </div>

      {/* Project tab */}
      {tab === 'project' && (
        projectAdded ? (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="font-bold text-gray-800 text-lg">Project Added!</p>
            <p className="text-sm text-gray-500">"{form.title}" has been added to your passport.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Project Title *</label>
              <input className="input" placeholder="e.g. Bridal gown for Ngugi Wedding"
                value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Client Name *</label>
                <input className="input" placeholder="e.g. Grace Ngugi"
                  value={form.clientName} onChange={e => set('clientName', e.target.value)} />
              </div>
              <div>
                <label className="label">Date Completed *</label>
                <input type="date" className="input"
                  value={form.completedAt} onChange={e => set('completedAt', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Category *</label>
              <select className="input bg-white" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">What did you do? *</label>
              <textarea className="input resize-none" rows={3}
                placeholder="Describe the work you did for this client..."
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div>
              <label className="label">Record or upload a short video (optional)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {!recording ? (
                    <button onClick={startRecording} className="btn-secondary px-3 py-2">Start Recording</button>
                  ) : (
                    <button onClick={stopRecording} className="btn-secondary px-3 py-2 bg-red-500 text-white">Stop</button>
                  )}
                  <label className="btn-secondary px-3 py-2 cursor-pointer">
                    Upload Video
                    <input type="file" accept="video/*" className="hidden" onChange={e => handleVideoUpload(e.target.files?.[0] ?? null)} />
                  </label>
                  {form.videoDescription && <span className="text-xs text-green-600">Video attached</span>}
                </div>

                <div className="bg-gray-50 rounded-xl p-2">
                  <video ref={el => (videoPreviewRef.current = el)} src={recordedUrl ?? undefined} controls className="w-full rounded-lg" />
                </div>
              </div>
            </div>
            <button onClick={handleAddProject} disabled={!projectValid}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <Plus size={16} /> Add This Project
            </button>
          </div>
        )
      )}

      {/* Quiz tab */}
      {tab === 'quiz' && (
        quizFinished ? (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            {quizPassed ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Star size={32} className="text-green-500 fill-green-500" />
                </div>
                <p className="font-bold text-gray-800 text-lg">Quiz Passed! ✅</p>
                <p className="text-3xl font-black text-gray-900">{quizScore}/{SAMPLE_QUIZ.length}</p>
                <p className="text-sm text-gray-500">
                  {quizScore === SAMPLE_QUIZ.length ? 'Perfect score! 🎉' : 'Well done — your skills are confirmed.'}
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">❌</span>
                </div>
                <p className="font-bold text-gray-800 text-lg">Quiz Failed</p>
                <p className="text-3xl font-black text-red-500">{quizScore}/{SAMPLE_QUIZ.length}</p>
                <p className="text-sm text-gray-500 max-w-xs">
                  You need at least 1 correct answer to earn a verified badge. Try again or add a project instead.
                </p>
                <button
                  onClick={() => {
                    setAnswers([])
                    setCurrent(0)
                    setSelected(null)
                    setQuizDone(false)
                  }}
                  className="btn-primary mt-2 px-6 py-2.5 text-sm"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${((current) / SAMPLE_QUIZ.length) * 100}%` }} />
              </div>
              <span className="text-xs font-semibold text-gray-500">{current + 1}/{SAMPLE_QUIZ.length}</span>
            </div>

            {/* Question */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                {SAMPLE_QUIZ[current].question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {SAMPLE_QUIZ[current].options.map((opt, i) => {
                const isCorrect = i === SAMPLE_QUIZ[current].correct
                const isSelected = selected === i
                const revealed = selected !== null
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={revealed}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      !revealed
                        ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        : isCorrect
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isSelected
                            ? 'border-red-400 bg-red-50 text-red-600'
                            : 'border-gray-200 text-gray-400'
                    }`}>
                    {opt}
                    {revealed && isCorrect && <span className="ml-2 text-green-600">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )
      )}

      {/* Continue button */}
      <div className="mt-6 space-y-2">
        <button onClick={handleContinue} disabled={!canContinue}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          <Briefcase size={18} /> Get My Verified Badge <ArrowRight size={18} />
        </button>
        {!canContinue && (
          <p className="text-center text-xs text-gray-400">
            {quizFinished && !quizPassed
              ? 'You need at least 1 correct answer, or add a project to continue'
              : 'Complete a project or pass the quiz to continue'}
          </p>
        )}
      </div>
    </OnboardingShell>
  )
}
