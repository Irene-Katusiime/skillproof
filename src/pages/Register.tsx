import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Award, User, Briefcase, MapPin, Phone,
  Mail, FileText, Lock, Eye, EyeOff, ChevronRight, AlertCircle,
} from 'lucide-react'
import { useApp, type RegisterData } from '../context/AppContext'

const PROFESSIONS = [
  'Tailor & Fashion Designer', 'Mechanic', 'Electrician', 'Plumber',
  'Builder / Mason', 'Carpenter', 'Welder', 'Hair Stylist & Beauty',
  'Farmer & Agriculturalist', 'Cook / Chef', 'Graphic Designer',
  'Photographer', 'Artisan / Craftsperson', 'Other',
]

const LOCATIONS = [
  'Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 'Nakuru, Kenya',
  'Lagos, Nigeria', 'Abuja, Nigeria', 'Accra, Ghana', 'Kampala, Uganda',
  'Dar es Salaam, Tanzania', 'Kigali, Rwanda', 'Addis Ababa, Ethiopia',
  'Johannesburg, South Africa', 'Cape Town, South Africa', 'Other',
]

type Step = 1 | 2 | 3 | 4

const stepTitles = ['Your identity', 'Contact & Password', 'Your story', 'All done!']
const stepDescs  = [
  'Tell us who you are and what you do.',
  'How clients reach you + secure your account.',
  'Tell clients what makes you the right person for the job.',
  '',
]

