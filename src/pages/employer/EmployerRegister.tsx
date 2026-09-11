import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Award, Building2, MapPin, Phone, Mail, Globe, Lock, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react'
import { useApp, type EmployerRegisterData } from '../../context/AppContext'

const INDUSTRIES = [
  'Construction & Real Estate', 'Manufacturing', 'Retail & Trade',
  'Hospitality & Tourism', 'Agriculture & Farming', 'Healthcare',
  'Education & Training', 'Finance & Banking', 'Technology',
  'Media & Communications', 'Transport & Logistics', 'Other',
]

const LOCATIONS = [
  'Nairobi, Kenya', 'Mombasa, Kenya', 'Lagos, Nigeria', 'Abuja, Nigeria',
  'Accra, Ghana', 'Kampala, Uganda', 'Dar es Salaam, Tanzania',
  'Kigali, Rwanda', 'Johannesburg, South Africa', 'Other',
]

export default function EmployerRegister() {
  const { registerEmployer, emailExists } = useApp()
  const navigate = useNavigate()

  const [step, setStep]     = useState<1 | 2>(1)
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [pwErr, setPwErr]   = useState('')
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')

  const [form, setForm] = useState<EmployerRegisterData>({
    companyName: '', industry: '', location: '',
    email: '', phone: '', website: '',
  })
  const set = (k: keyof EmployerRegisterData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const step1Valid = form.companyName.trim().length > 1 && !!form.industry && !!form.location

  const validateStep2 = () => {
    let ok = true
    setEmailErr(''); setPwErr('')
    if (!form.email.includes('@')) { setEmailErr('Please enter a valid email address.'); ok = false }
    else if (emailExists(form.email)) { setEmailErr('An account with this email already exists.'); ok = false }
    if (password.length < 6) { setPwErr('Password must be at least 6 characters.'); ok = false }
    else if (password !== password2) { setPwErr('Passwords do not match.'); ok = false }
    return ok
  }

  const step2Valid = form.email.includes('@') && form.phone.trim().length > 6
    && password.length >= 6 && password === password2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    registerEmployer(form, password)
    navigate('/employer/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full" />

        <div className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Award size={20} className="text-white" />
          </div>
          <span className="font-black text-2xl text-white">Skill<span className="text-yellow-300">Proof</span></span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-black text-white leading-tight">
            Hire talent you<br />can <span className="text-yellow-300">trust</span>.
          </h2>
          {[
            'Browse verified Skill Passports',
            'See real projects, client confirmations',
            'Contact and hire in minutes',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3">
              <span className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center text-blue-800 font-black text-xs shrink-0">{i + 1}</span>
              <p className="text-sm text-blue-100">{item}</p>
            </div>
          ))}
        </div>

        <p className="relative text-blue-200 text-sm">
          "Stop guessing. Every worker has a verified record of real experience."
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-6 lg:hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <Award size={20} className="text-white" />
            </div>
            <span className="font-black text-2xl text-gray-900">Skill<span className="text-blue-600">Proof</span></span>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-6">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Employer Registration — Step {step} of 2</p>
            <h2 className="text-3xl font-black text-gray-900">
              {step === 1 ? 'Company details' : 'Contact & password'}
            </h2>
          </div>

          {/* Mobile progress */}
          <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
            {[1, 2].map(s => (
              <div key={s} className={`rounded-full transition-all duration-300 ${
                s === step ? 'w-6 h-2.5 bg-blue-600' : s < step ? 'w-2.5 h-2.5 bg-blue-300' : 'w-2.5 h-2.5 bg-gray-200'
              }`} />
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">

            {/* Employer badge */}
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2 mb-2">
              <Building2 size={15} className="text-blue-600 shrink-0" />
              <span className="text-xs font-semibold text-blue-700">Registering as an Employer</span>
            </div>

            {step === 1 && (
              <>
                <div>
                  <label className="label">Company / Organisation Name *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-9" placeholder="e.g. Equity Bank Kenya"
                      value={form.companyName} onChange={e => set('companyName', e.target.value)} autoFocus />
                  </div>
                </div>
                <div>
                  <label className="label">Industry *</label>
                  <select className="input bg-white" value={form.industry} onChange={e => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location *</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select className="input pl-9 bg-white" value={form.location} onChange={e => set('location', e.target.value)}>
                      <option value="">Select location</option>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Website <span className="text-gray-400 font-normal">(optional)</span></label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-9" placeholder="https://yourcompany.com"
                      value={form.website} onChange={e => set('website', e.target.value)} />
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!step1Valid}
                  className="btn-primary w-full py-3 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue <ChevronRight size={18} />
                </button>
              </>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Work Email *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className={`input pl-9 ${emailErr ? 'border-red-300' : ''}`} type="email"
                      placeholder="you@company.com" value={form.email}
                      onChange={e => { set('email', e.target.value); setEmailErr('') }} autoFocus />
                  </div>
                  {emailErr && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertCircle size={12} className="text-red-500 shrink-0" />
                      <p className="text-xs text-red-600">{emailErr}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-9" type="tel" placeholder="+254 7XX XXX XXX"
                      value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className={`input pl-9 pr-10 ${pwErr ? 'border-red-300' : ''}`}
                      type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                      value={password} onChange={e => { setPassword(e.target.value); setPwErr('') }} />
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className={`input pl-9 pr-10 ${pwErr ? 'border-red-300' : ''}`}
                      type={showPw2 ? 'text' : 'password'} placeholder="Repeat password"
                      value={password2} onChange={e => { setPassword2(e.target.value); setPwErr('') }} />
                    <button type="button" onClick={() => setShowPw2(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {pwErr && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <AlertCircle size={12} className="text-red-500 shrink-0" />
                      <p className="text-xs text-red-600">{pwErr}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                  <button type="submit" disabled={!step2Valid}
                    className="btn-primary flex-1 py-3 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    Create Account 🎉
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Looking for work?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">Register as a worker</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
