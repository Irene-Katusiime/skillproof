import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, CheckCircle2, AlertCircle, RefreshCw, Send, X, Loader2 } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

export interface FrameCaptureResult {
  /** Three JPEG blobs: [face, idCard, workEnv] */
  blobs: [Blob, Blob, Blob]
  /** Object-URL previews for display */
  previews: [string, string, string]
  /** Response from the backend /api/ingest/frames endpoint */
  serverResponse?: FrameIngestResponse
}

export interface FrameIngestResponse {
  success: boolean
  frameCount: number
  frames: Array<{
    slot: string
    fileSize: number
    mimeType: string
    storedPath: string
    capturedAt: string
  }>
  recordId?: string
  error?: string
}

// ── Step definitions ──────────────────────────────────────────────────────────

interface Step {
  slot: 'face' | 'idCard' | 'workEnv'
  label: string
  prompt: string
  hint: string
  icon: string
}

const STEPS: [Step, Step, Step] = [
  {
    slot: 'face',
    label: 'Your Face',
    prompt: 'Look directly at the camera',
    hint: 'Make sure your face is well-lit and clearly visible. Remove sunglasses or hats.',
    icon: '🙂',
  },
  {
    slot: 'idCard',
    label: 'ID / Work Credential',
    prompt: 'Hold your ID or work credential up to the camera',
    hint: 'National ID, trade certificate, or employer badge. Keep it flat and readable.',
    icon: '🪪',
  },
  {
    slot: 'workEnv',
    label: 'Work Environment',
    prompt: 'Pan to show your active work environment',
    hint: 'Your workshop, tools, site, or workspace. This proves where you operate.',
    icon: '🔧',
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Called when all 3 frames are captured and (optionally) sent */
  onComplete: (result: FrameCaptureResult) => void
  /** Worker / skill-record ID to associate frames with (optional) */
  recordId?: string
  /** Backend base URL — defaults to VITE_API_URL or http://localhost:5000 */
  apiBase?: string
  /** Whether to automatically POST to /api/ingest/frames after capture (default: true) */
  autoSend?: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function captureFrameFromVideo(
  video: HTMLVideoElement,
  quality = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    // Capture at native video resolution, max 1280px wide to keep payload small
    const maxW = 1280
    const scale = Math.min(1, maxW / video.videoWidth)
    canvas.width  = Math.round(video.videoWidth  * scale)
    canvas.height = Math.round(video.videoHeight * scale)

    const ctx = canvas.getContext('2d')
    if (!ctx) return reject(new Error('Canvas 2D context unavailable'))

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('canvas.toBlob returned null')),
      'image/jpeg',
      quality,
    )
  })
}

type CaptureState = 'idle' | 'opening' | 'ready' | 'capturing' | 'review' | 'sending' | 'done' | 'error'

// ── Component ─────────────────────────────────────────────────────────────────

