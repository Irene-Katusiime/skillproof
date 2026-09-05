import { Link } from 'react-router-dom'
import {
  Award, ArrowRight, ShieldCheck, Sparkles, Users,
  Briefcase, TrendingUp, ChevronDown, Star, Globe,
  CheckCircle2, Zap,
} from 'lucide-react'

const workerJourney = [
  { step: '01', icon: Sparkles,     color: 'bg-orange-500',  label: 'Tell Your Story',        desc: 'Write about your work in your own words — no certificates needed.' },
  { step: '02', icon: Zap,          color: 'bg-violet-500',  label: 'AI Identifies Skills',   desc: 'Our AI reads your story and extracts your real skills automatically.' },
  { step: '03', icon: Briefcase,    color: 'bg-blue-500',    label: 'Prove Your Skills',      desc: 'Add completed projects, client contacts, and take quick assessments.' },
  { step: '04', icon: ShieldCheck,  color: 'bg-green-500',   label: 'Get Verified',           desc: 'Clients confirm your work. Each confirmation adds verified proof.' },
  { step: '05', icon: Award,        color: 'bg-amber-500',   label: 'Skill Passport',         desc: 'Your story becomes a shareable, verifiable Skill Passport.' },
  { step: '06', icon: TrendingUp,   color: 'bg-emerald-500', label: 'Find Opportunity',       desc: 'Share your passport link with employers, lenders, and new clients.' },
]

const employerFlow = [
  { icon: Globe,        title: 'Discover Talent',    desc: 'Browse verified worker profiles filtered by skill, location, and rating.' },
  { icon: ShieldCheck,  title: 'Trust the Profile',  desc: 'Every skill is backed by real projects, client confirmations, and assessments.' },
  { icon: Users,        title: 'Contact & Hire',     desc: 'Reach out directly through SkillProof and hire with confidence.' },
]

const stats = [
  { value: '350M+', label: 'Informal workers in Africa' },
  { value: '80%',   label: 'Lack formal skill documentation' },
  { value: '1 in 3', label: 'Skilled workers rejected for no proof' },
]

