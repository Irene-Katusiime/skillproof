import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Briefcase,
  Loader2,
} from 'lucide-react'

interface Confirmation {
  token: string
  workerId: string
  projectId: string
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  createdAt: string
  respondedAt?: string
}

export default function ConfirmProject() {
  const { token } = useParams<{ token: string }>()

  const [confirmation, setConfirmation] =
    useState<Confirmation | null>(null)

  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadConfirmation = async () => {
      try {
        const response = await fetch(
          `/api/project-confirmation/${token}`
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || 'Invalid confirmation link.'
          )
        }

        setConfirmation(result.confirmation)
      } catch (err: any) {
        setError(err.message || 'Unable to load confirmation.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadConfirmation()
    }
  }, [token])

  const respond = async (response: 'yes' | 'no') => {
    if (!token) return

    setResponding(true)
    setError('')

    try {
      const result = await fetch(
        `/api/project-confirmation/${token}/respond`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ response }),
        }
      )

      const data = await result.json()

      if (!result.ok || !data.success) {
        throw new Error(
          data.error || 'Unable to submit response.'
        )
      }

      setConfirmation(data.confirmation)
    } catch (err: any) {
      setError(err.message || 'Unable to submit response.')
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2
            size={32}
            className="animate-spin text-orange-500 mx-auto"
          />
          <p className="mt-3 text-sm text-gray-500">
            Loading project confirmation...
          </p>
        </div>
      </div>
    )
  }

  if (error || !confirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <XCircle size={32} className="text-red-500" />
          </div>

          <h1 className="text-xl font-black text-gray-900 mt-5">
            Invalid Confirmation Link
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            {error || 'This project confirmation link could not be found.'}
          </p>
        </div>
      </div>
    )
  }

  if (confirmation.status === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle2 size={42} className="text-green-500" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-5">
            Project Confirmed
          </h1>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Thank you. Your confirmation has been recorded.
            The worker's SkillProof project history has been updated.
          </p>

          <div className="mt-6 bg-green-50 rounded-2xl p-4 flex items-center gap-3 text-left">
            <ShieldCheck className="text-green-600 shrink-0" size={22} />
            <div>
              <p className="font-bold text-green-800 text-sm">
                Verified client confirmation
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                This project has been marked as confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (confirmation.status === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <XCircle size={42} className="text-red-500" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-5">
            Response Recorded
          </h1>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Your response has been recorded. The worker's project
            will not be marked as client-confirmed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="bg-orange-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase size={22} />
            </div>

            <div>
              <p className="text-xs text-orange-100 font-medium">
                SkillProof
              </p>
              <h1 className="text-xl font-black">
                Project Confirmation
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">
            Did this worker complete this project?
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            A worker has shared this link with you to verify
            whether the project listed in their SkillProof
            profile was actually completed.
          </p>

          <div className="mt-6 bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
              Project reference
            </p>

            <p className="font-mono text-sm text-gray-700 mt-1 break-all">
              {confirmation.projectId}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => respond('no')}
              disabled={responding}
              className="rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 font-bold py-4 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              <XCircle size={20} className="mx-auto mb-1" />
              No
            </button>

            <button
              onClick={() => respond('yes')}
              disabled={responding}
              className="rounded-2xl bg-green-500 text-white font-bold py-4 hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 size={20} className="mx-auto mb-1" />
              Yes
            </button>
          </div>

          {responding && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Recording your response...
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
            <ShieldCheck size={14} />
            No account required
          </div>
        </div>
      </div>
    </div>
  )
}
