import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import PageHeader from '../components/PageHeader'
import type { SkillLevel } from '../types'

const SKILL_SUGGESTIONS = [
  'Custom Tailoring', 'African Print Design', 'Bridal Wear', 'Pattern Making',
  'Machine Embroidery', 'Vehicle Mechanics', 'Electrical Wiring', 'Plumbing',
  'Masonry & Bricklaying', 'Welding', 'Carpentry', 'Hair Styling', 'Beauty & Makeup',
  'Farming', 'Cooking', 'Graphic Design', 'Photography',
]

const LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

const levelDesc: Record<SkillLevel, string> = {
  Beginner:     'Less than 1 year, still learning the basics',
  Intermediate: '1–3 years, can work independently',
  Advanced:     '3–6 years, consistently high quality',
  Expert:       '6+ years, can train others',
}

export default function AddSkill() {
  const { addSkill } = useApp()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', category: '', level: '' as SkillLevel | '', yearsOfExperience: 1,
  })

  const set = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.level) return
    addSkill({ ...form, level: form.level })
    setSubmitted(true)
    setTimeout(() => navigate('/passport'), 1800)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Skill Added!</h2>
        <p className="text-sm text-gray-500 text-center">Your skill is now on your Skill Passport.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Add a Skill" subtitle="Build your verified skill set" back />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <label className="label">Skill Name *</label>
            <input className="input" placeholder="e.g. Custom Tailoring"
              value={form.name} onChange={e => set('name', e.target.value)} required list="skill-suggestions" />
            <datalist id="skill-suggestions">
              {SKILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div>
            <label className="label">Category *</label>
            <input className="input" placeholder="e.g. Fashion, Construction, Beauty..."
              value={form.category} onChange={e => set('category', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="label">Skill Level *</label>
          {/* 2 cols on mobile, 4 cols on lg */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {LEVELS.map(level => (
              <button key={level} type="button" onClick={() => set('level', level)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.level === level ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                }`}>
                <p className="text-sm font-bold text-gray-800">{level}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{levelDesc[level]}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-md">
          <label className="label">Years of Experience: <strong>{form.yearsOfExperience}</strong></label>
          <input type="range" min={1} max={30} value={form.yearsOfExperience}
            onChange={e => set('yearsOfExperience', Number(e.target.value))}
            className="w-full accent-orange-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1 year</span><span>30 years</span>
          </div>
        </div>

        <button type="submit" disabled={!form.name || !form.category || !form.level}
          className="btn-primary w-full lg:w-auto lg:px-10 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
          Add Skill to Passport
        </button>
      </form>
      <div className="h-4" />
    </div>
  )
}