export default function Register() {
  const { register, emailExists } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(1)
  const [showPw,    setShowPw]    = useState(false)
  const [showPw2,   setShowPw2]   = useState(false)
  const [emailErr,  setEmailErr]  = useState('')
  const [pwErr,     setPwErr]     = useState('')

  const [form, setForm] = useState<RegisterData>({
    name: '', profession: '', tagline: '',
    location: '', phone: '', email: '', bio: '',
  })
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')

  const set = (key: keyof RegisterData, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  // Validation
  const step1Valid = form.name.trim().length > 1 && !!form.profession && !!form.location

  const validateStep2 = () => {
    let ok = true
    setEmailErr(''); setPwErr('')
    if (!form.email.includes('@')) { setEmailErr('Please enter a valid email address.'); ok = false }
    else if (emailExists(form.email)) { setEmailErr('An account with this email already exists.'); ok = false }
    if (password.length < 6) { setPwErr('Password must be at least 6 characters.'); ok = false }
    else if (password !== password2) { setPwErr('Passwords do not match.'); ok = false }
    return ok
  }

  const step2Valid = form.phone.trim().length > 6 && form.email.includes('@') && password.length >= 6 && password === password2
  const step3Valid = form.bio.trim().length > 10

  const handleNext2 = () => {
    if (validateStep2()) setStep(3)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(form, password)
    setStep(4)
    setTimeout(() => navigate('/onboarding/story'), 1800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex">

      {/* ── Left decorative panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-gradient-to-br from-green-700 to-emerald-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Award size={20} className="text-white" />
          </div>
          <span className="font-black text-2xl text-white">Skill<span className="text-yellow-300">Proof</span></span>
        </div>

        {/* Step indicators */}
        <div className="relative space-y-6">
          {stepTitles.slice(0, 3).map((title, i) => {
            const s = (i + 1) as Step
            const done   = step > s
            const active = step === s
            return (
              <div key={title} className={`flex items-start gap-4 transition-opacity ${!active && !done ? 'opacity-40' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all ${
                  done   ? 'bg-white text-green-700' :
                  active ? 'bg-yellow-300 text-green-800' :
                           'bg-white/20 text-white'
                }`}>
                  {done ? '✓' : s}
                </div>
                <div>
                  <p className={`font-bold text-sm ${active ? 'text-yellow-300' : 'text-white'}`}>{title}</p>
                  <p className="text-xs text-green-200 mt-0.5">{stepDescs[i]}</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="relative text-green-200 text-sm leading-relaxed">
          "Your story is evidence. Your evidence is trust. Your trust is opportunity."
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-6 lg:hidden">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <Award size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl text-gray-900">Skill<span className="text-orange-500">Proof</span></span>
          </div>

          {/* Mobile progress dots */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
              {([1, 2, 3] as Step[]).map(s => (
                <div key={s} className={`rounded-full transition-all duration-300 ${
                  s === step ? 'w-6 h-2.5 bg-orange-500' :
                  s < step   ? 'w-2.5 h-2.5 bg-orange-300' :
                               'w-2.5 h-2.5 bg-gray-200'
                }`} />
              ))}
            </div>
          )}

          {/* Desktop heading */}
          {step < 4 && (
            <div className="hidden lg:block mb-6">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Step {step} of 3</p>
              <h2 className="text-3xl font-black text-gray-900">{stepTitles[step - 1]}</h2>
              <p className="text-gray-500 mt-1">{stepDescs[step - 1]}</p>
            </div>
          )}

          {/* ── Success screen ── */}
          {step === 4 && (
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900">Passport Created!</h2>
              <p className="text-gray-500 mt-2 text-sm">Welcome to SkillProof, {form.name.split(' ')[0]}.</p>
              <p className="text-xs text-gray-400 mt-4">Redirecting you to your dashboard…</p>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full animate-[grow_2s_ease-in-out_forwards]" style={{ width: '100%', transition: 'width 2s' }} />
              </div>
            </div>
          )}

          {step < 4 && (
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-5">

              {/* ── Step 1: Identity ── */}
              {step === 1 && (
                <>
                  <div className="lg:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Create your profile</h2>
                    <p className="text-sm text-gray-500 mt-1">Tell us who you are and what you do.</p>
                  </div>

                  <div>
                    <label className="label" htmlFor="name">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="name" className="input pl-9" placeholder="e.g. Sarah Wanjiru Kamau"
                        value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="profession">Profession *</label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select id="profession" className="input pl-9 bg-white" value={form.profession}
                        onChange={e => set('profession', e.target.value)}>
                        <option value="">Select your profession</option>
                        {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="tagline">Tagline <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input id="tagline" className="input"
                      placeholder={form.profession ? `e.g. Expert ${form.profession}` : 'e.g. Expert Tailor with 8 years experience'}
                      value={form.tagline} onChange={e => set('tagline', e.target.value)} />
                  </div>

                  <div>
                    <label className="label" htmlFor="location">Location *</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select id="location" className="input pl-9 bg-white" value={form.location}
                        onChange={e => set('location', e.target.value)}>
                        <option value="">Select your city</option>
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <button onClick={() => setStep(2)} disabled={!step1Valid}
                    className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    Continue <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* ── Step 2: Contact + Password ── */}
              {step === 2 && (
                <>
                  <div className="lg:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Contact & Password</h2>
                    <p className="text-sm text-gray-500 mt-1">How clients reach you + secure your account.</p>
                  </div>

                  <div>
                    <label className="label" htmlFor="phone">Phone Number *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="phone" className="input pl-9" placeholder="+254 7XX XXX XXX" type="tel"
                        value={form.phone} onChange={e => set('phone', e.target.value)} autoFocus />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="label" htmlFor="email">Email Address * <span className="text-gray-400 font-normal">(used to sign in)</span></label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="email" className={`input pl-9 ${emailErr ? 'border-red-300 focus:ring-red-400' : ''}`}
                        placeholder="you@example.com" type="email"
                        value={form.email} onChange={e => { set('email', e.target.value); setEmailErr('') }} />
                    </div>
                    {emailErr && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle size={13} className="text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">{emailErr}</p>
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="label" htmlFor="pw">Password * <span className="text-gray-400 font-normal">(min. 6 characters)</span></label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="pw" type={showPw ? 'text' : 'password'}
                        className={`input pl-9 pr-10 ${pwErr ? 'border-red-300 focus:ring-red-400' : ''}`}
                        placeholder="Create a password"
                        value={password} onChange={e => { setPassword(e.target.value); setPwErr('') }} />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPw ? 'Hide' : 'Show'}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="label" htmlFor="pw2">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="pw2" type={showPw2 ? 'text' : 'password'}
                        className={`input pl-9 pr-10 ${pwErr ? 'border-red-300 focus:ring-red-400' : ''}`}
                        placeholder="Repeat your password"
                        value={password2} onChange={e => { setPassword2(e.target.value); setPwErr('') }} />
                      <button type="button" onClick={() => setShowPw2(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPw2 ? 'Hide' : 'Show'}>
                        {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {pwErr && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle size={13} className="text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">{pwErr}</p>
                      </div>
                    )}
                  </div>

                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div>
                      <div className="flex gap-1 h-1.5">
                        {[6, 9, 12].map((threshold, i) => (
                          <div key={i} className={`flex-1 rounded-full transition-all ${
                            password.length >= threshold
                              ? i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-green-500'
                              : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {password.length < 6 ? 'Too short' : password.length < 9 ? 'Weak' : password.length < 12 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                    <button onClick={handleNext2} disabled={!step2Valid}
                      className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      Continue <ChevronRight size={18} />
                    </button>
                  </div>
                </>
              )}

              {/* ── Step 3: Bio ── */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-5 lg:hidden">
                    <h2 className="text-xl font-bold text-gray-900">Your story</h2>
                    <p className="text-sm text-gray-500 mt-1">Tell clients what makes you the right person for the job.</p>
                  </div>

                  <div className="mb-5">
                    <label className="label" htmlFor="bio">About You *</label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-3 top-3.5 text-gray-400" />
                      <textarea id="bio" className="input pl-9 resize-none" rows={5} autoFocus
                        placeholder="Describe your experience, specialties, and what clients can expect..."
                        value={form.bio} onChange={e => set('bio', e.target.value)} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{form.bio.length} characters</p>
                  </div>

                  {/* Passport preview */}
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-5">
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2">Passport preview</p>
                    <p className="text-sm font-bold text-gray-800">{form.name}</p>
                    <p className="text-xs text-gray-500">{form.profession} · {form.location}</p>
                    <p className="text-xs text-gray-500">{form.phone}</p>
                    <p className="text-xs text-gray-500">{form.email}</p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                    <button type="submit" disabled={!step3Valid}
                      className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      Create Passport 🎉
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {step < 4 && (
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 font-semibold hover:underline">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
