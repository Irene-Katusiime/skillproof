import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, Building2, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function EmployerRegister() {
  const { registerEmployer, emailExists } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    location: '',
  })
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.companyName.trim() || !form.contactName.trim()) {
      setError('Please enter your company and contact name.')
      return
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    if (emailExists(form.email)) {
      setError('An account with this email already exists.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== password2) {
      setError('Passwords do not match.')
      return
    }

    registerEmployer({
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
    }, password)

    navigate('/employer/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-700 to-indigo-600 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Award size={22} />
          </div>
          <span className="font-black text-2xl">
            Skill<span className="text-yellow-300">Proof</span>
          </span>
        </div>

        <div>
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-3">
            For Employers
          </p>
          <h1 className="text-5xl font-black leading-tight">
            Hire talent you can trust.
          </h1>
          <p className="text-blue-100 mt-5 leading-relaxed">
            Discover workers with verified skills, real project evidence,
            client confirmations and assessments.
          </p>
        </div>

        <p className="text-blue-200 text-sm">
          SkillProof · Verified talent for Africa
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Award size={22} />
            </div>
            <span className="font-black text-2xl">
              Skill<span className="text-orange-500">Proof</span>
            </span>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Employer account
            </p>
            <h2 className="text-3xl font-black text-gray-900 mt-1">
              Create your employer account
            </h2>
            <p className="text-gray-500 mt-2">
              Find and hire verified skilled workers.
            </p>
          </div>

          <form onSubmit={submit} className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 space-y-4">
            {error && (
              <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="label">Company / Organisation</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  placeholder="e.g. Pearl Designs Ltd"
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Your Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  placeholder="Contact person"
                  value={form.contactName}
                  onChange={e => set('contactName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="input pl-9"
                  placeholder="company@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  placeholder="+256..."
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Location</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  placeholder="Kampala, Uganda"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input"
                placeholder="Repeat password"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
              />
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold transition">
              Create Employer Account
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an employer account?{' '}
              <Link to="/employer/login" className="font-bold text-blue-600">
                Sign in
              </Link>
            </p>

            <p className="text-center text-sm">
              <Link to="/register" className="text-gray-400 hover:text-gray-600">
                Register as a worker instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
