import { useState, useRef, useEffect } from 'react'
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface Props {
  onSave: (audioUrl: string | null) => void
  savedUrl?: string
}

type RecState = 'idle' | 'recording' | 'stopped' | 'error'

export default function AudioRecorder({ onSave, savedUrl }: Props) {
  const [recState, setRecState] = useState<RecState>(
    savedUrl ? 'stopped' : 'idle'
  )
  const [audioUrl, setAudioUrl] = useState<string | null>(savedUrl || null)
  const [seconds, setSeconds] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      stopTimer()

      if (mediaRef.current && mediaRef.current.state !== 'inactive') {
        mediaRef.current.stop()
      }

      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const startRecording = async () => {
    setErrMsg('')

    try {
      // Check the browser only when the user actually tries to record.
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        throw new Error(
          'Firefox cannot access the microphone API on this page.'
        )
      }

      if (typeof MediaRecorder === 'undefined') {
        throw new Error(
          'This browser does not provide the MediaRecorder API.'
        )
      }

      console.log('SkillProof: requesting microphone access...')

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      console.log('SkillProof: microphone access granted.')

      streamRef.current = stream
      chunksRef.current = []

      const mimeTypes = [
        'audio/ogg;codecs=opus',
        'audio/webm;codecs=opus',
        'audio/ogg',
        'audio/webm',
        'audio/mp4',
      ]

      const supportedMimeType = mimeTypes.find(type =>
        MediaRecorder.isTypeSupported(type)
      )

      console.log('SkillProof: selected audio type:', supportedMimeType)

      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream)

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onerror = event => {
        console.error('SkillProof MediaRecorder error:', event)
        setErrMsg('The browser encountered an error while recording.')
        setRecState('error')
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/ogg',
        })

        console.log('SkillProof: recording created:', {
          type: blob.type,
          size: blob.size,
        })

        const reader = new FileReader()

        reader.onloadend = () => {
          const dataUrl = reader.result as string

          setAudioUrl(dataUrl)
          onSave(dataUrl)
          setRecState('stopped')
        }

        reader.readAsDataURL(blob)

        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null

        stopTimer()
      }

      recorder.start(250)

      mediaRef.current = recorder

      setSeconds(0)
      setRecState('recording')

      timerRef.current = setInterval(() => {
        setSeconds(value => value + 1)
      }, 1000)
    } catch (error) {
      console.error('SkillProof microphone error:', error)

      let message = 'Could not access your microphone.'

      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
          case 'SecurityError':
            message =
              'Microphone permission was denied. Allow microphone access for localhost in Firefox and try again.'
            break

          case 'NotFoundError':
            message =
              'Firefox could not find a microphone. Check that your computer has a microphone available.'
            break

          case 'NotReadableError':
            message =
              'The microphone is already being used by another application.'
            break

          case 'OverconstrainedError':
            message =
              'Firefox could not find a microphone matching the requested settings.'
            break

          case 'AbortError':
            message = 'Firefox stopped the microphone request. Please try again.'
            break

          default:
            message = `${error.name}: ${error.message}`
        }
      } else if (error instanceof Error) {
        message = error.message
      }

      setErrMsg(message)
      setRecState('error')
    }
  }

  const stopRecording = () => {
    if (
      mediaRef.current &&
      mediaRef.current.state !== 'inactive'
    ) {
      mediaRef.current.stop()
    }

    stopTimer()
  }

  const clearRecording = () => {
    setAudioUrl(null)
    setRecState('idle')
    setSeconds(0)
    setPlaying(false)
    setErrMsg('')

    onSave(null)

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }

  const togglePlay = () => {
    if (!audioUrl) return

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.src = audioUrl

      audioRef.current.onended = () => {
        setPlaying(false)
      }

      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    }
  }

  return (
    <div className="mt-2 space-y-2">

      {recState !== 'stopped' && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
            recState === 'recording'
              ? 'border-red-400 bg-red-50'
              : 'border-dashed border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50'
          }`}
        >

          {recState === 'recording' ? (
            <button
              type="button"
              onClick={stopRecording}
              className="w-11 h-11 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95"
              aria-label="Stop recording"
            >
              <Square
                size={15}
                className="text-white fill-white"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="w-11 h-11 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95"
              aria-label="Start recording"
            >
              <Mic size={18} className="text-white" />
            </button>
          )}

          <div className="flex-1 min-w-0">

            {recState === 'recording' ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />

                  <p className="text-sm font-bold text-red-600">
                    Recording — {formatTime(seconds)}
                  </p>
                </div>

                <p className="text-xs text-red-400 mt-0.5">
                  Tap ■ when done speaking
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Record audio description
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  Tap 🎤 and describe your project out loud
                </p>
              </div>
            )}

          </div>

          {recState === 'recording' && (
            <div className="flex items-center gap-0.5 shrink-0">
              {[14, 20, 12, 24, 16, 10, 22, 18].map(
                (height, index) => (
                  <div
                    key={index}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: `${height}px`,
                      animationDelay: `${index * 0.1}s`,
                      animationDuration: `${0.5 + (index % 3) * 0.2}s`,
                    }}
                  />
                )
              )}
            </div>
          )}

        </div>
      )}

      {recState === 'stopped' && audioUrl && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-300 bg-green-50">

          <div className="flex items-center gap-2 shrink-0">
            <CheckCircle2
              size={16}
              className="text-green-600"
            />

            <span className="text-xs font-bold text-green-700">
              Recorded
            </span>
          </div>

          <div className="flex-1 flex items-center gap-0.5 h-6 overflow-hidden">
            {Array.from({ length: 32 }).map((_, index) => (
              <div
                key={index}
                className="w-0.5 bg-green-400 rounded-full"
                style={{
                  height: `${4 + Math.abs(Math.sin(index * 0.8)) * 16}px`,
                  opacity: playing ? 1 : 0.5,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 ${
              playing
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <Pause
                size={14}
                className="text-white fill-white"
              />
            ) : (
              <Play
                size={14}
                className="text-white fill-white ml-0.5"
              />
            )}
          </button>

          <button
            type="button"
            onClick={clearRecording}
            className="w-9 h-9 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors group"
            aria-label="Delete recording"
          >
            <Trash2
              size={14}
              className="text-gray-500 group-hover:text-red-500"
            />
          </button>

        </div>
      )}

      {recState === 'error' && errMsg && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">

          <AlertCircle
            size={15}
            className="text-red-500 shrink-0 mt-0.5"
          />

          <div>
            <p className="text-xs font-semibold text-red-700 mb-0.5">
              Recording failed
            </p>

            <p className="text-xs text-red-600">
              {errMsg}
            </p>

            <button
              type="button"
              onClick={() => {
                setRecState('idle')
                setErrMsg('')
              }}
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