export default function LiveFrameCapture({
  onComplete,
  recordId,
  apiBase,
  autoSend = true,
}: Props) {
  const base = apiBase ?? (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:5000'

  const [captureState, setCaptureState] = useState<CaptureState>('idle')
  const [stepIndex,    setStepIndex]    = useState(0)         // 0-2
  const [blobs,        setBlobs]        = useState<Blob[]>([])
  const [previews,     setPreviews]     = useState<string[]>([])
  const [errMsg,       setErrMsg]       = useState('')
  const [sendResult,   setSendResult]   = useState<FrameIngestResponse | null>(null)
  const [flash,        setFlash]        = useState(false)     // white-flash on capture

  const videoRef    = useRef<HTMLVideoElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const sendingRef  = useRef(false)   // prevents duplicate auto-send calls

  // Revoke object-URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Camera lifecycle ────────────────────────────────────────────────────────

  const openCamera = useCallback(async () => {
    setErrMsg('')
    setCaptureState('opening')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()
      setCaptureState('ready')
      setStepIndex(0)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const lower = msg.toLowerCase()
      if (lower.includes('permission') || lower.includes('denied') || lower.includes('notallowed')) {
        setErrMsg('Camera permission denied. Click the 🔒 in your browser address bar, allow Camera, then try again.')
      } else if (lower.includes('notfound') || lower.includes('no device')) {
        setErrMsg('No camera found. Please connect a camera and try again.')
      } else {
        setErrMsg(`Could not open camera: ${msg}`)
      }
      setCaptureState('error')
    }
  }, [])

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  const reset = useCallback(() => {
    closeCamera()
    previews.forEach(url => URL.revokeObjectURL(url))
    setBlobs([])
    setPreviews([])
    setStepIndex(0)
    setErrMsg('')
    setSendResult(null)
    sendingRef.current = false
    setCaptureState('idle')
  }, [closeCamera, previews])

  // ── Frame capture ───────────────────────────────────────────────────────────

  const handleCapture = useCallback(async () => {
    if (!videoRef.current || captureState !== 'ready') return
    setCaptureState('capturing')
    setFlash(true)
    setTimeout(() => setFlash(false), 200)

    try {
      const blob    = await captureFrameFromVideo(videoRef.current)
      const preview = URL.createObjectURL(blob)

      const nextBlobs    = [...blobs,    blob]
      const nextPreviews = [...previews, preview]
      setBlobs(nextBlobs)
      setPreviews(nextPreviews)

      if (nextBlobs.length < 3) {
        // Advance to next step
        setStepIndex(nextBlobs.length)
        setCaptureState('ready')
      } else {
        // All 3 captured — move to review
        closeCamera()
        setCaptureState('review')
      }
    } catch (err) {
      setErrMsg(`Frame capture failed: ${err instanceof Error ? err.message : String(err)}`)
      setCaptureState('ready')
    }
  }, [blobs, captureState, closeCamera, previews])

  // ── Retake a specific frame ─────────────────────────────────────────────────

  const retakeFrame = useCallback(async (index: number) => {
    // Revoke old preview
    if (previews[index]) URL.revokeObjectURL(previews[index])
    const nextBlobs    = blobs.filter((_, i) => i !== index)
    const nextPreviews = previews.filter((_, i) => i !== index)
    setBlobs(nextBlobs)
    setPreviews(nextPreviews)
    setStepIndex(index)
    setErrMsg('')
    // Re-open camera at the right step
    setCaptureState('opening')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()
      setCaptureState('ready')
    } catch {
      setCaptureState('review')
    }
  }, [blobs, previews])

  // ── Send frames to backend ──────────────────────────────────────────────────

  const sendFramesRef = useRef<() => Promise<void>>(async () => {})

  // ── Send frames to backend ──────────────────────────────────────────────────

  const sendFrames = async () => {
    if (blobs.length !== 3) return
    if (sendingRef.current) return     // already in-flight
    sendingRef.current = true
    setCaptureState('sending')
    setErrMsg('')

    const form = new FormData()
    STEPS.forEach((step, i) => {
      form.append('frames', blobs[i], `${step.slot}.jpg`)
      form.append('slots',  step.slot)
    })
    if (recordId) form.append('recordId', recordId)

    try {
      const res  = await fetch(`${base}/api/ingest/frames`, { method: 'POST', body: form })
      const json = (await res.json()) as FrameIngestResponse

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? `Server error ${res.status}`)
      }

      setSendResult(json)
      setCaptureState('done')
      onComplete({
        blobs:          blobs as [Blob, Blob, Blob],
        previews:       previews as [string, string, string],
        serverResponse: json,
      })
    } catch (err) {
      // Keep sendingRef.current = true so the auto-send effect cannot loop.
      // The user must explicitly click "Redo verification" to reset and retry.
      setErrMsg(`Upload failed: ${err instanceof Error ? err.message : String(err)}`)
      setCaptureState('error')
    }
  }

  // Keep the ref pointing at the latest sendFrames closure
  sendFramesRef.current = sendFrames

  // ── Auto-send once all 3 blobs land in review ─────────────────────────────

  useEffect(() => {
    if (captureState === 'review' && blobs.length === 3 && autoSend && !sendingRef.current) {
      sendFramesRef.current()
    }
    // captureState is the only trigger we want — sendFramesRef is a stable ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captureState])

  // ── Render ────────────────────────────────────────────────────────────────

  const currentStep = STEPS[stepIndex] ?? STEPS[0]
  const isLive      = captureState === 'ready' || captureState === 'capturing' || captureState === 'opening'

  return (
    <div className="space-y-4">

      {/* ── Hidden canvas used by captureFrameFromVideo ── */}
      {/* canvas is created dynamically — no DOM element needed */}

      {/* ── Camera viewport (always in DOM so ref is always valid) ── */}
      <div className={`relative rounded-2xl overflow-hidden bg-black aspect-video ${isLive ? 'block' : 'hidden'}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {/* White flash overlay on capture — fades out via opacity transition */}
        <div
          className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-200"
          style={{ opacity: flash ? 0.85 : 0 }}
        />

        {/* Step badge */}
        {captureState === 'ready' && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <span>{currentStep.icon}</span>
            <span>Step {stepIndex + 1} / 3 — {currentStep.label}</span>
          </div>
        )}

        {/* Loading badge */}
        {captureState === 'opening' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur px-5 py-3 rounded-2xl flex items-center gap-3">
              <Loader2 size={18} className="text-white animate-spin" />
              <span className="text-white text-sm font-semibold">Opening camera…</span>
            </div>
          </div>
        )}

        {/* Captured thumbnails strip */}
        {blobs.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {previews.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={STEPS[i].label}
                className="w-14 h-10 object-cover rounded-lg border-2 border-green-400 shadow-md"
              />
            ))}
          </div>
        )}

        {/* Close camera button */}
        {isLive && captureState !== 'opening' && (
          <button
            type="button"
            onClick={reset}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center"
            aria-label="Cancel"
          >
            <X size={14} className="text-white" />
          </button>
        )}
      </div>

      {/* ── Idle state: start button ── */}
      {captureState === 'idle' && (
        <button
          type="button"
          onClick={openCamera}
          className="w-full flex flex-col items-center gap-2 px-4 py-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-all group"
        >
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <Camera size={24} className="text-orange-500 group-hover:text-white transition-colors" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">Start Live Session Verification</p>
            <p className="text-xs text-gray-500 mt-0.5">3 quick snapshots — face, ID, and workspace</p>
          </div>
        </button>
      )}

      {/* ── Guided prompt (shown when camera is live) ── */}
      {captureState === 'ready' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl leading-none">{currentStep.icon}</span>
            <div>
              <p className="text-sm font-bold text-blue-800">{currentStep.prompt}</p>
              <p className="text-xs text-blue-600 mt-0.5">{currentStep.hint}</p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < blobs.length
                    ? 'bg-green-500'
                    : i === stepIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Capture button */}
          <button
            type="button"
            onClick={handleCapture}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Camera size={16} />
            Capture Frame {stepIndex + 1} of 3
          </button>
        </div>
      )}

      {/* ── Sending indicator ── */}
      {captureState === 'sending' && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
          <Loader2 size={18} className="text-orange-500 animate-spin shrink-0" />
          <div>
            <p className="text-sm font-bold text-orange-700">Uploading frames…</p>
            <p className="text-xs text-orange-500">Sending 3 compressed snapshots securely</p>
          </div>
        </div>
      )}

      {/* ── Review / manual send (autoSend=false) ── */}
      {captureState === 'review' && blobs.length === 3 && !autoSend && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={STEPS[i].label} className="w-full aspect-video object-cover rounded-xl border border-gray-200" />
                <div className="absolute bottom-1 left-1 right-1 text-center">
                  <span className="bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {STEPS[i].label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => retakeFrame(i)}
                  title="Retake"
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RefreshCw size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => sendFramesRef.current()}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Send size={15} />
            Send Verification Frames
          </button>
        </div>
      )}

      {/* ── Done ── */}
      {captureState === 'done' && sendResult && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">Verification frames uploaded</p>
              <p className="text-xs text-green-600">{sendResult.frameCount} frames securely stored</p>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt={STEPS[i].label} className="w-full aspect-video object-cover rounded-xl border-2 border-green-300" />
                <div className="absolute bottom-1 left-1 right-1 text-center">
                  <span className="bg-green-700/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {STEPS[i].icon} {STEPS[i].label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={reset}
            className="text-xs text-gray-400 hover:text-gray-600 underline w-full text-center"
          >
            Redo verification
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {errMsg && captureState !== 'sending' && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-700 mb-0.5">Something went wrong</p>
            <p className="text-xs text-red-600 break-words">{errMsg}</p>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-orange-600 font-semibold mt-1.5 hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
