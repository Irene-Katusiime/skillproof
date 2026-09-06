import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Plus, Sparkles } from 'lucide-react'
import OnboardingShell from './OnboardingShell'
import { useApp } from '../../context/AppContext'

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

interface AISkill {
  name: string
  category: string
  level: SkillLevel
  confidence: number
}

interface VoiceExtraction {
  primaryTrade?: string
  specificSkills?: string[] | string
  estimatedJobValueUGX?: number
  clientPhoneNumber?: string
  vvdScore?: number
}

function normalizeSkills(extraction: VoiceExtraction): AISkill[] {
  const trade = extraction.primaryTrade?.trim() || ''

  let rawSkills: string[] = []

  if (Array.isArray(extraction.specificSkills)) {
    rawSkills = extraction.specificSkills
  } else if (typeof extraction.specificSkills === 'string') {
    rawSkills = extraction.specificSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean)
  }

  const uniqueSkills = Array.from(
    new Set(
      rawSkills
        .map(skill => skill.trim())
        .filter(Boolean)
    )
  )

  const confidence = Math.max(
    0,
    Math.min(100, Number(extraction.vvdScore ?? 75))
  )

  const tradeSkill: AISkill[] = trade
    ? [
        {
          name: trade,
          category: 'Primary Trade',
          level: confidence >= 90
            ? 'Advanced'
            : confidence >= 75
              ? 'Intermediate'
              : 'Beginner',
          confidence,
        },
      ]
    : []

  const specific: AISkill[] = uniqueSkills.map(skill => ({
    name: skill,
    category: 'Identified Skill',
    level:
      confidence >= 90
        ? 'Advanced'
        : confidence >= 75
          ? 'Intermediate'
          : 'Beginner',
    confidence,
  }))

  return [...tradeSkill, ...specific]
}

export default function AISkills() {
  const { profile, addSkill } = useApp()
  const navigate = useNavigate()

  const [scanning, setScanning] = useState(true)
  const [suggestedSkills, setSuggestedSkills] = useState<AISkill[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customSkill, setCustomSkill] = useState('')
  const [trade, setTrade] = useState('')
  const [extraction, setExtraction] = useState<VoiceExtraction | null>(null)

  useEffect(() => {
    const storedExtraction = sessionStorage.getItem('sp_voice_extraction')

    if (storedExtraction) {
      try {
        const parsed: VoiceExtraction = JSON.parse(storedExtraction)

        console.log('AI extraction received:', parsed)

        const skills = normalizeSkills(parsed)

        setExtraction(parsed)
        setTrade(parsed.primaryTrade || '')
        setSuggestedSkills(skills)
        setSelected(new Set(skills.map(skill => skill.name)))
      } catch (error) {
        console.error('Could not parse AI extraction:', error)
      }
    }

    // Fallback for users who typed their story instead of using voice.
    if (!storedExtraction) {
      const story =
        sessionStorage.getItem('sp_onboarding_story') ||
        profile.bio ||
        ''

      console.log('No voice extraction found. Story:', story)
    }

    setTimeout(() => {
      setScanning(false)
    }, 800)
  }, [profile.bio])

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)

      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }

      return next
    })
  }

  const addCustom = () => {
    const name = customSkill.trim()

    if (!name) return

    const skill: AISkill = {
      name,
      category: 'Other',
      level: 'Intermediate',
      confidence: 100,
    }

    setSuggestedSkills(prev => [...prev, skill])
    setSelected(prev => new Set([...prev, name]))
    setCustomSkill('')
  }

  const handleContinue = () => {
    const toAdd = suggestedSkills.filter(skill =>
      selected.has(skill.name)
    )

    toAdd.forEach(skill => {
      addSkill({
        name: skill.name,
        category: skill.category,
        level: skill.level,
        yearsOfExperience: 1,
      })
    })

    navigate('/onboarding/prove')
  }

  const confidenceColor = (confidence: number) => {
    if (confidence >= 90) {
      return 'text-green-600 bg-green-50'
    }

    if (confidence >= 75) {
      return 'text-blue-600 bg-blue-50'
    }

    return 'text-gray-500 bg-gray-50'
  }

  return (
    <OnboardingShell
      step={2}
      title="AI Identified Your Skills"
      subtitle="Based on your story, here are the skills our AI identified. Select the ones that apply, and add any we missed."
    >
      {scanning ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Sparkles className="h-8 w-8 animate-pulse text-blue-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900">
            Analyzing your story...
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Our AI is identifying your actual skills and experience.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {trade && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                Primary Trade
              </p>

              <p className="mt-1 text-lg font-semibold text-blue-900">
                {trade}
              </p>
            </div>
          )}

          {suggestedSkills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-gray-400" />

              <h3 className="mt-3 font-semibold text-gray-900">
                No specific skills identified yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your skills below and we will use them in your SkillProof profile.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedSkills.map(skill => {
                const isSelected = selected.has(skill.name)

                return (
                  <button
                    key={skill.name}
                    type="button"
                    onClick={() => toggle(skill.name)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {skill.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {skill.category} • {skill.level}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${confidenceColor(
                        skill.confidence
                      )}`}
                    >
                      {skill.confidence}%
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {extraction?.estimatedJobValueUGX ? (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Estimated typical job value
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                UGX{' '}
                {Number(
                  extraction.estimatedJobValueUGX
                ).toLocaleString()}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-gray-200 p-4">
            <label className="text-sm font-medium text-gray-700">
              Add another skill
            </label>

            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={event =>
                  setCustomSkill(event.target.value)
                }
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addCustom()
                  }
                }}
                placeholder="e.g. Welding"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />

              <button
                type="button"
                onClick={addCustom}
                className="flex items-center gap-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}
    </OnboardingShell>
  )
}