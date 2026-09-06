import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Award,
  Briefcase,
  Search,
  Users,
  ShieldCheck,
  Plus,
  LogOut,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

interface EmployerJob {
  id: string
  employerId: string
  title: string
  location: string
  country?: string
  category?: string
  skills: string[]
  description: string
  payMin?: number
  payMax?: number
  deadline?: string
}

export default function EmployerDashboard() {
  const { allWorkers, employer, logout } = useApp()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [showPost, setShowPost] = useState(false)

  const [jobs, setJobs] = useState<EmployerJob[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  const [postError, setPostError] = useState('')
  const [posting, setPosting] = useState(false)

  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  // ─────────────────────────────────────────────────────────────
  // Available skills
  // Collect skills already used by workers so employers can
  // select the same skill names workers have in their profiles.
  // ─────────────────────────────────────────────────────────────
  const availableSkills = Array.from(
    new Set(
      allWorkers.flatMap(worker =>
        (worker.skills || [])
          .map(skill =>
            typeof skill === 'string'
              ? skill
              : skill.name
          )
          .filter(Boolean)
      )
    )
  ).sort((a, b) => a.localeCompare(b))

  // ─────────────────────────────────────────────────────────────
  // Load employer opportunities
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!employer?.id) {
      setLoadingJobs(false)
      return
    }

    const loadJobs = async () => {
      try {
        setLoadingJobs(true)

        const response = await fetch(
          `/api/opportunities?employerId=${encodeURIComponent(
            employer.id
          )}`
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(
            result.error ||
              'Failed to load opportunities.'
          )
        }

        setJobs(result.opportunities || [])
      } catch (error) {
        console.error(
          'Employer opportunities error:',
          error
        )
      } finally {
        setLoadingJobs(false)
      }
    }

    loadJobs()
  }, [employer?.id])

  // ─────────────────────────────────────────────────────────────
  // Search workers
  // ─────────────────────────────────────────────────────────────
  const workers = allWorkers.filter(worker => {
    const q = search.toLowerCase().trim()

    if (!q) return true

    return [
      worker.name,
      worker.profession,
      worker.location,
      ...(worker.skills || []).map((skill: any) =>
        typeof skill === 'string'
          ? skill
          : skill.name
      ),
    ]
      .join(' ')
      .toLowerCase()
      .includes(q)
  })

  // ─────────────────────────────────────────────────────────────
  // Add required skill
  // ─────────────────────────────────────────────────────────────
  const addRequiredSkill = () => {
    const skill = skillInput.trim()

    if (!skill) return

    const alreadySelected =
      requiredSkills.some(
        existing =>
          existing.toLowerCase() ===
          skill.toLowerCase()
      )

    if (!alreadySelected) {
      setRequiredSkills(prev => [
        ...prev,
        skill,
      ])
    }

    setSkillInput('')
  }

  // ─────────────────────────────────────────────────────────────
  // Remove required skill
  // ─────────────────────────────────────────────────────────────
  const removeRequiredSkill = (
    skillToRemove: string
  ) => {
    setRequiredSkills(prev =>
      prev.filter(
        skill => skill !== skillToRemove
      )
    )
  }

  // ─────────────────────────────────────────────────────────────
  // Publish opportunity
  // ─────────────────────────────────────────────────────────────
  const postJob = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!employer?.id) {
      setPostError(
        'Employer account not found.'
      )
      return
    }

    if (requiredSkills.length === 0) {
      setPostError(
        'Please select at least one required skill.'
      )
      return
    }

    const data = new FormData(e.currentTarget)

    try {
      setPosting(true)
      setPostError('')

      const response = await fetch(
        '/api/opportunities',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            employerId: employer.id,
            title: data.get('title'),
            location: data.get('location'),
            description: data.get('description'),
            skills: requiredSkills,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            'Failed to publish opportunity.'
        )
      }

      setJobs(prev => [
        result.opportunity,
        ...prev,
      ])

      setRequiredSkills([])
      setSkillInput('')
      setShowPost(false)

      e.currentTarget.reset()
    } catch (error: any) {
      console.error(
        'Post opportunity error:',
        error
      )

      setPostError(
        error.message ||
          'Failed to publish opportunity.'
      )
    } finally {
      setPosting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────────────────────
  const logoutEmployer = () => {
    logout()
    navigate('/employer/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ───────────────── HEADER ───────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Award size={21} />
            </div>

            <div>
              <h1 className="font-black text-xl">
                Skill
                <span className="text-orange-500">
                  Proof
                </span>
              </h1>

              <p className="text-xs text-gray-400">
                Employer Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-800">
                {employer?.companyName ||
                  'Employer'}
              </p>

              <p className="text-xs text-gray-400">
                {employer?.contactName || ''}
              </p>
            </div>

            <button
              onClick={logoutEmployer}
              className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ───────────────── MAIN ───────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-bold text-blue-600">
            EMPLOYER DASHBOARD
          </p>

          <h2 className="text-3xl font-black text-gray-900 mt-1">
            Find verified talent.
          </h2>

          <p className="text-gray-500 mt-1">
            Search workers by skill, review their proof
            and discover your next hire.
          </p>
        </div>

        {/* ───────────────── STATS ───────────────── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Users,
              value: allWorkers.length,
              label: 'Available Workers',
            },
            {
              icon: ShieldCheck,
              value: allWorkers.filter(
                worker =>
                  worker.projects.some(
                    project =>
                      project.confirmed
                  )
              ).length,
              label: 'Verified Talent',
            },
            {
              icon: Briefcase,
              value: jobs.length,
              label: 'Your Opportunities',
            },
          ].map(item => {
            const Icon = item.icon

            return (
              <div
                key={item.label}
                className="bg-white rounded-2xl p-5 border border-gray-100"
              >
                <Icon
                  className="text-blue-600 mb-3"
                  size={22}
                />

                <p className="text-2xl font-black">
                  {item.value}
                </p>

                <p className="text-sm text-gray-500">
                  {item.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* ───────────────── CONTENT ───────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ───────────────── WORKERS ───────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row gap-3 justify-between mb-5">
                <div>
                  <h3 className="font-black text-xl">
                    Discover Workers
                  </h3>

                  <p className="text-sm text-gray-500">
                    Search by profession, skill or
                    location.
                  </p>
                </div>

                <div className="relative sm:w-72">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    className="input pl-9"
                    placeholder="e.g. tailoring, mechanic..."
                    value={search}
                    onChange={e =>
                      setSearch(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                {workers.map(worker => {
                  const confirmed =
                    worker.projects.filter(
                      project =>
                        project.confirmed
                    ).length

                  return (
                    <div
                      key={worker.id}
                      className="border border-gray-100 rounded-2xl p-4 hover:border-blue-200 transition"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-xl font-black text-blue-600 shrink-0">
                          {worker.name.charAt(0)}
                        </div>

                        {/* Worker information */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-gray-900">
                              {worker.name}
                            </h4>

                            {confirmed > 0 && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle2
                                  size={11}
                                />

                                Verified
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-500">
                            {worker.profession}
                          </p>

                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin size={11} />

                            {worker.location}
                          </p>

                          {/* Worker skills */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {worker.skills
                              .slice(0, 5)
                              .map(
                                (
                                  skill: any,
                                  index: number
                                ) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                  >
                                    {typeof skill ===
                                    'string'
                                      ? skill
                                      : skill.name}
                                  </span>
                                )
                              )}
                          </div>
                        </div>

                        {/* Profile button */}
                        <button
                          onClick={() =>
                            navigate(
                              `/talent/${worker.id}`
                            )
                          }
                          className="shrink-0 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-sm font-bold hover:bg-blue-100"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  )
                })}

                {!workers.length && (
                  <div className="text-center py-12 text-gray-400">
                    No workers found for "
                    {search}".
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ───────────────── OPPORTUNITIES ───────────────── */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              {/* Opportunity header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg">
                    Your Opportunities
                  </h3>

                  <p className="text-xs text-gray-400">
                    Post jobs for verified talent.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPost(prev => !prev)
                    setPostError('')
                  }}
                  className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition"
                  title="Post opportunity"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* ───────────────── POST FORM ───────────────── */}
              {showPost && (
                <form
                  onSubmit={postJob}
                  className="mt-5 space-y-3"
                >
                  <input
                    name="title"
                    required
                    className="input"
                    placeholder="Job title"
                  />

                  <input
                    name="location"
                    required
                    className="input"
                    placeholder="Location"
                  />

                  {/* Required skills */}
                  <div>
                    <label className="text-sm font-bold text-gray-700">
                      Required Skills
                    </label>

                    <p className="text-xs text-gray-400 mt-1 mb-2">
                      Workers need at least 70% of
                      these skills to see this
                      opportunity.
                    </p>

                    <div className="flex gap-2">
                      <select
                        className="input flex-1"
                        value={skillInput}
                        onChange={e =>
                          setSkillInput(
                            e.target.value
                          )
                        }
                      >
                        <option value="">
                          Select a skill
                        </option>

                        {availableSkills
                          .filter(
                            skill =>
                              !requiredSkills.some(
                                selected =>
                                  selected.toLowerCase() ===
                                  skill.toLowerCase()
                              )
                          )
                          .map(skill => (
                            <option
                              key={skill}
                              value={skill}
                            >
                              {skill}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={addRequiredSkill}
                        disabled={!skillInput}
                        className="px-4 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected skills */}
                    {requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {requiredSkills.map(
                          skill => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold"
                            >
                              {skill}

                              <button
                                type="button"
                                onClick={() =>
                                  removeRequiredSkill(
                                    skill
                                  )
                                }
                                className="text-blue-500 hover:text-red-500 text-base leading-none"
                                aria-label={`Remove ${skill}`}
                              >
                                ×
                              </button>
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <textarea
                    name="description"
                    required
                    className="input min-h-24"
                    placeholder="Describe the opportunity..."
                  />

                  {/* Error */}
                  {postError && (
                    <p className="text-sm text-red-600 font-medium">
                      {postError}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={posting}
                    className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {posting
                      ? 'Publishing...'
                      : 'Publish Opportunity'}
                  </button>
                </form>
              )}

              {/* ───────────────── JOB LIST ───────────────── */}
              <div className="mt-5 space-y-3">
                {loadingJobs ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Loading your opportunities...
                  </div>
                ) : jobs.length > 0 ? (
                  jobs.map(job => (
                    <div
                      key={job.id}
                      className="border border-gray-100 rounded-xl p-3"
                    >
                      <p className="font-bold text-sm">
                        {job.title}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {job.location}
                      </p>

                      {/* Required skills */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills?.map(
                          skill => (
                            <span
                              key={skill}
                              className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        {job.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No opportunities posted yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}