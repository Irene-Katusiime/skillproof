import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, Mail, Lock, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function EmployerLogin() {
  const { loginWithPassword } = useApp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = loginWithPassword(email.trim(), password, 'employer')

    if (result) {
      setError(
        result === 'email_not_found'
          ? 'No employer account was found with this email.'
          : 'Incorrect password.'
      )
      return
    }

    navigate('/employer/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Award size={23} />
          </div>
          <span className="font-black text-2xl text-gray-900">
            Skill<span className="text-orange-500">Proof</span>
          </span>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-7 sm:p-9">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Employer Portal
          </p>

          <h1 className="text-3xl font-black text-gray-900 mt-2">
            Welcome back
          </h1>

          <p className="text-gray-500 mt-2 mb-7">
            Sign in to discover and hire verified talent.
          </p>

          {error && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-5 text-sm text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">

            <div>
              <label className="label">Employer Email</label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  className="input pl-10"
                  placeholder="company@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  required
                  className="input pl-10"
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3.5 font-bold transition">
              Sign In as Employer
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an employer account?{' '}
            <Link
              to="/employer/register"
              className="font-bold text-blue-600"
            >
              Register
            </Link>
          </p>

          <p className="text-center text-sm mt-3">
            <Link
              to="/login"
              className="text-gray-400 hover:text-gray-600"
            >
              Worker login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
