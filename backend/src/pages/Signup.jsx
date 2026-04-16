import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const API = 'http://localhost:8000'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      return setError('All fields are required.')
    }
    setLoading(true)
    try {
      const res  = await fetch(`${API}/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Signup failed.')
      login(data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">7D</span>
          <span className="font-display text-sm font-bold text-ink-900">InterviewAccess</span>
        </Link>

        <div className="card">
          <h1 className="font-display text-xl font-bold text-ink-900">Create account</h1>
          <p className="mt-1 text-sm text-gray-500">Start your 7-day unlimited access today.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Full name</label>
              <input
                name="name" value={form.name} onChange={handleChange}
                className="input" placeholder="Aditya Kumar"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                className="input" placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-800">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                className="input" placeholder="Min 6 characters"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
