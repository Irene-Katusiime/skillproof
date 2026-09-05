import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Award, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useApp, type LoginError } from '../context/AppContext'

export default function Login() {
  const { loginWithPassword } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState<LoginError>(null)
  const [loading,  setLoading]  = useState(false)

  const errorMsg: Record<NonNullable<LoginError>, string> = {
    email_not_found:    'No account found with that email address.',
    invalid_credentials:'Incorrect password. Please try again.',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || password.length < 6) return
    setError(null)
    setLoading(true)
    const result = loginWithPassword(email.trim(), password)
    setLoading(false)
    if (result) {
      setError(result)
      if (result === 'invalid_credentials') setPassword('')
    } else {
      const dest = !from || from === '/' || from === '/login' || from === '/register'
        ? '/dashboard'
        : from
      navigate(dest, { replace: true })
    }
  }

  const canSubmit = email.trim().length > 0 && password.length >= 6

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex">

      {/* ── Left decorative panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-orange-500 to-amber-400 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative text-center text-white max-w-md">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Award size={40} className="text-white" />
          </div>
          <h1 className="font-black text-5xl xl:text-6xl leading-tight">
            Skill<span className="text-yellow-300">Proof</span>
          </h1>
          <p className="text-orange-100 text-xl mt-4 font-medium leading-relaxed">
            Empowering Africa's Tomorrow,<br />One Story at a Time.
          </p>
          <div className="mt-10 space-y-4 text-left">
            {[
              { emoji: '✂️', text: 'Sarah tailored 340 outfits — now her passport proves it.' },
              { emoji: '🔧', text: 'James fixed 200 cars — his verified skills opened a loan.' },
              { emoji: '⚡', text: 'Amara got hired with a passport, not a certificate.' },
            ].map(item => (
              <div key={item.emoji} className="flex items-start gap-3 bg-white/15 rounded-2xl px-4 py-3">
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <p className="text-sm text-orange-100 leading-snug">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Demo hint */}
          <div className="mt-8 bg-white/20 rounded-2xl px-4 py-3 text-left">
            <p className="text-xs font-bold text-yellow-200 uppercase tracking-wide mb-1">Demo credentials</p>
            <p className="text-sm text-white font-mono">sarah.kamau@skillproof.africa</p>
            <p className="text-sm text-white font-mono">demo1234</p>
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 lg:py-0">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 mb-8 lg:hidden">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Award size={32} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-3xl text-gray-900">
                Skill<span className="text-orange-500">Proof</span>
              </h1>
              <p className="text-sm text-gray-500 mt-1">Empowering Africa's Tomorrow, One Story at a Time.</p>
            </div>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-black text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to access your Skill Passport.</p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 lg:hidden">Sign in</h2>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMsg[error]}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="label" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    className={`input pl-9 ${error === 'email_not_found' ? 'border-red-300 focus:ring-red-400' : ''}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className={`input pl-9 pr-10 ${error === 'invalid_credentials' ? 'border-red-300 focus:ring-red-400' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(null) }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                  : 'Sign In'
                }
              </button>
            </form>

            {/* Mobile demo hint */}
            <div className="mt-5 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 lg:hidden">
              <p className="text-xs font-bold text-orange-600 mb-1">Demo account</p>
              <p className="text-xs text-gray-600 font-mono">sarah.kamau@skillproof.africa</p>
              <p className="text-xs text-gray-600 font-mono">demo1234</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">
              Create your Skill Passport
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
