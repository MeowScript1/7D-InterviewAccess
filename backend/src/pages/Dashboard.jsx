import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import JobCard from '../components/JobCard.jsx'
import JobDetail from '../components/JobDetail.jsx'

const API = 'http://localhost:8000'

const LOCATIONS = ['All', 'Bangalore', 'Hyderabad', 'Mumbai', 'Pune', 'Chennai', 'Noida', 'Gurgaon']

export default function Dashboard() {
  const { user } = useAuth()

  const [jobs,        setJobs]        = useState([])
  const [applied,     setApplied]     = useState(new Set())
  const [loading,     setLoading]     = useState(true)
  const [toast,       setToast]       = useState('')
  const [selectedJob, setSelectedJob] = useState(null)

  const [location, setLocation] = useState('All')
  const [roleQ,    setRoleQ]    = useState('')

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('user_id', user.id)
      if (location !== 'All') params.set('location', location)
      if (roleQ.trim())       params.set('role', roleQ.trim())
      const res  = await fetch(`${API}/jobs?${params}`)
      const data = await res.json()
      setJobs(data)
      // Auto-select first job on load
      if (data.length > 0 && !selectedJob) setSelectedJob(data[0])
    } catch {
      showToast('Failed to load jobs. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [user.id, location, roleQ])

  async function fetchMyApplications() {
    try {
      const res  = await fetch(`${API}/my-applications?user_id=${user.id}`)
      const data = await res.json()
      setApplied(new Set(data.map(a => a.job_id)))
    } catch {}
  }

  useEffect(() => { fetchMyApplications() }, [])
  useEffect(() => { fetchJobs() }, [fetchJobs])

  async function handleApply(jobId) {
    try {
      const res  = await fetch(`${API}/apply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ user_id: user.id, job_id: jobId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setApplied(prev => new Set([...prev, jobId]))
      // Update selected job if it's the same one
      if (selectedJob?.id === jobId) setSelectedJob(prev => ({ ...prev }))
      showToast('Applied successfully! 🎯')
    } catch (err) {
      showToast(err.message || 'Failed to apply.')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const hasSkills  = user.skills && user.skills.trim().length > 0
  const topMatches = jobs.filter(j => j.match_percent >= 50)

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col overflow-hidden bg-gray-50">

      {/* ── Top bar ── */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-sm font-semibold text-ink-900">
              {jobs.length} Walk-in Interviews
            </span>
            <span className="ml-2 text-sm text-gray-400">· Apply to as many as you want</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={roleQ}
              onChange={e => setRoleQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchJobs()}
              className="input w-52 py-2 text-sm"
              placeholder="Search role, skill…"
            />
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="input w-36 py-2 text-sm"
            >
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={fetchJobs} className="btn-primary py-2 text-sm px-4">Search</button>
            <button onClick={() => { setLocation('All'); setRoleQ('') }} className="btn-ghost py-2 text-sm px-4">Clear</button>
            {!hasSkills && (
              <Link to="/resume" className="btn-primary py-2 text-sm px-4 bg-amber-500 hover:bg-amber-600">
                📄 Upload Resume
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className="flex flex-1 overflow-hidden mx-auto w-full max-w-screen-xl">

        {/* LEFT: Job list */}
        <div className={`flex flex-col overflow-y-auto border-r border-gray-100 bg-white
          ${selectedJob ? 'w-[380px] shrink-0' : 'w-full'}`}
        >
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 text-sm">No interviews found. Try clearing filters.</p>
            </div>
          ) : (
            <div className="p-3 space-y-0">
              {/* Top Matches label */}
              {hasSkills && topMatches.length > 0 && (
                <p className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-brand">
                  ⚡ Top Matches
                </p>
              )}
              {jobs.map((job, idx) => {
                const isMatch = hasSkills && topMatches.some(t => t.id === job.id)
                // Divider between top matches and rest
                const prevIsMatch = idx > 0 && hasSkills && topMatches.some(t => t.id === jobs[idx-1].id)
                const showDivider = !isMatch && prevIsMatch && topMatches.length > 0

                return (
                  <React.Fragment key={job.id}>
                    {showDivider && (
                      <div className="flex items-center gap-2 px-2 py-3">
                        <div className="h-px flex-1 bg-gray-100" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">All Interviews</span>
                        <div className="h-px flex-1 bg-gray-100" />
                      </div>
                    )}
                    <JobCard
                      job={job}
                      onApply={handleApply}
                      applied={applied.has(job.id)}
                      isTopMatch={isMatch}
                      onClick={setSelectedJob}
                      isSelected={selectedJob?.id === job.id}
                    />
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Job detail panel */}
        {selectedJob ? (
          <div className="flex-1 overflow-hidden p-4">
            <JobDetail
              job={selectedJob}
              onApply={handleApply}
              applied={applied.has(selectedJob.id)}
              onClose={() => setSelectedJob(null)}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-300">
            <div className="text-center">
              <p className="text-5xl">👈</p>
              <p className="mt-3 text-sm">Click any job to see details</p>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink-900 px-6 py-3 text-sm font-medium text-white shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
