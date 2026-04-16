import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import JobCard   from '../components/JobCard.jsx'
import JobDetail from '../components/JobDetail.jsx'

const API  = 'http://localhost:8000'
const LOCS = ['All','Bangalore','Hyderabad','Mumbai','Pune','Chennai','Noida','Gurgaon']

function isToday(iso) {
  const t = new Date(); t.setHours(0,0,0,0)
  return new Date(iso).toDateString() === t.toDateString()
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{
      position:'fixed', bottom:'24px', left:'50%',
      transform:'translateX(-50%)', zIndex:200,
      display:'flex', alignItems:'center', gap:'10px',
      background: toast.type==='success' ? '#16A34A' : '#DC2626',
      color:'white', borderRadius:'999px',
      padding:'10px 22px', fontSize:'0.875rem', fontWeight:600,
      boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
      animation:'slideUp 0.25s ease',
      whiteSpace:'nowrap',
    }}>
      {toast.type==='success' ? '✓' : '✗'} {toast.msg}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [jobs,    setJobs]    = useState([])
  const [applied, setApplied] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState(null)
  const [sel,     setSel]     = useState(null)
  const [loc,     setLoc]     = useState('All')
  const [roleQ,   setRoleQ]   = useState('')

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      p.set('user_id', user.id)
      if (loc !== 'All') p.set('location', loc)
      if (roleQ.trim())  p.set('role', roleQ.trim())
      const data = await fetch(`${API}/jobs?${p}`).then(r=>r.json())
      setJobs(data)
      setSel(prev => prev ? data.find(j=>j.id===prev.id)||data[0] : data[0])
    } catch { showToast('Could not load jobs — is the backend running?', 'error') }
    finally { setLoading(false) }
  }, [user.id, loc, roleQ])

  useEffect(() => {
    fetch(`${API}/my-applications?user_id=${user.id}`)
      .then(r=>r.json())
      .then(data => setApplied(new Set(data.map(a=>a.job_id))))
      .catch(()=>{})
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  async function handleApply(jobId) {
    try {
      const res  = await fetch(`${API}/apply`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ user_id:user.id, job_id:jobId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      setApplied(p => new Set([...p, jobId]))
      showToast('Applied! 🎯 Check My Schedule to track it.', 'success')
    } catch(e) { showToast(e.message||'Failed to apply.', 'error') }
  }

  function showToast(msg, type='success') {
    setToast({msg,type})
    setTimeout(() => setToast(null), 3500)
  }

  const hasSkills  = user.skills?.trim().length > 0
  const topMatches = jobs.filter(j => j.match_percent >= 50)
  const todayCount = jobs.filter(j => isToday(j.date)).length

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ height:'calc(100vh - 56px)', display:'flex', flexDirection:'column', background:'var(--bg)', overflow:'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{
        background:'var(--bg-card)',
        borderBottom:'1px solid var(--border)',
        padding:'12px 20px',
        flexShrink:0,
      }}>
        <div style={{
          maxWidth:'1320px', margin:'0 auto',
          display:'flex', flexWrap:'wrap',
          alignItems:'center', justifyContent:'space-between',
          gap:'12px',
        }}>
          {/* Left: greeting */}
          <div>
            <p style={{
              fontFamily:'Bricolage Grotesque, sans-serif',
              fontSize:'0.95rem', fontWeight:700,
              color:'var(--text-1)', lineHeight:1.2,
            }}>
              {greeting}, {user.name?.split(' ')[0]} 👋
              {todayCount > 0 && (
                <span style={{
                  marginLeft:'10px', fontSize:'0.72rem', fontWeight:700,
                  background:'var(--amber-bg)', color:'var(--amber)',
                  borderRadius:'999px', padding:'2px 10px',
                  border:'1px solid rgba(217,119,6,0.2)',
                  verticalAlign:'middle',
                }}>
                  🔥 {todayCount} walk-in{todayCount>1?'s':''} today!
                </span>
              )}
            </p>
            <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:'2px' }}>
              {loading ? 'Loading…' : (
                <>
                  <span style={{ fontWeight:600, color:'var(--text-2)' }}>{jobs.length}</span> interviews available
                  {!hasSkills && (
                    <span style={{ color:'var(--amber)' }}>
                      {' '}· <Link to="/resume" style={{ color:'var(--amber)', fontWeight:600 }}>Upload resume</Link> to see skill matches
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Right: filters */}
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px' }}>
            <input
              value={roleQ} onChange={e=>setRoleQ(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&fetchJobs()}
              className="input" style={{ width:'190px', padding:'8px 12px' }}
              placeholder="Search role or skill…"
            />
            <select value={loc} onChange={e=>setLoc(e.target.value)}
              className="input" style={{ width:'130px', padding:'8px 12px' }}>
              {LOCS.map(l=><option key={l}>{l}</option>)}
            </select>
            <button onClick={fetchJobs} className="btn-primary" style={{ padding:'8px 16px' }}>
              Search
            </button>
            {(loc!=='All'||roleQ) && (
              <button onClick={()=>{setLoc('All');setRoleQ('')}} className="btn-ghost" style={{ padding:'8px 12px', fontSize:'0.8rem' }}>
                Clear
              </button>
            )}
            {!hasSkills && (
              <Link to="/resume" style={{
                display:'inline-flex', alignItems:'center', gap:'6px',
                background:'var(--amber)', color:'white',
                borderRadius:'10px', padding:'8px 14px',
                fontSize:'0.8rem', fontWeight:600,
                boxShadow:'0 2px 8px rgba(217,119,6,0.3)',
                textDecoration:'none',
              }}>
                📄 Resume
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Split layout ── */}
      <div style={{ flex:1, overflow:'hidden', display:'flex' }}>

        {/* LEFT: job list */}
        <div style={{
          width:'360px', flexShrink:0,
          overflowY:'auto', background:'var(--bg)',
          borderRight:'1px solid var(--border)',
          padding:'12px',
        }}>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {Array.from({length:6}).map((_,i) => (
                <div key={i} className="skeleton" style={{ height:'128px', animationDelay:`${i*0.08}s` }}/>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div style={{ padding:'48px 16px', textAlign:'center' }}>
              <p style={{ fontSize:'2.5rem', marginBottom:'12px' }}>🔍</p>
              <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:600, color:'var(--text-1)', marginBottom:'6px' }}>
                No interviews found
              </p>
              <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginBottom:'16px' }}>
                Try adjusting your filters
              </p>
              <button onClick={()=>{setLoc('All');setRoleQ('')}} className="btn-soft" style={{ padding:'8px 20px', fontSize:'0.8rem' }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>

              {/* Top matches section */}
              {hasSkills && topMatches.length > 0 && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'2px 2px 6px' }}>
                    <span style={{
                      fontSize:'0.65rem', fontWeight:800,
                      textTransform:'uppercase', letterSpacing:'0.08em',
                      color:'var(--brand)', background:'var(--brand-bg)',
                      border:'1px solid var(--brand-border)',
                      borderRadius:'999px', padding:'3px 10px',
                    }}>⚡ Top Matches</span>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>
                      {topMatches.length} job{topMatches.length>1?'s':''}
                    </span>
                  </div>

                  {topMatches.map(job => (
                    <JobCard key={`tm-${job.id}`} job={job}
                      applied={applied.has(job.id)} isTopMatch
                      isNew={isToday(job.date)}
                      onClick={setSel} isSelected={sel?.id===job.id}
                    />
                  ))}

                  <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 2px 4px' }}>
                    <div style={{ flex:1, height:'1px', background:'var(--border)' }}/>
                    <span style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)' }}>
                      All {jobs.length} Interviews
                    </span>
                    <div style={{ flex:1, height:'1px', background:'var(--border)' }}/>
                  </div>
                </>
              )}

              {/* All jobs */}
              {jobs.map(job => (
                <JobCard key={job.id} job={job}
                  applied={applied.has(job.id)}
                  isTopMatch={false}
                  isNew={isToday(job.date)}
                  onClick={setSel}
                  isSelected={sel?.id===job.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: detail panel */}
        {sel ? (
          <div style={{ flex:1, overflow:'hidden', padding:'16px' }}>
            <JobDetail
              job={sel}
              onApply={handleApply}
              applied={applied.has(sel.id)}
              userId={user.id}
              onClose={() => setSel(null)}
            />
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:'3rem', marginBottom:'12px' }}>👈</p>
              <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:600, color:'var(--text-2)', marginBottom:'4px' }}>
                Select an interview
              </p>
              <p style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>
                Click any card on the left to view full details
              </p>
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} />
    </div>
  )
}
