import { Link } from 'react-router-dom'
import {
  ArrowRight, ShieldCheck, Award, TrendingUp,
  Users, Briefcase, Star, Globe, ChevronDown,
} from 'lucide-react'

const stats = [
  { value: '350M+',  label: 'informal workers across Sub-Saharan Africa' },
  { value: '80%',    label: 'lack formal documentation of their skills' },
  { value: '1 in 3', label: 'skilled workers rejected due to no proof of experience' },
]

const howItWorks = [
  {
    step: '01', icon: Briefcase, title: 'Document Real Work', color: 'bg-orange-100 text-orange-600',
    desc: 'Workers log completed projects, clients, and timelines — turning undocumented experience into structured records.',
  },
  {
    step: '02', icon: ShieldCheck, title: 'Get Client Confirmation', color: 'bg-green-100 text-green-600',
    desc: 'Clients confirm work with a rating and testimonial. Each confirmation adds a verified layer to the Skill Passport.',
  },
  {
    step: '03', icon: Star, title: 'Pass Skill Assessments', color: 'bg-blue-100 text-blue-600',
    desc: 'Workers take short practical assessments to demonstrate knowledge — verifiable proof beyond word of mouth.',
  },
  {
    step: '04', icon: Award, title: 'Share Your Passport', color: 'bg-purple-100 text-purple-600',
    desc: 'A unique shareable Skill Passport link lets workers present their verified story to clients, employers, and lenders.',
  },
]

const personas = [
  { emoji: '✂️', name: 'Sarah',  skill: 'Tailor',      story: '8 years sewing, no proof. Now her 340 confirmed jobs speak for her.' },
  { emoji: '🔧', name: 'James',  skill: 'Mechanic',    story: 'Fixed hundreds of cars. His verified passport helped him get a loan to open his garage.' },
  { emoji: '⚡', name: 'Amara',  skill: 'Electrician', story: 'Could not get contracts without a certificate. Now her Skill Passport gets her hired.' },
]

const storyChain = [
  { text: "Sarah's story",                  color: 'bg-orange-100 text-orange-700' },
  { text: 'Her skills',                     color: 'bg-orange-200 text-orange-800' },
  { text: 'Proof of her skills',            color: 'bg-orange-300 text-orange-900' },
  { text: 'Trusted Skill Passport',         color: 'bg-green-100 text-green-700 font-bold' },
  { text: 'Better clients / jobs / financing', color: 'bg-green-200 text-green-800' },
  { text: '✨ A better tomorrow',            color: 'bg-green-500 text-white font-bold' },
]

