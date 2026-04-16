import React, { useState } from 'react'

const API = 'http://localhost:8000'

const PALETTES = [
  { icon:'#4F6EF7', bg:'#EEF1FE' }, { icon:'#7C3AED', bg:'#F5F3FF' },
  { icon:'#0EA5E9', bg:'#E0F2FE' }, { icon:'#059669', bg:'#ECFDF5' },
  { icon:'#D97706', bg:'#FFFBEB' }, { icon:'#DB2777', bg:'#FDF2F8' },
  { icon:'#DC2626', bg:'#FEF2F2' }, { icon:'#0891B2', bg:'#ECFEFF' },
  { icon:'#16A34A', bg:'#F0FDF4' },
]
function palette(name) { return PALETTES[name.charCodeAt(0) % PALETTES.length] }
function fmtLong(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
}

// ── AI Fit Modal ──────────────────────────────────────────────────────────────
function AIFitModal({ result, loading, error, onClose, onApply, applied }) {
  if (!loading && !result && !error) return null

  const scoreColor = result
    ? result.score >= 70 ? '#16A34A'
    : result.score >= 40 ? '#D97706' : '#DC2626'
    : 'var(--text-3)'

  const verdictBg = result
    ? result.score >= 70 ? { bg:'#ECFDF5', border:'rgba(22,163,74,0.2)', color:'#16A34A' }
    : result.score >= 40 ? { bg:'#FFFBEB', border:'rgba(217,119,6,0.2)', color:'#D97706' }
    : { bg:'#FEF2F2', border:'rgba(220,38,38,0.2)', color:'#DC2626' }
    : { bg:'var(--bg-raised)', border:'var(--border)', color:'var(--text-2)' }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300,
      background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'20px', animation:'fadeIn 0.2s ease',
    }}>
      <div style={{
        width:'100%', maxWidth:'520px',
        background:'var(--bg-card)',
        border:'1.5px solid var(--border)',
        borderRadius:'20px',
        boxShadow:'var(--shadow-3)',
        animation:'scaleIn 0.2s ease',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ fontSize:'1.4rem' }}>🤖</div>
            <div>
              <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1rem', fontWeight:700, color:'var(--text-1)', margin:0 }}>AI Resume Analysis</h3>
              <p style={{ fontSize:'0.75rem', color:'var(--text-3)', margin:0 }}>How well your profile fits this job</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'8px', background:'var(--bg-raised)', border:'1px solid var(--border)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ padding:'24px', maxHeight:'70vh', overflowY:'auto' }}>
          {loading && (
            <div style={{ textAlign:'center', padding:'32px' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'16px', animation:'spin 1.5s linear infinite', display:'inline-block' }}>⚙️</div>
              <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:600, color:'var(--text-1)', marginBottom:'6px' }}>Analysing your profile…</p>
              <p style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>Comparing your skills with job requirements</p>
            </div>
          )}

          {error && (
            <div style={{ background:'var(--red-bg)', borderRadius:'12px', padding:'16px', textAlign:'center' }}>
              <p style={{ color:'var(--red)', fontWeight:600, marginBottom:'4px' }}>Analysis failed</p>
              <p style={{ fontSize:'0.8rem', color:'var(--red)', opacity:0.8 }}>{error}</p>
            </div>
          )}

          {result && !loading && (
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

              {/* Score circle + verdict */}
              <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
                <div style={{
                  width:'80px', height:'80px', borderRadius:'50%',
                  border:`4px solid ${scoreColor}`,
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  background:'var(--bg-raised)', flexShrink:0,
                  boxShadow:`0 0 0 8px ${scoreColor}18`,
                }}>
                  <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.4rem', fontWeight:800, color:scoreColor, lineHeight:1 }}>
                    {result.score}
                  </span>
                  <span style={{ fontSize:'0.6rem', fontWeight:600, color:'var(--text-3)' }}>/ 100</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:verdictBg.bg, border:`1.5px solid ${verdictBg.border}`, borderRadius:'999px', padding:'5px 14px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'0.85rem', fontWeight:800, color:verdictBg.color }}>{result.verdict}</span>
                  </div>
                  <p style={{ fontSize:'0.85rem', lineHeight:1.65, color:'var(--text-2)' }}>{result.recommendation}</p>
                </div>
              </div>

              {/* Skills match */}
              {(result.matched_skills?.length > 0 || result.missing_skills?.length > 0) && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  {result.matched_skills?.length > 0 && (
                    <div style={{ background:'var(--green-bg)', border:'1.5px solid rgba(22,163,74,0.15)', borderRadius:'12px', padding:'14px' }}>
                      <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--green)', marginBottom:'10px' }}>✓ Matched Skills</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                        {result.matched_skills.map(s => (
                          <span key={s} style={{ fontSize:'0.72rem', fontWeight:600, background:'rgba(22,163,74,0.15)', color:'var(--green)', borderRadius:'6px', padding:'3px 8px' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.missing_skills?.length > 0 && (
                    <div style={{ background:'var(--red-bg)', border:'1.5px solid rgba(220,38,38,0.15)', borderRadius:'12px', padding:'14px' }}>
                      <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--red)', marginBottom:'10px' }}>✗ Missing Skills</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                        {result.missing_skills.map(s => (
                          <span key={s} style={{ fontSize:'0.72rem', fontWeight:600, background:'rgba(220,38,38,0.12)', color:'var(--red)', borderRadius:'6px', padding:'3px 8px' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <div>
                  <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-1)', marginBottom:'8px' }}>💪 Strengths</p>
                  <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:'6px' }}>
                    {result.strengths.map((s,i) => (
                      <li key={i} style={{ display:'flex', gap:'8px', fontSize:'0.82rem', color:'var(--text-2)' }}>
                        <span style={{ color:'var(--green)', fontWeight:700, flexShrink:0 }}>→</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {result.gaps?.length > 0 && (
                <div>
                  <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-1)', marginBottom:'8px' }}>📌 Areas to Improve</p>
                  <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:'6px' }}>
                    {result.gaps.map((g,i) => (
                      <li key={i} style={{ display:'flex', gap:'8px', fontSize:'0.82rem', color:'var(--text-2)' }}>
                        <span style={{ color:'var(--amber)', fontWeight:700, flexShrink:0 }}>→</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tip */}
              {result.tip && (
                <div style={{ background:'var(--brand-bg)', border:'1.5px solid var(--brand-border)', borderRadius:'12px', padding:'14px', display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'1rem', flexShrink:0 }}>💡</span>
                  <p style={{ fontSize:'0.82rem', color:'var(--brand)', fontWeight:500, lineHeight:1.6, margin:0 }}>{result.tip}</p>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display:'flex', gap:'10px', paddingTop:'4px' }}>
                {!applied ? (
                  <button onClick={onApply} className="btn-primary" style={{ flex:1, padding:'12px', fontSize:'0.9rem' }}>
                    Apply Anyway →
                  </button>
                ) : (
                  <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'var(--green-bg)', borderRadius:'12px', padding:'12px', fontSize:'0.875rem', fontWeight:700, color:'var(--green)' }}>
                    ✓ Already Applied
                  </div>
                )}
                <button onClick={onClose} className="btn-ghost" style={{ padding:'12px 20px' }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

// ── List section ──────────────────────────────────────────────────────────────
function ListSection({ title, items, dotColor }) {
  if (!items?.length) return null
  return (
    <section style={{ marginBottom:'28px' }}>
      <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)', marginBottom:'12px' }}>{title}</h3>
      <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:'8px' }}>
        {items.map((item,i) => (
          <li key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:dotColor||'var(--brand)', flexShrink:0, marginTop:'7px' }}/>
            <span style={{ fontSize:'0.875rem', lineHeight:1.65, color:'var(--text-2)' }}>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function JobDetail({ job, onApply, applied, onClose, userId }) {
  if (!job) return null

  const [aiResult,  setAiResult]  = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError,   setAiError]   = useState(null)
  const [showAI,    setShowAI]    = useState(false)

  const p      = palette(job.company)
  const skills = job.skills_required.split(',').map(s=>s.trim())
  const resp   = job.responsibilities?.split('|').map(s=>s.trim()).filter(Boolean) || []
  const quals  = job.qualifications?.split('|').map(s=>s.trim()).filter(Boolean) || []
  const steps  = job.interview_steps?.split('|').map(s=>s.trim()).filter(Boolean) || []

  async function handleCheckFit() {
    setShowAI(true)
    setAiLoading(true)
    setAiError(null)
    setAiResult(null)
    try {
      const res  = await fetch(`${API}/check-resume-fit?user_id=${userId}&job_id=${job.id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail||'Analysis failed.')
      setAiResult(data)
    } catch(e) {
      setAiError(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  function handleApplyFromAI() {
    setShowAI(false)
    onApply(job.id)
  }

  return (
    <>
      <div style={{
        display:'flex', flexDirection:'column', height:'100%',
        background:'var(--bg-card)',
        border:'1.5px solid var(--border)',
        borderRadius:'18px',
        overflow:'hidden',
        boxShadow:'var(--shadow-2)',
        animation:'scaleIn 0.2s ease',
      }}>
        {/* ── Header ── */}
        <div style={{ background:'var(--bg-card)', borderBottom:'1px solid var(--border)', padding:'22px 24px 18px', flexShrink:0 }}>
          {/* Company + close */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', marginBottom:'16px' }}>
            <div style={{ display:'flex', gap:'14px', alignItems:'center' }}>
              <div style={{ width:'54px', height:'54px', borderRadius:'14px', background:p.bg, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.4rem', fontWeight:800, color:p.icon, boxShadow:'var(--shadow-2)' }}>
                {job.company[0]}
              </div>
              <div>
                <h2 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.25rem', fontWeight:800, color:'var(--text-1)', marginBottom:'2px' }}>{job.company}</h2>
                <p style={{ fontSize:'0.875rem', color:'var(--text-2)' }}>{job.role}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width:'32px', height:'32px', borderRadius:'8px', flexShrink:0, background:'var(--bg-raised)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-3)', transition:'all 0.15s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--red-bg)';e.currentTarget.style.color='var(--red)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-raised)';e.currentTarget.style.color='var(--text-3)'}}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Meta pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'16px' }}>
            {[
              { icon:'📍', text:job.location, bg:'var(--bg-raised)', color:'var(--text-2)' },
              { icon:'📅', text:fmtLong(job.date), bg:'var(--amber-bg)', color:'var(--amber)' },
              { icon:'🕒', text:job.walkin_time, bg:'var(--bg-raised)', color:'var(--text-2)' },
              { icon:'💰', text:job.avg_salary, bg:'var(--green-bg)', color:'var(--green)', bold:true },
            ].map(item=>(
              <span key={item.text} style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'0.75rem', fontWeight:item.bold?700:500, background:item.bg, color:item.color, borderRadius:'999px', padding:'5px 12px' }}>
                {item.icon} {item.text}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:'10px' }}>
            {applied ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', gap:'10px', background:'var(--green-bg)', borderRadius:'12px', padding:'12px 16px', border:'1.5px solid rgba(22,163,74,0.2)' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--green)' }}>Application submitted!</p>
                  <p style={{ fontSize:'0.75rem', color:'var(--green)', opacity:0.8 }}>Check My Schedule to track this interview</p>
                </div>
              </div>
            ) : (
              <>
                {/* AI check button */}
                <button onClick={handleCheckFit} style={{
                  display:'flex', alignItems:'center', gap:'7px',
                  background:'var(--brand-bg)', color:'var(--brand)',
                  border:'1.5px solid var(--brand-border)',
                  borderRadius:'12px', padding:'12px 16px',
                  fontSize:'0.85rem', fontWeight:700, cursor:'pointer',
                  transition:'all 0.15s ease', whiteSpace:'nowrap',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.background='var(--brand)';e.currentTarget.style.color='white'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='var(--brand-bg)';e.currentTarget.style.color='var(--brand)'}}>
                  🤖 Check Fit
                </button>
                {/* Apply button */}
                <button onClick={()=>onApply(job.id)} className="btn-primary" style={{ flex:1, padding:'12px', fontSize:'0.95rem' }}>
                  Apply for Walk-in at {job.company} →
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>

          {job.company_about && (
            <section style={{ marginBottom:'28px' }}>
              <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)', marginBottom:'10px' }}>🏢 About {job.company}</h3>
              <p style={{ fontSize:'0.875rem', lineHeight:1.75, color:'var(--text-2)' }}>{job.company_about}</p>
            </section>
          )}

          {job.job_description && (
            <section style={{ marginBottom:'28px' }}>
              <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)', marginBottom:'10px' }}>📋 About the Role</h3>
              <p style={{ fontSize:'0.875rem', lineHeight:1.75, color:'var(--text-2)' }}>{job.job_description}</p>
            </section>
          )}

          <ListSection title="✅ Responsibilities" items={resp} dotColor="var(--brand)" />
          <ListSection title="🎓 Qualifications"  items={quals} dotColor="var(--text-3)" />

          {/* Skills */}
          <section style={{ marginBottom:'28px' }}>
            <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)', marginBottom:'12px' }}>🛠 Required Skills</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {skills.map(s=>(
                <span key={s} style={{ fontSize:'0.775rem', fontWeight:600, background:'var(--brand-bg)', color:'var(--brand)', border:'1.5px solid var(--brand-border)', borderRadius:'8px', padding:'5px 12px' }}>{s}</span>
              ))}
            </div>
          </section>

          {/* Walk-in + Location */}
          <section style={{ marginBottom:'28px' }}>
            <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)', marginBottom:'12px' }}>📍 Walk-in Details & Venue</h3>
            <div style={{ background:'var(--amber-bg)', borderRadius:'14px', border:'1.5px solid rgba(217,119,6,0.15)', padding:'16px', marginBottom:'12px' }}>
              {[
                ['Date',    fmtLong(job.date)],
                ['Time',    job.walkin_time],
                ['Package', job.avg_salary],
              ].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid rgba(217,119,6,0.1)' }}>
                  <span style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--amber)' }}>{l}</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:700, color:l==='Package'?'var(--green)':'var(--text-1)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Location with URL */}
            <div style={{ background:'var(--bg-raised)', borderRadius:'14px', border:'1.5px solid var(--border)', padding:'16px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px' }}>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-3)', marginBottom:'6px' }}>
                    📍 Venue Address
                  </p>
                  {job.location_desc ? (
                    <p style={{ fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.6 }}>{job.location_desc}</p>
                  ) : (
                    <p style={{ fontSize:'0.85rem', color:'var(--text-2)' }}>{job.company} Office, {job.location}</p>
                  )}
                </div>
                {/* Google Maps button */}
                {job.location_url ? (
                  <a href={job.location_url} target="_blank" rel="noopener noreferrer" style={{
                    flexShrink:0, display:'flex', alignItems:'center', gap:'6px',
                    background:'#1A73E8', color:'white',
                    borderRadius:'10px', padding:'9px 14px',
                    fontSize:'0.8rem', fontWeight:700,
                    textDecoration:'none', whiteSpace:'nowrap',
                    boxShadow:'0 2px 8px rgba(26,115,232,0.3)',
                    transition:'all 0.15s ease',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background='#1557B0'}
                    onMouseLeave={e=>e.currentTarget.style.background='#1A73E8'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Open in Maps
                  </a>
                ) : (
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(job.company+' '+job.location)}`} target="_blank" rel="noopener noreferrer" style={{
                    flexShrink:0, display:'flex', alignItems:'center', gap:'6px',
                    background:'var(--bg-card)', color:'var(--text-2)',
                    border:'1.5px solid var(--border)',
                    borderRadius:'10px', padding:'9px 14px',
                    fontSize:'0.8rem', fontWeight:600,
                    textDecoration:'none', whiteSpace:'nowrap',
                    transition:'all 0.15s ease',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Search Maps
                  </a>
                )}
              </div>
            </div>

            <p style={{ fontSize:'0.72rem', color:'var(--text-3)', marginTop:'10px', lineHeight:1.6 }}>
              📎 Carry: Resume (3 copies) · Photo ID · Educational certificates · Passport photos
            </p>
          </section>

          {/* Interview process */}
          {steps.length > 0 && (
            <section style={{ marginBottom:'28px' }}>
              <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'0.95rem', fontWeight:700, color:'var(--text-1)', marginBottom:'16px' }}>🗺 Interview Process</h3>
              <div style={{ position:'relative', paddingLeft:'44px' }}>
                <div style={{ position:'absolute', left:'15px', top:'8px', bottom:'8px', width:'2px', background:'var(--border)' }}/>
                {steps.map((step,i)=>(
                  <div key={i} style={{ position:'relative', marginBottom:'16px' }}>
                    <div style={{ position:'absolute', left:'-44px', width:'30px', height:'30px', borderRadius:'50%', background:'var(--brand-bg)', border:'2px solid var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:800, color:'var(--brand)' }}>
                      {String(i+1).padStart(2,'0')}
                    </div>
                    <p style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-1)', paddingTop:'4px' }}>{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ background:'var(--bg-raised)', borderRadius:'12px', padding:'14px', marginTop:'8px' }}>
            <p style={{ fontSize:'0.75rem', color:'var(--text-3)', lineHeight:1.65, margin:0 }}>
              <strong style={{ color:'var(--text-2)' }}>Equal Opportunity:</strong>{' '}
              {job.company} welcomes candidates from all backgrounds. Selection is based purely on skills and merit.
            </p>
          </div>
        </div>
      </div>

      {/* AI Modal */}
      {showAI && (
        <AIFitModal
          result={aiResult}
          loading={aiLoading}
          error={aiError}
          onClose={()=>setShowAI(false)}
          onApply={handleApplyFromAI}
          applied={applied}
        />
      )}
    </>
  )
}