const testimonials = [
  { emoji: '✂️', name: 'Sarah K.',  role: 'Tailor · Nairobi',       quote: 'I had 8 years of experience but no way to prove it. SkillProof changed that.' },
  { emoji: '🔧', name: 'James M.', role: 'Mechanic · Lagos',         quote: 'My verified passport helped me get a loan to open my own garage.' },
  { emoji: '⚡', name: 'Amara O.', role: 'Electrician · Accra',      quote: 'Clients now trust me before we even meet. The passport does the talking.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Award size={16} className="text-white" />
            </div>
            <span className="font-black text-xl text-gray-900">Skill<span className="text-orange-500">Proof</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors px-3 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
                <Globe size={13} /> Built for Africa's Informal Workforce
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-tight">
                Your Skills.<br />
                <span className="text-yellow-200">Verified.</span><br />
                Your Future, Open.
              </h1>
              <p className="text-orange-100 mt-5 text-base lg:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                SkillProof turns informal workers' real-world experience into a verifiable
                <strong className="text-white"> Skill Passport</strong> — the trust you need to
                attract better clients, jobs, and financing.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center lg:justify-start">
                <Link to="/register" className="btn-primary bg-white text-orange-600 hover:bg-orange-50 py-3.5 px-8 text-base font-bold flex items-center justify-center gap-2 shadow-lg">
                  Build My Skill Passport <ArrowRight size={18} />
                </Link>
                <Link to="/discover" className="py-3.5 px-8 text-base font-bold border-2 border-white/40 rounded-xl text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <Users size={18} /> I'm an Employer
                </Link>
              </div>
              <p className="text-orange-200 text-sm mt-4">Free to join · No CV required · Instant passport</p>
            </div>

            {/* Floating passport preview */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl scale-95" />
                <div className="relative bg-gradient-to-br from-green-700 to-emerald-500 rounded-3xl p-6 shadow-2xl border border-white/20 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={16} className="text-yellow-300" />
                    <span className="text-xs font-bold tracking-widest text-yellow-300 uppercase">SkillProof Passport</span>
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">S</div>
                    <div>
                      <h3 className="font-bold text-lg">Sarah W. Kamau</h3>
                      <p className="text-green-200 text-sm">Tailor & Fashion Designer</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-300 fill-yellow-300" />)}
                        <span className="text-xs ml-1">4.8</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[['340', 'Jobs Done'], ['8yrs', 'Experience'], ['6', 'Verified Skills']].map(([v, l]) => (
                      <div key={l} className="bg-white/15 rounded-xl p-2.5 text-center">
                        <p className="font-bold">{v}</p><p className="text-[10px] text-green-200">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Custom Tailoring', 'Bridal Wear', 'African Print', 'Pattern Making'].map(s => (
                      <span key={s} className="bg-white/20 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-green-300" /> {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 bg-white/15 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-green-200 uppercase tracking-wide">Passport ID</p>
                      <p className="text-sm font-mono font-bold">SP-2024-KE-00341</p>
                    </div>
                    <ShieldCheck size={20} className="text-green-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center pb-8">
          <ChevronDown size={24} className="text-orange-200 animate-bounce" />
        </div>
      </section>

      {/* ── Problem stats ── */}
      <section className="bg-gray-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm font-semibold uppercase tracking-widest mb-8">The Problem We're Solving</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map(s => (
              <div key={s.value} className="text-center bg-white/5 rounded-2xl p-6">
                <p className="text-4xl font-black text-orange-400">{s.value}</p>
                <p className="text-sm text-gray-300 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8 max-w-2xl mx-auto leading-relaxed">
            Africa doesn't have a shortage of skilled people. It has a shortage of systems that can
            <span className="text-orange-400 font-semibold"> recognise, verify, and translate</span> those skills into opportunity.
          </p>
        </div>
      </section>

      {/* ── Worker Journey ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">For Workers</span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">From invisible to undeniable</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Six steps to turn your experience into a verified Skill Passport that opens doors.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {workerJourney.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="relative bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                  {i < workerJourney.length - 1 && (
                    <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-gray-300">›</div>
                  )}
                  <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{item.step}</span>
                  <h3 className="font-bold text-gray-900 mt-1 text-base">{item.label}</h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/register" className="btn-primary py-3.5 px-10 text-base font-bold inline-flex items-center gap-2">
              Start My Journey <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Employer section ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <span className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">For Employers</span>
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">Hire talent you can trust</h2>
              <p className="text-gray-500 mt-4 leading-relaxed">
                Stop guessing. Every worker on SkillProof has a verified Skill Passport — real projects,
                client confirmations, and passed assessments. You see proof, not promises.
              </p>
              <div className="space-y-4 mt-8">
                {employerFlow.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-8">
                <Link to="/discover" className="btn-primary bg-blue-600 hover:bg-blue-700 py-3 px-8 text-sm font-bold inline-flex items-center gap-2">
                  Discover Talent <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Talent card preview */}
            <div className="mt-10 lg:mt-0 space-y-3">
              {[
                { init: 'J', name: 'James Mwangi', role: 'Mechanic', loc: 'Lagos', rating: 4.9, jobs: 180, skills: ['Engine Repair', 'Diagnostics', 'Welding'] },
                { init: 'A', name: 'Amara Osei',   role: 'Electrician', loc: 'Accra', rating: 4.7, jobs: 95, skills: ['Wiring', 'Solar Installation'] },
              ].map(w => (
                <div key={w.name} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl font-black text-blue-600 shrink-0">{w.init}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-800">{w.name}</p>
                      <span className="badge-green text-[10px]"><ShieldCheck size={10} />Verified</span>
                    </div>
                    <p className="text-xs text-gray-500">{w.role} · {w.loc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}</div>
                      <span className="text-xs text-gray-500">{w.rating} · {w.jobs} jobs</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {w.skills.map(s => <span key={s} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Real stories. Real impact.</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-4xl mb-4">{t.emoji}</div>
                <p className="text-gray-700 text-sm leading-relaxed italic mb-4">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-green-700 to-emerald-500 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-black mb-4">
            Empowering Africa's Tomorrow,<br />
            <span className="text-yellow-300">One Story at a Time.</span>
          </h2>
          <p className="text-green-200 text-base mb-8 max-w-lg mx-auto">
            Your experience is real. Your skills are real. Now it's time to prove it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary bg-white text-green-700 hover:bg-green-50 py-3.5 px-10 text-base font-bold inline-flex items-center justify-center gap-2">
              Build My Passport — It's Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
            <Award size={12} className="text-white" />
          </div>
          <span className="font-black text-white">Skill<span className="text-orange-500">Proof</span></span>
        </div>
        <p className="text-xs">Built for Africa · Turning experience into opportunity · 2024</p>
      </footer>
    </div>
  )
}
