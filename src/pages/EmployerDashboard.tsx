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
  CalendarDays,
  Banknote,
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

  /*
   * Load opportunities posted by this employer.
   */
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

  /*
   * Search workers by:
   * - name
   * - profession
   * - location
   * - skills
   */
  const workers = allWorkers.filter(worker => {
    const q = search.toLowerCase().trim()

    if (!q) {
      return true
    }

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

  /*
   * Add a required skill to the job.
   */
  const addRequiredSkill = () => {
    const skill = skillInput.trim()

    if (!skill) {
      return
    }

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

  /*
   * Remove a required skill.
   */
  const removeRequiredSkill = (
    skillToRemove: string
  ) => {
    setRequiredSkills(prev =>
      prev.filter(
        skill => skill !== skillToRemove
      )
    )
  }

  /*
   * Format money as UGX.
   */
  const formatPay = (amount?: number) => {
    if (
      amount === undefined ||
      amount === null ||
      amount <= 0
    ) {
      return 'Not specified'
    }

    return `UGX ${amount.toLocaleString()}`
  }

  /*
   * Format the deadline for display.
   */
  const formatDeadline = (
    deadline?: string
  ) => {
    if (!deadline) {
      return 'Not specified'
    }

    const date = new Date(
      `${deadline}T00:00:00`
    )

    if (Number.isNaN(date.getTime())) {
      return deadline
    }

    return date.toLocaleDateString(
      'en-GB',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  /*
   * Publish a new opportunity.
   */
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

    /*
     * Required skills validation.
     */
    if (requiredSkills.length === 0) {
      setPostError(
        'Please select at least one required skill.'
      )
      return
    }

    const data = new FormData(
      e.currentTarget
    )

    const title = String(
      data.get('title') || ''
    ).trim()

    const location = String(
      data.get('location') || ''
    ).trim()

    const description = String(
      data.get('description') || ''
    ).trim()

    const payMinRaw = String(
      data.get('payMin') || ''
    ).trim()

    const payMaxRaw = String(
      data.get('payMax') || ''
    ).trim()

    const deadline = String(
      data.get('deadline') || ''
    ).trim()

    const payMin =
      payMinRaw === ''
        ? 0
        : Number(payMinRaw)

    const payMax =
      payMaxRaw === ''
        ? 0
        : Number(payMaxRaw)

    /*
     * Basic form validation.
     */
    if (!title) {
      setPostError(
        'Please enter a job title.'
      )
      return
    }

    if (!location) {
      setPostError(
        'Please enter the job location.'
      )
      return
    }

    if (!description) {
      setPostError(
        'Please describe the opportunity.'
      )
      return
    }

    /*
     * Pay validation.
     */
    if (
      payMinRaw !== '' &&
      (!Number.isFinite(payMin) ||
        payMin < 0)
    ) {
      setPostError(
        'Please enter a valid minimum pay amount.'
      )
      return
    }

    if (
      payMaxRaw !== '' &&
      (!Number.isFinite(payMax) ||
        payMax < 0)
    ) {
      setPostError(
        'Please enter a valid maximum pay amount.'
      )
      return
    }

    if (
      payMin > 0 &&
      payMax > 0 &&
      payMax < payMin
    ) {
      setPostError(
        'Maximum pay cannot be lower than minimum pay.'
      )
      return
    }

    /*
     * Due date validation.
     */
    if (!deadline) {
      setPostError(
        'Please select a due date.'
      )
      return
    }

    const selectedDeadline = new Date(
      `${deadline}T23:59:59`
    )

    if (
      Number.isNaN(
        selectedDeadline.getTime()
      )
    ) {
      setPostError(
        'Please select a valid due date.'
      )
      return
    }

    const today = new Date()
    today.setHours(
      0,
      0,
      0,
      0
    )

    const deadlineDate = new Date(
      `${deadline}T00:00:00`
    )

    if (deadlineDate < today) {
      setPostError(
        'Due date cannot be in the past.'
      )
      return
    }

    try {
      setPosting(true)
      setPostError('')

      /*
       * Send the complete opportunity to
       * the backend.
       */
      const response = await fetch(
        '/api/opportunities',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            employerId: employer.id,
            title,
            location,
            description,
            skills: requiredSkills,
            payMin,
            payMax,
            deadline,
          }),
        }
      )

      const result =
        await response.json()

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            'Failed to publish opportunity.'
        )
      }

      /*
       * Add the new job immediately to
       * the employer dashboard.
       */
      setJobs(prev => [
        result.opportunity,
        ...prev,
      ])

      /*
       * Reset form state.
       */
      setRequiredSkills([])
      setSkillInput('')
      setPostError('')
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

  /*
   * Employer logout.
   */
  const logoutEmployer = () => {
    logout()
    navigate('/employer/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
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
                {employer?.contactName ||
                  ''}
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

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* PAGE INTRO */}
        <div className="mb-8">
          <p className="text-sm font-bold text-blue-600">
            EMPLOYER DASHBOARD
          </p>

          <h2 className="text-3xl font-black text-gray-900 mt-1">
            Find verified talent.
          </h2>

          <p className="text-gray-500 mt-1">
            Search workers by skill, review
            their proof and discover your next
            hire.
          </p>
        </div>

        {/* STATS */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              icon: Users,
              value:
                allWorkers.length,
              label:
                'Available Workers',
            },

            {
              icon: ShieldCheck,
              value:
                allWorkers.filter(
                  worker =>
                    worker.projects.some(
                      project =>
                        project.confirmed
                    )
                ).length,
              label:
                'Verified Talent',
            },

            {
              icon: Briefcase,
              value: jobs.length,
              label:
                'Your Opportunities',
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

        {/* CONTENT */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* WORKERS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row gap-3 justify-between mb-5">
                <div>
                  <h3 className="font-black text-xl">
                    Discover Workers
                  </h3>

                  <p className="text-sm text-gray-500">
                    Search by profession,
                    skill or location.
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
                      setSearch(
                        e.target.value
                      )
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
                        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-xl font-black text-blue-600 shrink-0">
                          {worker.name.charAt(
                            0
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-gray-900">
                              {worker.name}
                            </h4>

                            {confirmed >
                              0 && (
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
                            <MapPin
                              size={11}
                            />

                            {worker.location}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {worker.skills
                              .slice(
                                0,
                                5
                              )
                              .map(
                                (
                                  skill: any,
                                  index: number
                                ) => (
                                  <span
                                    key={
                                      index
                                    }
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

          {/* OPPORTUNITIES */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg">
                    Your Opportunities
                  </h3>

                  <p className="text-xs text-gray-400">
                    Post jobs for verified
                    talent.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPost(
                      prev => !prev
                    )
                    setPostError('')
                  }}
                  className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition"
                  title="Post opportunity"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* POST FORM */}
              {showPost && (
                <form
                  onSubmit={postJob}
                  className="mt-5 space-y-4"
                >
                  {/* JOB TITLE */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">
                      Job Title
                    </label>

                    <input
                      name="title"
                      required
                      className="input"
                      placeholder="e.g. Wedding Photographer"
                    />
                  </div>

                  {/* LOCATION */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">
                      Location
                    </label>

                    <input
                      name="location"
                      required
                      className="input"
                      placeholder="e.g. Kampala, Uganda"
                    />
                  </div>

                  {/* REQUIRED SKILLS */}
                  <div>
                    <label className="text-sm font-bold text-gray-700">
                      Required Skills
                    </label>

                    <p className="text-xs text-gray-400 mt-1 mb-2">
                      Workers need at least
                      70% of these skills
                      to see this
                      opportunity.
                    </p>

                    <div className="flex gap-2">
                      <select
                        className="input flex-1"
                        value={
                          skillInput
                        }
                        onChange={e =>
                          setSkillInput(
                            e.target
                              .value
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
                          .map(
                            skill => (
                              <option
                                key={
                                  skill
                                }
                                value={
                                  skill
                                }
                              >
                                {skill}
                              </option>
                            )
                          )}
                      </select>

                      <button
                        type="button"
                        onClick={
                          addRequiredSkill
                        }
                        disabled={
                          !skillInput
                        }
                        className="px-4 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>

                    {requiredSkills.length >
                      0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {requiredSkills.map(
                          skill => (
                            <span
                              key={
                                skill
                              }
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

                  {/* ESTIMATED PAY */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">
                      Estimated Pay
                    </label>

                    <p className="text-xs text-gray-400 mb-2">
                      Enter the expected
                      payment range in
                      Ugandan Shillings.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Banknote
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          name="payMin"
                          type="number"
                          min="0"
                          step="1000"
                          className="input pl-9"
                          placeholder="Minimum"
                        />
                      </div>

                      <div className="relative">
                        <Banknote
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          name="payMax"
                          type="number"
                          min="0"
                          step="1000"
                          className="input pl-9"
                          placeholder="Maximum"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1">
                      Example: 400000 –
                      600000
                    </p>
                  </div>

                  {/* DUE DATE */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">
                      Due Date
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />

                      <input
                        name="deadline"
                        type="date"
                        required
                        min={
                          new Date()
                            .toISOString()
                            .split(
                              'T'
                            )[0]
                        }
                        className="input pl-10"
                      />
                    </div>

                    <p className="text-[11px] text-gray-400 mt-1">
                      Select the deadline
                      for applications.
                    </p>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">
                      Opportunity Description
                    </label>

                    <textarea
                      name="description"
                      required
                      className="input min-h-24"
                      placeholder="Describe the opportunity..."
                    />
                  </div>

                  {/* ERROR */}
                  {postError && (
                    <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                      <p className="text-sm text-red-600 font-medium">
                        {postError}
                      </p>
                    </div>
                  )}

                  {/* SUBMIT */}
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

              {/* POSTED OPPORTUNITIES */}
              <div className="mt-5 space-y-3">
                {loadingJobs ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Loading your
                    opportunities...
                  </div>
                ) : jobs.length >
                  0 ? (
                  jobs.map(job => (
                    <div
                      key={job.id}
                      className="border border-gray-100 rounded-xl p-3"
                    >
                      {/* TITLE */}
                      <p className="font-bold text-sm">
                        {job.title}
                      </p>

                      {/* LOCATION */}
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin
                          size={11}
                        />

                        {job.location}
                      </p>

                      {/* SKILLS */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills?.map(
                          skill => (
                            <span
                              key={
                                skill
                              }
                              className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold"
                            >
                              {skill}
                            </span>
                          )
                        )}
                      </div>

                      {/* PAY */}
                      {(job.payMin ||
                        job.payMax) ? (
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-600">
                          <Banknote
                            size={13}
                            className="text-green-600"
                          />

                          <span className="font-semibold">
                            {job.payMin &&
                            job.payMax
                              ? `${formatPay(
                                  job.payMin
                                )} – ${formatPay(
                                  job.payMax
                                )}`
                              : formatPay(
                                  job.payMin ||
                                    job.payMax
                                )}
                          </span>
                        </div>
                      ) : null}

                      {/* DEADLINE */}
                      {job.deadline && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                          <CalendarDays
                            size={13}
                            className="text-orange-500"
                          />

                          <span>
                            Due:{' '}
                            <strong>
                              {formatDeadline(
                                job.deadline
                              )}
                            </strong>
                          </span>
                        </div>
                      )}

                      {/* DESCRIPTION */}
                      {job.description && (
                        <p className="text-xs text-gray-500 mt-2">
                          {job.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No opportunities
                    posted yet.
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
