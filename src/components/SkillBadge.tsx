import { ShieldCheck } from 'lucide-react'
import type { Skill } from '../types'

const levelColor: Record<string, string> = {
  Expert:       'bg-purple-100 text-purple-700 border-purple-200',
  Advanced:     'bg-blue-100 text-blue-700 border-blue-200',
  Intermediate: 'bg-orange-100 text-orange-700 border-orange-200',
  Beginner:     'bg-gray-100 text-gray-600 border-gray-200',
}

interface Props {
  skill: Skill
}

export default function SkillBadge({ skill }: Props) {
  return (
    <div className={`flex items-center justify-between border rounded-xl px-4 py-3 ${levelColor[skill.level]}`}>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm">{skill.name}</span>
          {skill.verified && <ShieldCheck size={14} className="text-green-600" />}
        </div>
        <p className="text-xs opacity-75 mt-0.5">
          {skill.level} · {skill.yearsOfExperience}yr{skill.yearsOfExperience !== 1 ? 's' : ''} · {skill.endorsements} endorsements
        </p>
      </div>
      <span className="text-xs font-bold opacity-60">{skill.level[0]}</span>
    </div>
  )
}
