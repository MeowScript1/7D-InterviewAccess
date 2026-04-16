import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const API = 'http://localhost:8000'

// Status config for badge colours and labels
const STATUS_CONFIG = {
  applied:   { label: 'Applied',   classes: 'bg-blue-50   text-blue-700   border-blue-200'   },
  attended:  { label: 'Attended',  classes: 'bg-green-50  text-green-700  border-green-200'  },
  cancelled: { label: 'Cancelled', classes: 'bg-red-50    text-red-600    border-red-200'    },
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtAppliedAt(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function MyInterviews() {
  const { user } = useAuth()

  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState('')

  // ── Fetch applications ──────────────────────────────────────────────────
  async function fetchApps() {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/my-applications?user_id=${user.id}`)
      const data = await res.json()
      setApps(data)
    } catch {
      showToast('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApps() }, [])

  // ── Update status ───────────────────────────────────────────────────────
  async function handleStatus(appId, newStatus) {
    try {
      const res = await fetch(`${API}/application/${appId}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      // Update locally — no full refetch needed
      setApps(prev =>
        prev.map(a => a.app_id === appId ? { ...a, status: newStatus } : a)
      )
      showToast(`Status updated to "${newStatus}"`)
    } catch {
      showToast('Failed to update status.')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // ── Stats ───────────────────────────────────────────────────────────────
  const total    = apps.length
  const attended = apps.filter(a => a.status === 'attended').length
  const pending  = apps.filter(a => a.status === 'applied').length

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">My Interview Schedule</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track every walk-in you've applied to. Update status after attending.
        </p>
      </div>

      {/* ── Summary cards ── */}
      {total > 0 && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="font-display text-3xl font-bold text-brand">{total}</p>
            <p className="mt-1 text-xs text-gray-500">Total Applied</p>
          </div>
          <div className="card text-center">
            <p className="font-display text-3xl font-bold text-amber-500">{pending}</p>
            <p className="mt-1 text-xs text-gray-500">Upcoming</p>
          </div>
          <div className="card text-center">
            <p className="font-display text-3xl font-bold text-success">{attended}</p>
            <p className="mt-1 text-xs text-gray-500">Attended</p>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-5xl">📋</p>
          <p className="mt-4 text-sm">You haven't applied to any interviews yet.</p>
          <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
            Browse Interviews
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            return (
              <div key={app.app_id} className="card flex flex-wrap items-start justify-between gap-4">

                {/* Left: job info */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-semibold text-ink-900">{app.role}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-sm text-gray-600">{app.company}</span>
                    {/* Status badge */}
                    <span className={`badge border ${cfg.classes}`}>{cfg.label}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                    <span>📍 {app.location}</span>
                    <span>📅 Walk-in: {fmtDate(app.date)}</span>
                    <span>🕒 Applied: {fmtAppliedAt(app.applied_at)}</span>
                  </div>

                  {/* Skills */}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {app.skills_required.split(',').map(s => (
                      <span key={s} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: status changer */}
                <div className="flex shrink-0 items-center gap-2">
                  {app.status !== 'attended' && (
                    <button
                      onClick={() => handleStatus(app.app_id, 'attended')}
                      className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      Mark Attended
                    </button>
                  )}
                  {app.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatus(app.app_id, 'cancelled')}
                      className="rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                  {app.status === 'cancelled' && (
                    <button
                      onClick={() => handleStatus(app.app_id, 'applied')}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
