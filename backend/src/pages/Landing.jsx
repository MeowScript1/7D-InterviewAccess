import React from 'react'
import { Link } from 'react-router-dom'

// Stats shown on landing page
const STATS = [
  { value: '20+',      label: 'Walk-in Interviews' },
  { value: 'Unlimited',label: 'Applications / Day' },
  { value: '7 Days',   label: 'Full Access' },
  { value: '10+',      label: 'Top Companies' },
]

// Company logos (text-based for simplicity)
const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Flipkart',
  'Razorpay', 'Swiggy', 'Zerodha', 'Freshworks',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Top Nav ── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-white">
            7D
          </span>
          <span className="font-display text-sm font-bold text-ink-900">InterviewAccess</span>
        </span>
        <div className="flex items-center gap-3">
          <Link to="/login"  className="btn-ghost py-2 text-sm">Login</Link>
          <Link to="/signup" className="btn-primary py-2 text-sm">Get Started</Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <main>
        <section className="mx-auto max-w-4xl px-6 pb-24 pt-20 text-center">
          {/* Tag */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
            🚀 Unlimited Walk-in Access · 7 Days Only
          </span>

          {/* Headline */}
          <h1 className="font-display text-5xl font-extrabold leading-tight text-ink-950 sm:text-6xl">
            Unlimited Interviews
            <span className="block text-brand">for 7 Days</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
            Access every walk-in interview that matches your skills. No limits.
            No waiting. Apply to as many as you want — all in one place.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary px-8 py-3 text-base">
              Start Free — Get Access Now
            </Link>
            <Link to="/login" className="btn-ghost px-8 py-3 text-base">
              I already have an account
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map(s => (
              <div key={s.label} className="card text-center">
                <p className="font-display text-2xl font-bold text-brand">{s.value}</p>
                <p className="mt-1 text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="font-display text-center text-3xl font-bold text-ink-900">
              How It Works
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { step: '01', title: 'Create your profile', desc: 'Sign up and upload your resume. We extract your skills automatically.' },
                { step: '02', title: 'See matched interviews', desc: 'Browse walk-in interviews ranked by how well they match your skill set.' },
                { step: '03', title: 'Apply — no limits', desc: 'Hit Apply on any job. Track your schedule in My Interviews.' },
              ].map(item => (
                <div key={item.step} className="card flex flex-col gap-3">
                  <span className="font-display text-4xl font-extrabold text-brand/20">{item.step}</span>
                  <h3 className="font-semibold text-ink-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Companies ── */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-wider text-gray-400">
            Walk-in opportunities at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {COMPANIES.map(c => (
              <span
                key={c}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-ink-800 shadow-sm"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="mt-16">
            <Link to="/signup" className="btn-primary px-10 py-3 text-base">
              Get Started — It's Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2024 7 Day Interview Access · Built with FastAPI + React
      </footer>
    </div>
  )
}
