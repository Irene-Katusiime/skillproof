import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Check, Plus, X, ArrowRight, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import OnboardingShell from './OnboardingShell'
import type { SkillLevel } from '../../types'

// Simulated AI: maps keywords in story to skill suggestions
function extractSkills(story: string, profession: string): AISkill[] {
  const text = (story + ' ' + profession).toLowerCase()

  const allSkills: Record<string, AISkill[]> = {
    tailor: [
      { name: 'Custom Tailoring',    category: 'Clothing',  level: 'Advanced', confidence: 95 },
      { name: 'Pattern Making',       category: 'Technical', level: 'Intermediate', confidence: 88 },
      { name: 'Bridal Wear',          category: 'Specialty', level: 'Intermediate', confidence: 78 },
      { name: 'African Print Design', category: 'Fashion',   level: 'Advanced', confidence: 82 },
      { name: 'Fabric Selection',     category: 'Technical', level: 'Intermediate', confidence: 72 },
    ],
    fashion: [
      { name: 'Fashion Design',       category: 'Creative',  level: 'Advanced', confidence: 90 },
      { name: 'Garment Construction', category: 'Clothing',  level: 'Advanced', confidence: 87 },
      { name: 'Trend Analysis',        category: 'Creative', level: 'Intermediate', confidence: 70 },
    ],
    mechanic: [
      { name: 'Engine Repair',        category: 'Mechanical', level: 'Advanced', confidence: 94 },
      { name: 'Vehicle Diagnostics',  category: 'Technical',  level: 'Advanced', confidence: 90 },
      { name: 'Brake Systems',        category: 'Mechanical', level: 'Intermediate', confidence: 83 },
      { name: 'Electrical Systems',   category: 'Technical',  level: 'Intermediate', confidence: 75 },
    ],
    electric: [
      { name: 'Electrical Wiring',    category: 'Technical',  level: 'Advanced', confidence: 93 },
      { name: 'Solar Installation',   category: 'Renewable',  level: 'Intermediate', confidence: 80 },
      { name: 'Circuit Fault Finding',category: 'Technical',  level: 'Advanced', confidence: 88 },
    ],
    plumb: [
      { name: 'Pipe Installation',    category: 'Plumbing',   level: 'Advanced', confidence: 91 },
      { name: 'Drain Repair',         category: 'Plumbing',   level: 'Intermediate', confidence: 85 },
      { name: 'Bathroom Fitting',     category: 'Plumbing',   level: 'Advanced', confidence: 82 },
    ],
    build: [
      { name: 'Masonry',             category: 'Construction', level: 'Advanced', confidence: 90 },
      { name: 'Concrete Work',        category: 'Construction', level: 'Advanced', confidence: 87 },
      { name: 'Site Management',      category: 'Management',   level: 'Intermediate', confidence: 74 },
    ],
    carpenter: [
      { name: 'Furniture Making',     category: 'Carpentry',  level: 'Advanced', confidence: 92 },
      { name: 'Wood Joinery',         category: 'Technical',  level: 'Advanced', confidence: 88 },
      { name: 'Cabinet Installation', category: 'Carpentry',  level: 'Intermediate', confidence: 80 },
    ],
    hair: [
      { name: 'Hair Braiding',        category: 'Beauty',     level: 'Expert', confidence: 96 },
      { name: 'Hair Relaxing',        category: 'Beauty',     level: 'Advanced', confidence: 88 },
      { name: 'Natural Hair Care',    category: 'Beauty',     level: 'Advanced', confidence: 84 },
    ],
    cook: [
      { name: 'Meal Preparation',     category: 'Culinary',   level: 'Advanced', confidence: 90 },
      { name: 'Menu Planning',        category: 'Culinary',   level: 'Intermediate', confidence: 78 },
      { name: 'Food Safety',          category: 'Technical',  level: 'Intermediate', confidence: 75 },
    ],
    farm: [
      { name: 'Crop Management',      category: 'Agriculture', level: 'Advanced', confidence: 89 },
      { name: 'Soil Preparation',     category: 'Agriculture', level: 'Advanced', confidence: 86 },
      { name: 'Pest Control',         category: 'Agriculture', level: 'Intermediate', confidence: 76 },
    ],
  }

  const found: AISkill[] = []
  Object.entries(allSkills).forEach(([keyword, skills]) => {
    if (text.includes(keyword)) {
      skills.forEach(s => {
        if (!found.find(f => f.name === s.name)) found.push(s)
      })
    }
  })

  // Always return at least 3 generic skills based on common words
  if (found.length < 3) {
    const extras: AISkill[] = [
      { name: 'Client Communication', category: 'Soft Skills', level: 'Intermediate', confidence: 70 },
      { name: 'Time Management',       category: 'Soft Skills', level: 'Intermediate', confidence: 68 },
      { name: 'Quality Control',       category: 'Technical',   level: 'Intermediate', confidence: 72 },
    ]
    extras.forEach(e => { if (!found.find(f => f.name === e.name)) found.push(e) })
  }

  return found.slice(0, 7).sort((a, b) => b.confidence - a.confidence)
}

