import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Award, Share2, ArrowRight, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import OnboardingShell from './OnboardingShell'

export default function VerifiedSkills() {
  const { profile, completeOnboarding } = useApp()
  const navigate = useNavigate()
  const [animating, setAnimating] = useState(true)
  const [visible, setVisible] = useState<number>(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!animating) {
      let i = 0
      const interval = setInterval(() => {
        i++
        setVisible(i)
        if (i >= profile.skills.length) clearInterval(interval)
      }, 180)
      return () => clearInterval(interval)
    }
  }, [animating, profile.skills.length])

  const handleGoToPassport = () => {
    completeOnboarding()
    navigate('/passport')
  }

  const handleShare = () => {
    completeOnboarding()
    navigate('/passport')
  }

  return (
    <OnboardingShell
      step={4}
      title="Your Skills Are Verified! 🎉"
      subtitle="Your Skill Passport is ready. Your experience is now documented, verified, and shareable."
    >
      {animating ? (
        <div className="flex flex-col items-center py-12 gap-5">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-green-200 border-t-green-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck size={36} className="text-green-500" />
            </div>
          </div>
          <p className="font-bold text-gray-800 text-lg">Issuing your Skill Passport…</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Passport mini card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-700 to-emerald-500 rounded-2xl p-5 text-white">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-yellow-300" />
              <span className="text-xs font-bold tracking-widest text-yellow-300 uppercase">SkillProof Passport — Issued</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-black shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg">{profile.name}</p>
                <p className="text-green-200 text-sm">{profile.profession}</p>
                <p className="text-xs font-mono text-green-300 mt-0.5">{profile.passportId}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { label: 'Skills',      value: profile.skills.length },
                { label: 'Projects',    value: profile.projects.length },
                { label: 'Assessments', value: profile.assessments.length },
              ].map(s => (
                <div key={s.label} className="bg-white/15 rounded-xl p-2.5 text-center">
                  <p className="font-bold text-lg">{s.value}</p>
                  <p className="text-[10px] text-green-200">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified skills list */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Your verified skills:</p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, visible).map((skill, i) => (
                <span key={skill.id}
                  className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                  style={{ animation: `fadeIn 0.3s ease-out ${i * 0.1}s both` }}>
                  <ShieldCheck size={11} /> {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-bold text-orange-800">What happens next?</p>
            {[
              'Share your passport link with clients and employers',
              'Clients can confirm your projects to boost credibility',
              'Lenders and employers can verify your skills instantly',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Star size={13} className="text-orange-400 fill-orange-400 mt-0.5 shrink-0" />
                <p className="text-xs text-orange-700">{item}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button onClick={handleGoToPassport}
              className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
              <Award size={18} /> View My Skill Passport <ArrowRight size={18} />
            </button>
            <button onClick={handleShare}
              className="btn-secondary w-full py-3 text-sm flex items-center justify-center gap-2">
              <Share2 size={16} /> Share My Passport Now
            </button>
          </div>
        </div>
      )}
    </OnboardingShell>
  )
}