export default function PitchDemo() {
  return (
    /* Full-bleed: no inner padding — Layout adds none for pitch page */
    <div>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 text-white px-6 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
              <Globe size={13} /> skillproof.africa
            </div>
            <h1 className="text-3xl lg:text-5xl xl:text-6xl font-black leading-tight">
              Empowering Africa's Tomorrow,
              <span className="block text-yellow-200 mt-1">One Story at a Time.</span>
            </h1>
            <p className="text-orange-100 mt-5 text-sm lg:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
              SkillProof turns informal workers' real-world experience into a verifiable Skill Passport — building the trust they need to access better clients, jobs, and financing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start">
              <Link to="/" className="btn-primary bg-white text-orange-600 hover:bg-orange-50 py-3 px-6 text-sm font-bold flex items-center justify-center gap-2">
                See Sarah's Passport <ArrowRight size={16} />
              </Link>
              <Link to="/passport" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20 py-3 px-6 text-sm font-bold">
                View Live Demo
              </Link>
            </div>
          </div>

          {/* Desktop right: story chain preview */}
          <div className="hidden lg:block space-y-2">
            {storyChain.map((item, i) => (
              <div key={i} className={`rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-3 ${item.color}`}>
                {i > 0 && <span className="text-xs opacity-50">↓</span>}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-10 lg:hidden">
          <ChevronDown size={24} className="text-orange-200 animate-bounce" />
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="bg-gray-900 text-white px-6 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <span className="badge-orange text-xs mb-4 inline-block">The Problem</span>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            <div>
              <h2 className="text-2xl lg:text-4xl font-bold leading-snug">
                Africa doesn't have a shortage of skilled people.
              </h2>
              <p className="text-gray-300 text-sm lg:text-base mt-4 leading-relaxed">
                It has a shortage of systems that can{' '}
                <span className="text-orange-400 font-semibold">recognise, verify, and translate</span>{' '}
                those skills into opportunity.
              </p>
              <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
                <p className="text-sm text-orange-300 leading-relaxed">
                  "A mechanic may have repaired hundreds of vehicles. A builder may have completed years of construction projects. Yet their experience exists only through word of mouth and cash transactions."
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-8 lg:mt-0">
              {stats.map(s => (
                <div key={s.value} className="flex items-start gap-4 bg-white/5 rounded-2xl p-5">
                  <span className="text-3xl lg:text-4xl font-black text-orange-400 shrink-0 w-24 leading-none">{s.value}</span>
                  <p className="text-sm lg:text-base text-gray-300 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Solution ── */}
      <section className="bg-white px-6 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <span className="badge-green text-xs mb-4 inline-block">The Solution</span>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
            <div>
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-snug">SkillProof changes this.</h2>
              <p className="text-gray-600 text-sm lg:text-base mt-3 leading-relaxed">
                We turn a worker's real-world experience into a verifiable{' '}
                <strong>Skill Passport</strong> — their story becomes evidence, their evidence becomes trust, and trust becomes opportunity.
              </p>
            </div>

            {/* Story chain */}
            <div className="mt-6 lg:mt-0 space-y-2">
              {storyChain.map((item, i) => (
                <div key={i} className={`rounded-xl px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${item.color}`}>
                  {i > 0 && <span className="text-gray-400 text-xs">↓</span>}
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 px-6 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <span className="badge-blue text-xs mb-4 inline-block">How It Works</span>
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-8">
            Four steps to a verified Skill Passport
          </h2>
          {/* 1 col mobile → 2 col lg → 4 col xl */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {howItWorks.map(step => {
              const Icon = step.icon
              return (
                <div key={step.step} className="card flex flex-col gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400">{step.step}</span>
                      <h3 className="font-bold text-gray-800 text-sm">{step.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Who It's For ── */}
      <section className="bg-white px-6 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <span className="badge-orange text-xs mb-4 inline-block">Who It's For</span>
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-8">Real people. Real skills.</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {personas.map(p => (
              <div key={p.name} className="card flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  {p.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{p.name}</span>
                    <span className="badge-gray">{p.skill}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{p.story}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact ── */}
      <section className="bg-gradient-to-br from-green-700 to-emerald-600 text-white px-6 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl lg:text-4xl font-bold mb-3">The Impact</h2>
          <p className="text-green-200 text-sm lg:text-base mb-10 max-w-lg mx-auto">
            When informal workers can prove their skills, everyone wins.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: Users,      label: 'Workers',   desc: 'Attract better clients and fairer pay' },
              { icon: Briefcase,  label: 'Employers', desc: 'Hire with confidence, not guesswork' },
              { icon: TrendingUp, label: 'Lenders',   desc: 'Assess earning potential with real data' },
            ].map(item => {
              const Icon = item.icon
              return (
                <div key={item.label} className="bg-white/10 rounded-2xl p-6 flex flex-col items-center gap-3">
                  <Icon size={28} className="text-green-300" />
                  <p className="font-bold text-lg">{item.label}</p>
                  <p className="text-sm text-green-200 text-center leading-snug">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-900 text-white px-6 py-12 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl lg:text-4xl font-bold mb-3">Try the Demo</h2>
          <p className="text-gray-400 text-sm lg:text-base mb-8 max-w-md mx-auto">
            Explore Sarah's Skill Passport — built right here in this app.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/passport" className="btn-primary py-3 px-8 text-base flex items-center justify-center gap-2">
              <Award size={18} /> View Skill Passport
            </Link>
            <Link to="/" className="btn-secondary py-3 px-8 text-base border-gray-700 text-gray-300 hover:bg-gray-800">
              Go to Dashboard
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-8">Built for Africa · Powered by SkillProof · 2024</p>
        </div>
      </section>

    </div>
  )
}
