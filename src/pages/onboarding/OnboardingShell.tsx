import type { ReactNode } from 'react'
import { Award, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const STEPS = [
  { n: 1, label: 'Your Story'  },
  { n: 2, label: 'AI Skills'   },
  { n: 3, label: 'Prove It'    },
  { n: 4, label: 'Verified'    },
]

interface Props {
  step: 1 | 2 | 3 | 4
  title: string
  subtitle: string
  children: ReactNode
}

export default function OnboardingShell({ step, title, subtitle, children }: Props) {
  const { profile } = useApp()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col">

      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Award size={15} className="text-white" />
          </div>
          <span className="font-black text-lg text-gray-900">Skill<span className="text-orange-500">Proof</span></span>
        </div>
        <p className="text-xs text-gray-500">
          Welcome, <span className="font-semibold text-gray-700">{profile.name.split(' ')[0]}</span>
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8">
        <div className="w-full max-w-xl">

          {/* Step progress */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {STEPS.map((s, i) => {
              const done   = step > s.n
              const active = step === s.n
              return (
                <div key={s.n} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      done   ? 'bg-green-500 border-green-500 text-white' :
                      active ? 'bg-orange-500 border-orange-500 text-white' :
                               'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {done ? <Check size={16} /> : s.n}
                    </div>
                    <p className={`text-[10px] font-semibold mt-1 ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.label}
                    </p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-12 sm:w-20 h-0.5 mb-4 mx-1 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
