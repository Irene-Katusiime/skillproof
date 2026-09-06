import { useState } from 'react'
import { Copy, Check, Link as LinkIcon, Briefcase, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/PageHeader'

export default function Endorse() {
  const { profile } = useApp()

  const [selectedProject, setSelectedProject] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const projects = profile.projects.filter(
    project => !project.confirmed
  )

  const generateLink = async () => {
    if (!selectedProject) return

    setLoading(true)
    setError('')
    setGeneratedLink('')
    setCopied(false)

    try {
      const response = await fetch(
        `/api/projects/${selectedProject}/confirmation-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workerId: profile.id,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || 'Could not generate confirmation link.'
        )
      }

      const link =
        `${window.location.origin}/confirm-project/${result.token}`

      setGeneratedLink(link)
    } catch (err: any) {
      setError(
        err.message || 'Could not generate confirmation link.'
      )
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (!generatedLink) return

    await navigator.clipboard.writeText(generatedLink)
    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <PageHeader
        title="Confirm Completed Projects"
        subtitle="Ask former clients to verify your completed work."
      />

      <div className="card max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
            <ShieldCheck size={23} className="text-orange-500" />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">
              Client Project Confirmation
            </h2>

            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Select a completed project and generate a secure link.
              Send the link to your former client. They can confirm
              the project without creating a SkillProof account.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="label">
            Select completed project
          </label>

          {projects.length === 0 ? (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
              <Check size={28} className="text-green-500 mx-auto" />

              <p className="font-bold text-green-800 mt-2">
                All your projects are confirmed
              </p>

              <p className="text-xs text-green-700 mt-1">
                Add another project if you have more completed work.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                    selectedProject === project.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-100 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <Briefcase
                        size={18}
                        className="text-orange-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800">
                        {project.title}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {project.clientName}
                      </p>

                      <p className="text-[11px] text-gray-400 mt-1">
                        {new Date(
                          project.completedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    {selectedProject === project.id && (
                      <Check
                        size={20}
                        className="text-orange-500 shrink-0"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {projects.length > 0 && (
          <button
            onClick={generateLink}
            disabled={!selectedProject || loading}
            className="btn-primary w-full mt-5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LinkIcon size={17} />

            {loading
              ? 'Generating...'
              : 'Generate Confirmation Link'}
          </button>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {generatedLink && (
          <div className="mt-5 rounded-2xl bg-green-50 border border-green-200 p-4">
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-600" />

              <p className="font-bold text-sm text-green-800">
                Confirmation link created
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={generatedLink}
                readOnly
                className="input flex-1 text-xs"
              />

              <button
                onClick={copyLink}
                className="px-4 rounded-xl bg-white border border-green-200 text-green-700 font-semibold text-xs flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-green-700 mt-3">
              Send this link to the former client through WhatsApp,
              SMS, email, or any messaging app.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
