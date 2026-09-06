import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Lightbulb,
  Mic,
  MicOff,
  Square,
  Loader2,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import OnboardingShell from './OnboardingShell'

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

  const [story, setStory] = useState(profile.bio || '')
  const [activePrompt, setActivePrompt] = useState<number | null>(null)
  const [recordState, setRecordState] =
    useState<RecordingState>('idle')
  const [recordError, setRecordError] = useState('')
  const [recordSeconds, setRecordSeconds] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Check MediaRecorder support ────────────────────────────────────────────
  // ── Check MediaRecorder support ────────────────────────────────────────────
  useEffect(() => {
    // Let Firefox attempt recording and handle errors dynamically via permissions
    setRecordState('idle')
  }, [])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      mediaRecorderRef.current?.stop()

      streamRef.current?.getTracks().forEach(track => {
        track.stop()
      })
    }
  }, [])

  // ── Upload recording to backend ────────────────────────────────────────────
  const uploadRecording = async (audioBlob: Blob) => {
    setRecordState('processing')
    setRecordError('')

    try {
      const formData = new FormData()

      const extension = audioBlob.type.includes('ogg')
        ? 'ogg'
        : audioBlob.type.includes('mp4')
          ? 'mp4'
          : 'webm'

      formData.append(
        'audio',
        audioBlob,
        `story.${extension}`,
      )

      // Change this to 'eng' if you want English-only recordings.
      // 'lug' allows the backend to translate Luganda → English.
      formData.append('sourceLang', 'lug')

      const response = await fetch('/api/ingest/voice', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Voice processing failed.',
        )
      }

      console.log('Voice ingestion result:', result)

      // Prefer the translated English transcript.
      // Fall back to raw transcript if translation is unavailable.
      const transcript =
        result.translatedTranscript ||
        result.rawTranscript ||
        ''

      if (!transcript.trim()) {
        throw new Error(
          'No speech was detected. Please try recording again.',
        )
      }

      // Add the transcript to the existing story.
      setStory(current => {
        const currentText = current.trim()

        if (!currentText) {
          return transcript.trim()
        }

        return `${currentText} ${transcript.trim()}`
      })

      // Save the AI extraction so the next onboarding step can use it.
      sessionStorage.setItem(
        'sp_voice_extraction',
        JSON.stringify(result.data || {}),
      )

      sessionStorage.setItem(
        'sp_voice_transcript',
        transcript.trim(),
      )
    } catch (error: any) {
      console.error('Voice processing error:', error)

      setRecordError(
        error.message ||
          'Could not process your recording. Please try again.',
      )
    } finally {
      setRecordState('idle')
    }
  }

  // ── Start recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError(
        'Microphone recording is not supported in this browser.',
      )
      return
    }

    try {
      setRecordError('')
      setRecordSeconds(0)

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        })

      streamRef.current = stream

      chunksRef.current = []

      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
      ]

      const mimeType =
        supportedTypes.find(type =>
          MediaRecorder.isTypeSupported(type),
        ) || ''

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstart = () => {
        setRecordState('recording')

        timerRef.current = setInterval(() => {
          setRecordSeconds(seconds => seconds + 1)
        }, 1000)
      }

      recorder.onerror = () => {
        setRecordError(
          'An error occurred while recording. Please try again.',
        )

        stopRecording()
      }

      recorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        const actualMimeType =
          recorder.mimeType || mimeType || 'audio/webm'

        const audioBlob = new Blob(chunksRef.current, {
          type: actualMimeType,
        })

        streamRef.current?.getTracks().forEach(track => {
          track.stop()
        })

        streamRef.current = null
        mediaRecorderRef.current = null
        chunksRef.current = []

        if (audioBlob.size === 0) {
          setRecordState('idle')
          setRecordError(
            'No audio was recorded. Please try again.',
          )
          return
        }

        await uploadRecording(audioBlob)
      }

      recorder.start()
    } catch (error: any) {
      console.error('Microphone access error:', error)

      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        setRecordError(
          'Microphone permission denied. Please allow microphone access and try again.',
        )
      } else if (error.name === 'NotFoundError') {
        setRecordError(
          'No microphone was found. Please check your microphone.',
        )
      } else {
        setRecordError(
          'Could not access your microphone. Please try again.',
        )
      }

      setRecordState('idle')
    }
  }

  // ── Stop recording ─────────────────────────────────────────────────────────
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
      return
    }

    streamRef.current?.getTracks().forEach(track => {
      track.stop()
    })

    streamRef.current = null

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setRecordState('idle')
  }

  // ── Prompt helper ──────────────────────────────────────────────────────────
  const appendPrompt = (i: number) => {
    setActivePrompt(i)

    setStory(current => {
      const prefix = current.trim()
        ? current.trim() + ' '
        : ''

      return prefix + PROMPTS[i] + ' '
    })
  }

  // ── Continue ───────────────────────────────────────────────────────────────
  const handleContinue = () => {
    if (recordState === 'recording') {
      stopRecording()
      return
    }

    if (recordState === 'processing') {
      return
    }

    sessionStorage.setItem(
      'sp_onboarding_story',
      story,
    )

    navigate('/onboarding/ai-skills')
  }

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(
      seconds % 60,
    ).padStart(2, '0')}`

  return (
    <OnboardingShell
      step={1}
      title="Tell Your Story"
      subtitle="Describe your work in your own words — type it or speak and we'll write it for you."
    >
      <div className="space-y-5">

        {/* ── Voice recorder ── */}
        <div>
          <label className="label">
            Record your story (optional)
          </label>

          {recordState === 'unsupported' ? (
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <MicOff
                size={16}
                className="text-gray-400 shrink-0"
              />

              <p className="text-xs text-gray-500">
                Voice recording isn't supported in this
                browser. Type your story below instead.
              </p>
            </div>
          ) : (
            <div
              className={`rounded-2xl border-2 p-4 transition-all ${
                recordState === 'recording'
                  ? 'border-red-400 bg-red-50'
                  : recordState === 'processing'
                    ? 'border-violet-300 bg-violet-50'
                    : 'border-dashed border-gray-300 bg-gray-50 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  {recordState === 'recording' ? (
                    <button
                      onClick={stopRecording}
                      className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                      aria-label="Stop recording"
                    >
                      <Square
                        size={18}
                        className="text-white fill-white"
                      />
                    </button>
                  ) : recordState === 'processing' ? (
                    <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                      <Loader2
                        size={20}
                        className="text-white animate-spin"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                      aria-label="Start recording"
                    >
                      <Mic
                        size={20}
                        className="text-white"
                      />
                    </button>
                  )}

                  <div>
                    {recordState === 'recording' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />

                          <p className="text-sm font-bold text-red-600">
                            Recording… {formatTime(recordSeconds)}
                          </p>
                        </div>

                        <p className="text-xs text-red-400 mt-0.5">
                          Tap the square to stop
                        </p>
                      </>
                    ) : recordState === 'processing' ? (
                      <>
                        <p className="text-sm font-bold text-violet-700">
                          Processing your story…
                        </p>

                        <p className="text-xs text-violet-500 mt-0.5">
                          Transcribing and identifying your skills
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-gray-700">
                          Tap to speak your story
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          Your recording will be transcribed by AI
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {recordState === 'idle' &&
                  story.length > 0 && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <Sparkles size={11} />
                      Story captured
                    </span>
                  )}
              </div>

              {/* Sound wave */}
              {recordState === 'recording' && (
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: 12 }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-400 rounded-full animate-pulse"
                        style={{
                          height: `${
                            10 + (i % 4) * 6
                          }px`,
                          animationDelay: `${
                            i * 0.08
                          }s`,
                          animationDuration: `${
                            0.6 + (i % 3) * 0.2
                          }s`,
                        }}
                      />
                    ),
                  )}
                </div>
              )}

              {/* Processing indicator */}
              {recordState === 'processing' && (
                <div className="mt-4">
                  <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-violet-500 rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mic error */}
          {recordError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-2">
              <MicOff
                size={15}
                className="text-red-500 shrink-0 mt-0.5"
              />

              <p className="text-xs text-red-700">
                {recordError}
              </p>
            </div>
          )}
        </div>

        {/* ── Story textarea ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">
              Your work story *
            </label>

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
            placeholder={`Example:
"I have been a tailor for 8 years. I make wedding dresses, school uniforms, and African print outfits. My clients love how I pay attention to every detail and always deliver on time..."`}
            value={story}
            onChange={e => setStory(e.target.value)}
          />

          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-gray-400">
              {story.length} characters
            </p>

            {story.length >= 80 && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                <Sparkles size={11} />
                Great detail!
              </span>
            )}
          </div>
        </div>

        {/* ── Prompt suggestions ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb
              size={14}
              className="text-orange-400"
            />

            <p className="text-xs font-semibold text-gray-500">
              Need inspiration? Click a prompt:
            </p>
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
          <Sparkles
            size={18}
            className="text-violet-500 shrink-0 mt-0.5"
          />

          <div>
            <p className="text-sm font-bold text-violet-800">
              AI will read your story next
            </p>

            <p className="text-xs text-violet-600 mt-0.5">
              Your voice is transcribed, translated when
              needed, and analyzed to identify your real
              skills.
            </p>
          </div>
        </div>

        {/* ── Continue ── */}
        <button
          onClick={handleContinue}
          disabled={
            story.trim().length < 30 ||
            recordState === 'processing'
          }
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {recordState === 'processing' ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Processing voice…
            </>
          ) : (
            <>
              Identify My Skills with AI
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </OnboardingShell>
  )
}