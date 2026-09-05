import { useState, useRef } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'

interface Props {
  src: string
  label?: string
}

export default function AudioPlayer({ src, label = 'Audio description' }: Props) {
  const [playing,  setPlaying]  = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return
        const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100
        setProgress(pct)
      }
      audioRef.current.onended = () => { setPlaying(false); setProgress(0) }
    }

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  return (
    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
      <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
        <Volume2 size={14} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-blue-700 truncate">{label}</p>
        <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 ${
          playing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        aria-label={playing ? 'Pause' : 'Play audio description'}
      >
        {playing
          ? <Pause size={13} className="text-white fill-white" />
          : <Play  size={13} className="text-white fill-white ml-0.5" />
        }
      </button>
    </div>
  )
}
