import { useState, useRef, useEffect } from 'react'
import { Mic, Square, MicOff, Loader2 } from 'lucide-react'

function getSR(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

interface Props {
  /** Current value of the field — used to append transcript to existing text */
  value: string
  /** Called with the updated string whenever speech is confirmed */
  onChange: (value: string) => void
  /** Optional language code, defaults to en-US */
  lang?: string
}

type State = 'idle' | 'recording' | 'unsupported'

export default function VoiceInput({ value, onChange, lang = 'en-US' }: Props) {
  const [state,    setState]    = useState<State>('idle')
  const [interim,  setInterim]  = useState('')
  const [seconds,  setSeconds]  = useState(0)
  const [error,    setError]    = useState('')
  const [supported, setSupported] = useState(true)

  const recRef   = useRef<SpeechRecognition | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const valueRef = useRef(value)

  useEffect(() => { valueRef.current = value }, [value])

  // Check support after mount
  useEffect(() => {
    if (!getSR()) setSupported(false)
    return () => {
      recRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const start = () => {
    const SR = getSR()
    if (!SR) return
    setError('')
    setInterim('')
    setSeconds(0)

    const rec = new SR()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = lang

    rec.onstart = () => {
      setState('recording')
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    }

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interimChunk = ''
      let finalChunk   = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        const t = r[0].transcript
        r.isFinal ? (finalChunk += t + ' ') : (interimChunk += t)
      }
      if (finalChunk) {
        const current   = valueRef.current
        const separator = current.trim() ? ' ' : ''
        onChange(current.trim() + separator + finalChunk.trim())
        setInterim('')
      } else {
        setInterim(interimChunk)
      }
    }

    rec.onerror = () => {
      setError('Microphone error. Please allow mic access and try again.')
      stop()
    }

    rec.onend = () => {
      setState('idle')
      setInterim('')
      if (timerRef.current) clearInterval(timerRef.current)
    }

    recRef.current = rec
    rec.start()
  }

  const stop = () => {
    recRef.current?.stop()
    setState('idle')
    setInterim('')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Browser doesn't support — show nothing (caller already has the textarea)
  if (!supported) {
    return (
      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
        <MicOff size={13} />
        Voice input not supported in this browser (use Chrome or Edge)
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Control bar */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
        state === 'recording'
          ? 'border-red-400 bg-red-50'
          : 'border-dashed border-gray-300 bg-gray-50 hover:border-orange-300'
      }`}>

        {/* Mic / Stop button */}
        {state === 'recording' ? (
          <button type="button" onClick={stop} aria-label="Stop recording"
            className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shrink-0 shadow transition-all active:scale-95">
            <Square size={14} className="text-white fill-white" />
          </button>
        ) : (
          <button type="button" onClick={start} aria-label="Start voice input"
            className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shrink-0 shadow transition-all active:scale-95">
            <Mic size={16} className="text-white" />
          </button>
        )}

        {/* Status text */}
        <div className="flex-1 min-w-0">
          {state === 'recording' ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                <p className="text-sm font-bold text-red-600">Recording… {formatTime(seconds)}</p>
              </div>
              <p className="text-xs text-red-400">Tap ■ to stop</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {value.trim() ? 'Tap to add more by voice' : 'Tap to describe by voice'}
              </p>
              <p className="text-xs text-gray-400">Your words will appear in the box above</p>
            </div>
          )}
        </div>

        {/* Waveform */}
        {state === 'recording' && (
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}
                className="w-1 bg-red-400 rounded-full animate-pulse"
                style={{ height: `${8 + (i % 4) * 5}px`, animationDelay: `${i * 0.1}s`, animationDuration: `${0.5 + (i % 3) * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Live interim text */}
      {interim && (
        <div className="flex items-start gap-2 bg-white border border-red-200 rounded-xl px-3 py-2">
          <Loader2 size={13} className="text-red-400 animate-spin shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 italic">{interim}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <MicOff size={13} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
