import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Plus,
  Star,
  Sparkles,
  Camera,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import OnboardingShell from './OnboardingShell'

interface QuizQuestion {
  question: string
  options: string[]
  correct: number
}

interface VoiceExtraction {
  primaryTrade?: string
  specificSkills?: string[] | string
}

/*
 * ---------------------------------------------------------
 * AI TRADE → PROJECT CATEGORY
 * ---------------------------------------------------------
 *
 * The project category is automatically selected from the
 * AI-identified trade and skills.
 */
const normalizeCategory = (
  trade: string,
  skills: string[]
): string => {
  const text = [trade, ...skills]
    .join(' ')
    .toLowerCase()

  // Photography
  if (
    text.includes('photograph') ||
    text.includes('photographer') ||
    text.includes('camera') ||
    text.includes('photo editing') ||
    text.includes('photoshoot') ||
    text.includes('photo shoot') ||
    text.includes('videograph') ||
    text.includes('video editing')
  ) {
    return 'Photography'
  }

  // Construction
  if (
    text.includes('construction') ||
    text.includes('builder') ||
    text.includes('building') ||
    text.includes('masonry') ||
    text.includes('brick') ||
    text.includes('concrete') ||
    text.includes('plastering')
  ) {
    return 'Construction'
  }

  // Plumbing
  if (
    text.includes('plumb') ||
    text.includes('pipe fitting') ||
    text.includes('pipe') ||
    text.includes('water installation')
  ) {
    return 'Plumbing'
  }

  // Electrical
  if (
    text.includes('electric') ||
    text.includes('electrical') ||
    text.includes('wiring') ||
    text.includes('electrician')
  ) {
    return 'Electrical'
  }

  // Carpentry
  if (
    text.includes('carpenter') ||
    text.includes('carpentry') ||
    text.includes('woodwork') ||
    text.includes('wood working') ||
    text.includes('furniture making')
  ) {
    return 'Carpentry'
  }

  // Mechanics
  if (
    text.includes('mechanic') ||
    text.includes('automotive') ||
    text.includes('vehicle repair') ||
    text.includes('car repair') ||
    text.includes('motorcycle repair')
  ) {
    return 'Mechanics'
  }

  // Beauty & Hair
  if (
    text.includes('hairdresser') ||
    text.includes('hair stylist') ||
    text.includes('hairstylist') ||
    text.includes('barber') ||
    text.includes('beauty') ||
    text.includes('salon') ||
    text.includes('hair')
  ) {
    return 'Beauty & Hair'
  }

  // Fashion & Tailoring
  if (
    text.includes('tailor') ||
    text.includes('tailoring') ||
    text.includes('sewing') ||
    text.includes('dressmaking') ||
    text.includes('fashion') ||
    text.includes('garment') ||
    text.includes('clothing')
  ) {
    return 'Fashion & Tailoring'
  }

  // Farming
  if (
    text.includes('farmer') ||
    text.includes('farming') ||
    text.includes('agriculture') ||
    text.includes('crop') ||
    text.includes('livestock') ||
    text.includes('poultry')
  ) {
    return 'Farming & Agriculture'
  }

  // Electronics
  if (
    text.includes('electronics') ||
    text.includes('electronic repair') ||
    text.includes('phone repair') ||
    text.includes('computer repair') ||
    text.includes('device repair')
  ) {
    return 'Electronics Repair'
  }

  /*
   * If the AI trade does not match a predefined category,
   * use the actual AI trade instead of assigning something
   * unrelated.
   */
  return trade.trim() || 'General Skilled Work'
}

