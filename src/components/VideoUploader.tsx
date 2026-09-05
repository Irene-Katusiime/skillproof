import { useState, useRef, useEffect } from 'react'
import {
  Upload, Square, Play, Pause,
  Trash2, Camera, CheckCircle2, AlertCircle, X,
} from 'lucide-react'

interface Props {
  onSave: (videoUrl: string | null) => void
  savedUrl?: string
}

type Mode     = 'choose' | 'record' | 'done'
type RecState = 'idle' | 'recording'

const MAX_MB    = 30
const MAX_BYTES = MAX_MB * 1024 * 1024

export default function VideoUploader({ onSave, savedUrl }: Props) {
  const [mode,         setMode]         = useState<Mode>(savedUrl ? 'done' : 'choose')
  const [recState,     setRecState]     = useState<RecState>('idle')
  const [videoUrl,     setVideoUrl]     = useState<string | null>(savedUrl || null)
  const [seconds,      setSeconds]      = useState(0)
  const [playing,      setPlaying]      = useState(false)
  const [errMsg,       setErrMsg]       = useState('')
  const [sizeErr,      setSizeErr]      = useState('')
  const [camSupported, setCamSupported] = useState(true)
  const [stream,       setStream]       = useState<MediaStream | null>(null)

  const mediaRef     = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const previewRef   = useRef<HTMLVideoElement>(null)   // always in DOM
  const playbackRef  = useRef<HTMLVideoElement>(null)   // always in DOM
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check camera support once on mount
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) setCamSupported(false)
    return () => { stopTimer(); releaseStream() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Whenever stream changes, wire it to the preview <video> element
  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    if (stream) {
      el.srcObject = stream
      el.play().catch(() => {/* autoplay may be blocked on some browsers */})
    } else {
      el.srcObject = null
    }
  }, [stream])

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const releaseStream = () => {
    setStream(prev => {
      prev?.getTracks().forEach(t => t.stop())
      return null
    })
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSizeErr('')
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_BYTES) {
      setSizeErr(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is ${MAX_MB} MB.`)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const url = reader.result as string
      setVideoUrl(url)
      onSave(url)
      setMode('done')
    }
    reader.readAsDataURL(file)
  }

  // ── Open camera ───────────────────────────────────────────────────────────
  const openCamera = async () => {
    setErrMsg('')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(s)       // triggers useEffect → assigns to previewRef
      setMode('record')
      setRecState('idle')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('notallowed')) {
        setErrMsg('Camera permission denied. Click the 🔒 in your browser address bar, allow Camera & Microphone, then try again.')
      } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('no device')) {
        setErrMsg('No camera found. Please connect a camera and try again.')
      } else {
        setErrMsg('Could not access camera. Please check your browser permissions.')
      }
    }
  }

  // ── Start recording ───────────────────────────────────────────────────────
  const startRecording = () => {
    if (!stream) return
    chunksRef.current = []

    const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4']
      .find(t => MediaRecorder.isTypeSupported(t)) || ''

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' })
      stopTimer()

      if (blob.size > MAX_BYTES) {
        setSizeErr(`Recording too large. Keep it under ${MAX_MB} MB (~3–5 min).`)
        releaseStream()
        setMode('choose')
        setRecState('idle')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const url = reader.result as string
        setVideoUrl(url)
        onSave(url)
        releaseStream()
        setMode('done')
        setRecState('idle')
      }
      reader.readAsDataURL(blob)
    }

    recorder.start(500)
    mediaRef.current = recorder
    setSeconds(0)
    setRecState('recording')
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  const stopRecording = () => {
    if (mediaRef.current?.state !== 'inactive') mediaRef.current?.stop()
    stopTimer()
  }

  const cancelCamera = () => {
    stopRecording()
    releaseStream()
    setMode('choose')
    setRecState('idle')
    setSeconds(0)
  }

  const clearVideo = () => {
    setVideoUrl(null)
    setMode('choose')
    setRecState('idle')
    setSeconds(0)
    setPlaying(false)
    setSizeErr('')
    setErrMsg('')
    onSave(null)
    releaseStream()
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (playbackRef.current) { playbackRef.current.pause(); playbackRef.current.removeAttribute('src') }
  }

  const togglePlay = () => {
    const el = playbackRef.current
    if (!el || !videoUrl) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.src = videoUrl
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/*
        Both <video> elements are ALWAYS in the DOM.
        Visibility is controlled by CSS so refs are always populated.
      */}

      {/* Live camera preview — visible only in record mode */}
      <div className={`relative rounded-2xl overflow-hidden bg-black aspect-video ${
        mode === 'record' ? 'block' : 'hidden'
      }`}>
        <video
          ref={previewRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />

        {/* REC badge */}
        {recState === 'recording' && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC {formatTime(seconds)}
          </div>
        )}

        {/* Standby badge */}
        {recState === 'idle' && mode === 'record' && (
          <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
            Camera ready
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
          {recState === 'idle' ? (
            <button type="button" onClick={startRecording}
              className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all active:scale-95"
              aria-label="Start recording">
              <div className="w-5 h-5 bg-white rounded-full" />
            </button>
          ) : (
            <button type="button" onClick={stopRecording}
              className="w-16 h-16 bg-gray-900 hover:bg-black rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all active:scale-95"
              aria-label="Stop recording">
              <Square size={20} className="text-white fill-white" />
            </button>
          )}
          <button type="button" onClick={cancelCamera}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
            aria-label="Close camera">
            <X size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Saved video playback — visible only when done */}
      <div className={mode === 'done' && videoUrl ? 'block space-y-2' : 'hidden'}>
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
          <video
            ref={playbackRef}
            className="w-full h-full object-cover"
            playsInline
            onEnded={() => setPlaying(false)}
          />
          {/* Play/pause overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button type="button" onClick={togglePlay}
              className="w-14 h-14 bg-black/50 hover:bg-black/70 backdrop-blur rounded-full flex items-center justify-center transition-all"
              aria-label={playing ? 'Pause' : 'Play'}>
              {playing
                ? <Pause size={22} className="text-white fill-white" />
                : <Play  size={22} className="text-white fill-white ml-1" />
              }
            </button>
          </div>
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 size={11} /> Video saved
          </div>
          <button type="button" onClick={clearVideo}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            aria-label="Delete video">
            <Trash2 size={14} className="text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center">▶ to preview · 🗑 to remove and re-do</p>
      </div>

      {/* Choose: upload or record */}
      {mode === 'choose' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Upload */}
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all group">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
              <Upload size={22} className="text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-800">Upload a video</p>
              <p className="text-xs text-gray-500 mt-0.5">From your phone or computer</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Max {MAX_MB} MB · MP4, MOV, WebM</p>
            </div>
          </button>

          {/* Record */}
          {camSupported ? (
            <button type="button" onClick={openCamera}
              className="flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Camera size={22} className="text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">Record with camera</p>
                <p className="text-xs text-gray-500 mt-0.5">Show yourself and your work live</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Uses your device camera</p>
              </div>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-5 rounded-2xl border-2 border-dashed border-gray-200 opacity-50">
              <Camera size={22} className="text-gray-400" />
              <p className="text-xs text-gray-400 text-center">Camera not available in this browser</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file"
        accept="video/mp4,video/mov,video/quicktime,video/webm,video/*"
        className="hidden" onChange={handleFileChange} />

      {/* Errors */}
      {(errMsg || sizeErr) && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-700">{errMsg || sizeErr}</p>
            <button type="button"
              onClick={() => { setErrMsg(''); setSizeErr(''); if (mode !== 'record') setMode('choose') }}
              className="text-xs text-orange-600 font-semibold mt-1.5 hover:underline">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
