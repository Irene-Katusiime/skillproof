import { useApp } from '../../context/AppContext'
import { UserCheck, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default function HireRequests() {
  const { employerProfile } = useApp()
  if (!employerProfile) return null

  const requests = [...employerProfile.hireRequests].reverse()

  const statusIcon = (s: string) => {
    if (s === 'pending')  return <Clock size={15} className="text-amber-500" />
    if (s === 'accepted') return <CheckCircle2 size={15} className="text-green-500" />
    return <XCircle size={15} className="text-red-500" />
  }

  const statusBadge = (s: string) => {
    if (s === 'pending')  return 'bg-amber-100 text-amber-700'
    if (s === 'accepted') return 'bg-green-100 text-green-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Hire Requests</h1>
        <p className="text-sm text-gray-500 mt-1">{requests.length} request{requests.length !== 1 ? 's' : ''} sent</p>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <div className="text-5xl">📋</div>
          <p className="font-bold text-gray-700">No hire requests yet</p>
          <p className="text-sm text-gray-400">When you send a hire request to a worker, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="card flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <UserCheck size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-800 truncate">{req.jobTitle}</p>
                <p className="text-xs text-gray-500 mt-0.5">To: <span className="font-medium text-gray-700">{req.workerName}</span></p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(req.sentAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {statusIcon(req.status)}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge(req.status)}`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}