export default function ProveSkills() {
  const { addProject } = useApp()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'project' | 'quiz'>('project')
  const [projectAdded, setProjectAdded] = useState(false)

  // ---------------------------------------------------------
  // AI QUIZ
  // ---------------------------------------------------------

  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState('')
  const [quizStarted, setQuizStarted] = useState(false)

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  // ---------------------------------------------------------
  // AI TRADE + SKILLS
  // ---------------------------------------------------------

  const [trade, setTrade] = useState('')
  const [skills, setSkills] = useState<string[]>([])

  // ---------------------------------------------------------
  // PROJECT FORM
  // ---------------------------------------------------------

  const [form, setForm] = useState({
    title: '',
    category: '',
    clientName: '',
    completedAt: '',
    description: '',
    value: '',
  })

  /*
   * ---------------------------------------------------------
   * LOAD AI IDENTIFIED TRADE + SKILLS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const stored = sessionStorage.getItem(
      'sp_voice_extraction'
    )

    if (!stored) {
      console.warn(
        'No AI voice extraction found.'
      )
      return
    }

    try {
      const extraction: VoiceExtraction =
        JSON.parse(stored)

      const extractedTrade =
        extraction.primaryTrade?.trim() || ''

      let extractedSkills: string[] = []

      if (
        Array.isArray(
          extraction.specificSkills
        )
      ) {
        extractedSkills =
          extraction.specificSkills
            .map(skill =>
              String(skill).trim()
            )
            .filter(Boolean)
      } else if (
        typeof extraction.specificSkills ===
        'string'
      ) {
        extractedSkills =
          extraction.specificSkills
            .split(',')
            .map(skill =>
              skill.trim()
            )
            .filter(Boolean)
      }

      setTrade(extractedTrade)
      setSkills(extractedSkills)

      const aiCategory =
        normalizeCategory(
          extractedTrade,
          extractedSkills
        )

      setForm(previous => ({
        ...previous,
        category: aiCategory,
      }))

      console.log(
        'Prove Skills AI context:',
        {
          primaryTrade:
            extractedTrade,
          skills:
            extractedSkills,
          category:
            aiCategory,
        }
      )
    } catch (error) {
      console.error(
        'Could not read AI extraction:',
        error
      )
    }
  }, [])

  /*
   * ---------------------------------------------------------
   * DYNAMIC PROJECT CONTENT
   * ---------------------------------------------------------
   */

  const normalizedTrade =
    trade.toLowerCase()

  const isPhotography =
    normalizedTrade.includes(
      'photograph'
    ) ||
    normalizedTrade.includes('photo') ||
    normalizedTrade.includes(
      'camera'
    ) ||
    skills.some(skill =>
      skill
        .toLowerCase()
        .includes('photograph')
    ) ||
    skills.some(skill =>
      skill
        .toLowerCase()
        .includes('camera')
    )

  const projectTitlePlaceholder =
    isPhotography
      ? 'e.g. Wedding photoshoot for Grace'
      : trade
        ? `e.g. ${trade} project for a client`
        : 'e.g. Project completed for a client'

  const clientPlaceholder =
    isPhotography
      ? 'e.g. Grace'
      : 'e.g. Client name'

  const descriptionPlaceholder =
    isPhotography
      ? 'Describe the photoshoot, event, camera work, editing, lighting, or other photography services you provided...'
      : trade
        ? `Describe the ${trade.toLowerCase()} work you completed for this client...`
        : 'Describe the work you completed for this client...'

  /*
   * ---------------------------------------------------------
   * AI QUIZ GENERATION
   * ---------------------------------------------------------
   */

  const generateQuiz = async () => {
    if (
      !trade &&
      skills.length === 0
    ) {
      setQuizError(
        'We could not find your trade or skills. Please go back and complete your skill identification first.'
      )
      return
    }

    setQuizLoading(true)
    setQuizError('')
    setQuiz([])
    setAnswers([])
    setCurrent(0)
    setSelected(null)
    setQuizStarted(false)

    try {
      const response =
        await fetch(
          '/api/quiz/generate',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              primaryTrade:
                trade,
              skills,
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
            'Quiz generation failed.'
        )
      }

      if (
        !Array.isArray(
          result.questions
        ) ||
        result.questions.length !== 3
      ) {
        throw new Error(
          'The AI returned an invalid quiz.'
        )
      }

      setQuiz(
        result.questions
      )

      setQuizStarted(true)

      console.log(
        'Generated AI quiz:',
        result.questions
      )
    } catch (error: any) {
      console.error(
        'Quiz generation error:',
        error
      )

      setQuizError(
        error.message ||
          'Could not generate your skill quiz.'
      )
    } finally {
      setQuizLoading(false)
    }
  }

  /*
   * ---------------------------------------------------------
   * PROJECT
   * ---------------------------------------------------------
   */

  const set = (
    key: string,
    value: string
  ) => {
    setForm(previous => ({
      ...previous,
      [key]: value,
    }))
  }

  const projectValid =
    Boolean(
      form.title &&
      form.clientName &&
      form.completedAt &&
      form.category &&
      form.description
    )

  const handleAddProject = () => {
    addProject(form)

    setProjectAdded(true)

    console.log(
      'Project added:',
      {
        ...form,
        trade,
        skills,
      }
    )
  }

  /*
   * ---------------------------------------------------------
   * QUIZ ANSWERS
   * ---------------------------------------------------------
   */

  const handleAnswer = (
    index: number
  ) => {
    if (
      selected !== null ||
      !quiz[current]
    ) {
      return
    }

    setSelected(index)

    setTimeout(() => {
      const nextAnswers = [
        ...answers,
        index,
      ]

      setAnswers(nextAnswers)

      if (
        current + 1 <
        quiz.length
      ) {
        setCurrent(
          value => value + 1
        )

        setSelected(null)
      }
    }, 900)
  }

  /*
   * ---------------------------------------------------------
   * QUIZ RESULT
   * ---------------------------------------------------------
   */

  const quizFinished =
    quiz.length === 3 &&
    answers.length ===
      quiz.length

  const quizScore =
    quiz.reduce(
      (
        score,
        question,
        index
      ) =>
        score +
        (answers[index] ===
        question.correct
          ? 1
          : 0),
      0
    )

  /*
   * IMPORTANT:
   *
   * The worker MUST answer every question correctly.
   *
   * 3/3 = PASS
   * 2/3 = FAIL
   * 1/3 = FAIL
   * 0/3 = FAIL
   */
  const quizPassed =
    quizFinished &&
    quizScore === quiz.length

  /*
   * The verified badge can ONLY be obtained
   * after passing the quiz.
   */
  const canContinue =
    quizPassed

  /*
   * ---------------------------------------------------------
   * RESET QUIZ
   * ---------------------------------------------------------
   */

  const resetQuiz = () => {
    setQuiz([])
    setAnswers([])
    setCurrent(0)
    setSelected(null)
    setQuizStarted(false)
    setQuizError('')

    /*
     * Automatically move the user back to the
     * quiz start screen.
     */
    setTab('quiz')
  }

  /*
   * ---------------------------------------------------------
   * CONTINUE TO VERIFIED PAGE
   * ---------------------------------------------------------
   */

  const handleContinue = () => {
    if (!quizPassed) {
      return
    }

    /*
     * Save verification status so later pages
     * can know that the worker actually passed.
     */
    sessionStorage.setItem(
      'sp_skill_verified',
      JSON.stringify({
        verified: true,
        score: quizScore,
        total: quiz.length,
        trade,
        skills,
        verifiedAt:
          new Date().toISOString(),
      })
    )

    navigate(
      '/onboarding/verified'
    )
  }

  return (
    <OnboardingShell
      step={3}
      title="Prove Your Skills"
      subtitle="Complete the AI-powered skill assessment. You must answer every question correctly to receive your verified badge."
    >
      {/* ---------------------------------------------------
          TABS
      --------------------------------------------------- */}

      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
        {[
          {
            id: 'project',
            label:
              '📁 Add a Project',
            done:
              projectAdded,
          },
          {
            id: 'quiz',
            label:
              '⚡ AI Skill Quiz',
            done:
              quizPassed,
          },
        ].map(
          tabItem => (
            <button
              key={
                tabItem.id
              }
              onClick={() =>
                setTab(
                  tabItem.id as
                    | 'project'
                    | 'quiz'
                )
              }
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                tab ===
                tabItem.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabItem.done && (
                <CheckCircle2
                  size={14}
                  className="text-green-500"
                />
              )}

              {
                tabItem.label
              }
            </button>
          )
        )}
      </div>

      {/* ===================================================
          ADD PROJECT
      =================================================== */}

      {tab ===
        'project' &&
        (projectAdded ? (
          <div className="flex flex-col items-center py-8 gap-3 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2
                size={32}
                className="text-green-500"
              />
            </div>

            <p className="font-bold text-gray-800 text-lg">
              Project Added!
            </p>

            <p className="text-sm text-gray-500">
              "{form.title}" has
              been added to your
              passport.
            </p>

            {trade && (
              <div className="mt-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700">
                Trade: {trade}
              </div>
            )}

            {form.category && (
              <div className="rounded-full bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700">
                Category:{' '}
                {form.category}
              </div>
            )}

            <p className="text-xs text-orange-600 mt-2">
              You still need to pass the
              AI Skill Quiz to become
              verified.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* AI CONTEXT */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-start gap-3">

                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                  {isPhotography ? (
                    <Camera
                      size={20}
                      className="text-blue-600"
                    />
                  ) : (
                    <Sparkles
                      size={20}
                      className="text-blue-600"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    AI Identified Trade
                  </p>

                  <p className="font-bold text-blue-900">
                    {trade ||
                      'Your identified trade'}
                  </p>

                  {skills.length >
                    0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skills.map(
                        skill => (
                          <span
                            key={
                              skill
                            }
                            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PROJECT TITLE */}

            <div>
              <label className="label">
                Project Title *
              </label>

              <input
                className="input"
                placeholder={
                  projectTitlePlaceholder
                }
                value={
                  form.title
                }
                onChange={event =>
                  set(
                    'title',
                    event.target
                      .value
                  )
                }
              />
            </div>

            {/* CLIENT + DATE */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="label">
                  Client Name *
                </label>

                <input
                  className="input"
                  placeholder={
                    clientPlaceholder
                  }
                  value={
                    form.clientName
                  }
                  onChange={event =>
                    set(
                      'clientName',
                      event.target
                        .value
                    )
                  }
                />
              </div>

              <div>
                <label className="label">
                  Date Completed *
                </label>

                <input
                  type="date"
                  className="input"
                  value={
                    form.completedAt
                  }
                  onChange={event =>
                    set(
                      'completedAt',
                      event.target
                        .value
                    )
                  }
                />
              </div>

            </div>

            {/* AI SELECTED CATEGORY */}

            <div className="space-y-2">
              <label className="label">
                Trade / Category *
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">

                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                  {isPhotography ? (
                    <Camera
                      size={18}
                      className="text-purple-600"
                    />
                  ) : (
                    <Sparkles
                      size={18}
                      className="text-purple-600"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-600">
                    AI Selected Category
                  </p>

                  <p className="font-semibold text-gray-900">
                    {form.category ||
                      'Analyzing your trade...'}
                  </p>

                  {trade && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Based on your
                      identified trade:{' '}
                      <strong>
                        {trade}
                      </strong>
                    </p>
                  )}
                </div>

                <CheckCircle2
                  size={20}
                  className="text-green-500 shrink-0"
                />
              </div>

              <p className="text-xs text-gray-400">
                Your project category is
                automatically selected from
                the trade and skills identified
                by AI.
              </p>
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="label">
                What did you do? *
              </label>

              <textarea
                className="input resize-none"
                rows={4}
                placeholder={
                  descriptionPlaceholder
                }
                value={
                  form.description
                }
                onChange={event =>
                  set(
                    'description',
                    event.target
                      .value
                  )
                }
              />
            </div>

            {/* AI SKILLS */}

            {skills.length >
              0 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Skills linked to this
                  project
                </p>

                <div className="flex flex-wrap gap-2">
                  {skills.map(
                    skill => (
                      <span
                        key={
                          skill
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700"
                      >
                        <CheckCircle2
                          size={12}
                          className="text-green-500"
                        />

                        {skill}
                      </span>
                    )
                  )}
                </div>

              </div>
            )}

            {/* ADD PROJECT */}

            <button
              onClick={
                handleAddProject
              }
              disabled={
                !projectValid
              }
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />

              Add This Project
            </button>

          </div>
        ))}

      {/* ===================================================
          AI QUIZ
      =================================================== */}

      {tab === 'quiz' && (
        <>
          {/* QUIZ START */}

          {!quizStarted &&
            !quizFinished && (
              <div className="space-y-5">

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                        AI Assessment
                      </p>

                      <p className="font-bold text-blue-900">
                        {trade ||
                          'Your identified skills'}
                      </p>
                    </div>

                  </div>

                  {skills.length >
                    0 && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {skills.map(
                        skill => (
                          <span
                            key={
                              skill
                            }
                            className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  )}

                </div>

                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
                  <p className="text-sm font-semibold text-orange-800">
                    100% Required for Verification
                  </p>

                  <p className="text-xs text-orange-700 mt-1">
                    You must answer all 3 questions
                    correctly to receive your verified
                    badge.
                  </p>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  Our AI will generate
                  practical questions
                  specifically for your
                  trade and skills.
                </p>

                {quizError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                    {quizError}
                  </div>
                )}

                <button
                  onClick={
                    generateQuiz
                  }
                  disabled={
                    quizLoading
                  }
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles
                    size={18}
                  />

                  {quizLoading
                    ? 'Generating your skill quiz...'
                    : 'Generate My Skill Quiz'}
                </button>

              </div>
            )}

          {/* QUIZ QUESTIONS */}

          {quizStarted &&
            !quizFinished &&
            quiz[current] && (
              <div className="space-y-5">

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-600">
                    AI Assessment:{' '}
                    {trade ||
                      'Skill Assessment'}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">

                    <div
                      className="bg-orange-500 h-full rounded-full transition-all"
                      style={{
                        width: `${
                          ((current +
                            1) /
                            quiz.length) *
                          100
                        }%`,
                      }}
                    />

                  </div>

                  <span className="text-xs font-semibold text-gray-500">
                    {current + 1}/
                    {quiz.length}
                  </span>

                </div>

                <div className="bg-gray-50 rounded-2xl p-4">

                  <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                    {
                      quiz[
                        current
                      ]
                        .question
                    }
                  </p>

                </div>

                <div className="space-y-2.5">

                  {quiz[
                    current
                  ].options.map(
                    (
                      option,
                      index
                    ) => {

                      const isCorrect =
                        index ===
                        quiz[
                          current
                        ].correct

                      const isSelected =
                        selected ===
                        index

                      const revealed =
                        selected !==
                        null

                      return (
                        <button
                          key={
                            index
                          }
                          onClick={() =>
                            handleAnswer(
                              index
                            )
                          }
                          disabled={
                            revealed
                          }
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            !revealed
                              ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                              : isCorrect
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : isSelected
                                  ? 'border-red-400 bg-red-50 text-red-600'
                                  : 'border-gray-200 text-gray-400'
                          }`}
                        >
                          {
                            option
                          }

                          {revealed &&
                            isCorrect && (
                              <span className="ml-2 text-green-600">
                                ✓
                              </span>
                            )}
                        </button>
                      )
                    }
                  )}

                </div>

              </div>
            )}

          {/* QUIZ RESULT */}

          {quizFinished && (
            <div className="flex flex-col items-center py-8 gap-3 text-center">

              {quizPassed ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">

                    <Star
                      size={32}
                      className="text-green-500 fill-green-500"
                    />

                  </div>

                  <p className="font-bold text-gray-800 text-lg">
                    Skills Verified! 🎉
                  </p>

                  <p className="text-3xl font-black text-green-600">
                    {quizScore}/
                    {quiz.length}
                  </p>

                  <p className="text-sm text-gray-500 max-w-xs">
                    Perfect score! You successfully
                    demonstrated practical knowledge
                    of your identified trade.
                  </p>

                  <div className="mt-2 rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
                    ✓ Verified Skill
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-3xl">
                      ❌
                    </span>
                  </div>

                  <p className="font-bold text-gray-800 text-lg">
                    Verification Failed
                  </p>

                  <p className="text-3xl font-black text-red-500">
                    {quizScore}/
                    {quiz.length}
                  </p>

                  <p className="text-sm text-gray-500 max-w-xs">
                    You must answer all 3 questions
                    correctly to become verified.
                    Your current score is not enough
                    to receive a verified badge.
                  </p>

                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mt-2">
                    <p className="text-xs font-semibold text-red-700">
                      Required score: {quiz.length}/
                      {quiz.length}
                    </p>

                    <p className="text-xs text-red-600 mt-1">
                      Your score: {quizScore}/
                      {quiz.length}
                    </p>
                  </div>

                  <button
                    onClick={
                      resetQuiz
                    }
                    className="btn-primary mt-2 px-6 py-2.5 text-sm"
                  >
                    Try Again
                  </button>
                </>
              )}

            </div>
          )}
        </>
      )}

      {/* ===================================================
          VERIFICATION CONTINUE
      =================================================== */}

      <div className="mt-6 space-y-2">

        <button
          onClick={
            handleContinue
          }
          disabled={
            !canContinue
          }
          className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Briefcase
            size={18}
          />

          Get My Verified Badge

          <ArrowRight
            size={18}
          />
        </button>

        {!canContinue && (
          <p className="text-center text-xs text-gray-400">
            Answer all 3 AI assessment questions
            correctly to receive your verified badge.
          </p>
        )}

        {canContinue && (
          <p className="text-center text-xs text-green-600 font-medium">
            ✓ Assessment passed — you are eligible
            for verification.
          </p>
        )}

      </div>
    </OnboardingShell>
  )
}