interface AISkill {
  name: string
  category: string
  level: SkillLevel
  confidence: number
}

export default function AISkills() {
  const { profile, addSkill } = useApp()
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)
  const [suggestedSkills, setSuggestedSkills] = useState<AISkill[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [customSkill, setCustomSkill] = useState('')

  useEffect(() => {
    const story = sessionStorage.getItem('sp_onboarding_story') || profile.bio
    // Simulate AI scanning delay
    const timer = setTimeout(() => {
      const skills = extractSkills(story, profile.profession)
      setSuggestedSkills(skills)
      setSelected(new Set(skills.map(s => s.name)))
      setScanning(false)
    }, 2200)
    return () => clearTimeout(timer)
  }, [profile.bio, profile.profession])

  const toggle = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const addCustom = () => {
    if (!customSkill.trim()) return
    const skill: AISkill = { name: customSkill.trim(), category: 'Other', level: 'Intermediate', confidence: 100 }
    setSuggestedSkills(prev => [...prev, skill])
    setSelected(prev => new Set([...prev, skill.name]))
    setCustomSkill('')
  }

  const handleContinue = () => {
    const toAdd = suggestedSkills.filter(s => selected.has(s.name))
    toAdd.forEach(s => addSkill({ name: s.name, category: s.category, level: s.level, yearsOfExperience: 1 }))
    navigate('/onboarding/prove')
  }

  const confidenceColor = (c: number) =>
    c >= 90 ? 'text-green-600 bg-green-50' : c >= 75 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 bg-gray-50'

  return (
    <OnboardingShell
      step={2}
      title="AI Identified Your Skills"
      subtitle="Based on your story, here are the skills we found. Select the ones that apply, and add any we missed."
    >
      {scanning ? (
        <div className="flex flex-col items-center justify-center py-16 gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap size={28} className="text-violet-500" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800">AI is reading your story…</p>
            <p className="text-sm text-gray-500 mt-1">Identifying skills from your experience</p>
          </div>
          <div className="flex gap-1.5 mt-2">
            {['Analysing text', 'Matching skills', 'Ranking confidence'].map((label, i) => (
              <span key={label} className="text-xs bg-violet-100 text-violet-600 px-3 py-1 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}>{label}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-sm text-violet-700 bg-violet-50 rounded-xl px-4 py-2.5">
            <Sparkles size={16} className="shrink-0" />
            <span>AI found <strong>{suggestedSkills.length} skills</strong> in your story. Select the ones that match your experience.</span>
          </div>

          {/* Skill chips */}
          <div className="space-y-2.5">
            {suggestedSkills.map(skill => {
              const isSelected = selected.has(skill.name)
              return (
                <button
                  key={skill.name}
                  onClick={() => toggle(skill.name)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check size={13} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{skill.name}</p>
                    <p className="text-xs text-gray-400">{skill.category} · {skill.level}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${confidenceColor(skill.confidence)}`}>
                    {skill.confidence}% match
                  </span>
                </button>
              )
            })}
          </div>

          {/* Add custom skill */}
          <div>
            <label className="label">Add a skill we missed</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="e.g. Machine Embroidery"
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
              />
              <button onClick={addCustom} disabled={!customSkill.trim()}
                className="btn-secondary px-4 py-2.5 flex items-center gap-1 disabled:opacity-40">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={selected.size === 0}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prove These Skills ({selected.size}) <ArrowRight size={18} />
          </button>
        </div>
      )}
    </OnboardingShell>
  )
}
