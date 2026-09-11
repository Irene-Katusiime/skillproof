import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Lightbulb, Mic, MicOff, Square, Loader2 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import OnboardingShell from './OnboardingShell'

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

// ── Prompts ───────────────────────────────────────────────────────────────────
const PROMPTS = [
  'What kind of work do you do every day?',
  'What are you most proud of making or fixing?',
  'How long have you been doing this work?',
  'What do clients say about your work?',
]

type RecordingState = 'idle' | 'recording' | 'processing' | 'unsupported'

export default function TellYourStory() {
  const { profile } = useApp()
  const navigate = useNavigate()

  const [story,         setStory]         = useState(profile.bio || '')
  const [activePrompt,  setActivePrompt]  = useState<number | null>(null)
  const [recordState,   setRecordState]   = useState<RecordingState>('idle')
  const [interimText,   setInterimText]   = useState('')
  const [recordError,   setRecordError]   = useState('')
  const [recordSeconds, setRecordSeconds] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const storyRef       = useRef(story)

  // Keep ref in sync so the onresult closure always has current story value
  useEffect(() => { storyRef.current = story }, [story])

  // Detect Speech API support after component mounts
  useEffect(() => {
    if (!getSpeechRecognition()) {
      setRecordState('unsupported')
    }
    // else stays 'idle' — recorder is shown
  }, [])

  // Cleanup on unmount
  useEffect(() => () => {
    recognitionRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const startRecording = () => {
    const SR = getSpeechRecognition()
    if (!SR) return

    setRecordError('')
    setInterimText('')
    setRecordSeconds(0)

    const recognition = new SR()
    recognition.continuous     = true
    recognition.interimResults = true
    recognition.lang           = 'en-US'

    recognition.onstart = () => {
      setRecordState('recording')
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    }

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = ''
      let finalChunk = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i]
        const text   = result[0].transcript
        if (result.isFinal) {
          finalChunk += text + ' '
        } else {
          interim += text
        }
      }

      if (finalChunk) {
        // Append confirmed text to the story
        const current = storyRef.current
        const separator = current.trim() ? ' ' : ''
        setStory(current.trim() + separator + finalChunk.trim())
        setInterimText('')
      } else {
        setInterimText(interim)
      }
    }

    recognition.onerror = (e: Event) => {
      const err = (e as ErrorEvent).message || 'Microphone error'
      setRecordError(
        err.includes('not-allowed') || err.includes('permission')
          ? 'Microphone permission denied. Please allow microphone access and try again.'
          : 'Could not access microphone. Please check your microphone and try again.'
      )
      stopRecording()
    }

    recognition.onend = () => {
      setRecordState('idle')
      setInterimText('')
      if (timerRef.current) clearInterval(timerRef.current)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setRecordState('idle')
    setInterimText('')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const appendPrompt = (i: number) => {
    setActivePrompt(i)
    const prefix = story.trim() ? story.trim() + ' ' : ''
    setStory(prefix + PROMPTS[i] + ' ')
  }

  const handleContinue = () => {
    if (recordState === 'recording') stopRecording()
    sessionStorage.setItem('sp_onboarding_story', story)
    navigate('/onboarding/ai-skills')
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // --- Video recording for story (optional) ---
  const [videoRecording, setVideoRecording] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      mediaStreamRef.current = stream
      recordedChunksRef.current = []
      // choose a supported mime type if available
      const chooseMime = () => {
        if (typeof MediaRecorder === 'undefined') return ''
        const options = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ]
        for (const o of options) {
          if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(o)) return o
        }
        return ''
      }
      const mime = chooseMime()
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      mr.ondataavailable = (e: BlobEvent) => { if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recordedChunksRef.current[0]?.type || 'video/webm' })
        // revoke previous url
        if (videoUrl) URL.revokeObjectURL(videoUrl)
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        // clear any srcObject (camera stream) before setting blob url
        if (videoPreviewRef.current) {
          try { videoPreviewRef.current.srcObject = null } catch (e) { /* ignore */ }
          videoPreviewRef.current.src = url
          // attempt to autoplay preview
          setTimeout(() => { videoPreviewRef.current?.play().catch(() => {}) }, 50)
        }
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          sessionStorage.setItem('sp_onboarding_story_video', base64)
        }
        reader.readAsDataURL(blob)
        mediaStreamRef.current?.getTracks().forEach(t => t.stop())
        mediaStreamRef.current = null
      }
      mediaRecorderRef.current = mr
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream
      mr.start()
      setVideoRecording(true)
    } catch (err) {
      console.error('Video recording failed', err)
      setVideoRecording(false)
      alert('Could not access camera. Please allow camera access and try again.')
    }
  }

  const stopVideoRecording = () => {
    mediaRecorderRef.current?.stop()
    setVideoRecording(false)
  }

  const handleVideoUpload = (file: File | null) => {
    if (!file) return
    // revoke previous url
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    const reader = new FileReader()
    reader.onloadend = () => sessionStorage.setItem('sp_onboarding_story_video', reader.result as string)
    reader.readAsDataURL(file)
  }

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    mediaStreamRef.current?.getTracks().forEach(t => t.stop())
  }, [videoUrl])

  return (
    <OnboardingShell
      step={1}
      title="Tell Your Story"
      subtitle="Describe your work in your own words — type it or just speak and we'll write it for you."
    >
      <div className="space-y-5">

        {/* ── Voice recorder ── */}
        <div>
          <label className="label">Record your story (optional)</label>

          {recordState === 'unsupported' ? (
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <MicOff size={16} className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-500">
                Voice recording isn't supported in this browser. Type your story below instead, or try Chrome or Edge.
              </p>
            </div>
          ) : (
            <div className={`rounded-2xl border-2 p-4 transition-all ${
              recordState === 'recording'
                ? 'border-red-400 bg-red-50'
                : 'border-dashed border-gray-300 bg-gray-50 hover:border-orange-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {recordState === 'recording' ? (
                    <button
                      onClick={stopRecording}
                      className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                      aria-label="Stop recording"
                    >
                      <Square size={18} className="text-white fill-white" />
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                      aria-label="Start recording"
                    >
                      <Mic size={20} className="text-white" />
                    </button>
                  )}

                  <div>
                    {recordState === 'recording' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <p className="text-sm font-bold text-red-600">Recording… {formatTime(recordSeconds)}</p>
                        </div>
                        <p className="text-xs text-red-400 mt-0.5">Tap the square to stop</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700">Tap to speak your story</p>
                        <p className="text-xs text-gray-400 mt-0.5">Your spoken words will appear in the text box below</p>
                      </>
                    )}
                  </div>
                </div>

                {recordState === 'idle' && story.length > 0 && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <Sparkles size={11} /> Story captured
                  </span>
                )}
              </div>

              {/* Live interim transcript */}
              {interimText && (
                <div className="mt-3 px-3 py-2 bg-white rounded-xl border border-red-200">
                  <p className="text-xs text-gray-400 font-semibold mb-0.5 uppercase tracking-wide">Listening…</p>
                  <p className="text-sm text-gray-500 italic">{interimText}</p>
                </div>
              )}

              {/* Sound wave animation while recording */}
              {recordState === 'recording' && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-400 rounded-full animate-pulse"
                      style={{
                        height: `${10 + (i % 4) * 6}px`,
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: `${0.6 + (i % 3) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mic error */}
          {recordError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-2">
              <MicOff size={15} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{recordError}</p>
            </div>
          )}
        </div>

        {/* ── Story textarea ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Your work story *</label>
            {story.length > 0 && (
              <button
                onClick={() => setStory('')}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            className="input resize-none text-sm leading-relaxed"
            rows={7}
            placeholder={`Example:\n"I have been a tailor for 8 years. I make wedding dresses, school uniforms, and African print outfits. My clients love how I pay attention to every detail and always deliver on time..."`}
            value={story}
            onChange={e => setStory(e.target.value)}
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">{story.length} characters</p>
            {story.length >= 80 && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <Sparkles size={11} /> Great detail!
              </span>
            )}
          </div>
        </div>

        {/* ── Video recorder/upload for story (optional) ── */}
        <div>
          <label className="label">Record a short video about your work (optional)</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {!videoRecording ? (
                <button onClick={startVideoRecording} className="btn-secondary px-3 py-2">Start Recording</button>
              ) : (
                <button onClick={stopVideoRecording} className="btn-secondary px-3 py-2 bg-red-500 text-white">Stop Recording</button>
              )}
              <label className="btn-secondary px-3 py-2 cursor-pointer">
                Upload Video
                <input type="file" accept="video/*" className="hidden" onChange={e => handleVideoUpload(e.target.files?.[0] ?? null)} />
              </label>
              {videoUrl ? <span className="text-xs text-green-600">Video ready</span> : null}
            </div>

            <div className="bg-gray-50 rounded-xl p-2">
              <video ref={el => (videoPreviewRef.current = el)} src={videoUrl ?? undefined} controls className="w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* ── Prompt suggestions ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-orange-400" />
            <p className="text-xs font-semibold text-gray-500">Need inspiration? Click a prompt:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => appendPrompt(i)}
                className={`text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                  activePrompt === i
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* ── AI info box ── */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles size={18} className="text-violet-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-violet-800">AI will read your story next</p>
            <p className="text-xs text-violet-600 mt-0.5">
              The more detail you provide — whether typed or spoken — the better our AI can identify your real skills.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={story.trim().length < 30}
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {recordState === 'recording'
            ? <><Loader2 size={18} className="animate-spin" /> Stop recording & continue</>
            : <>Identify My Skills with AI <ArrowRight size={18} /></>
          }
        </button>
      </div>
    </OnboardingShell>
  )
}
