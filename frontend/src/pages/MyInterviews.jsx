import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const API = 'http://localhost:8000'
const PALETTES = [
  ['#4F6EF7','#EEF1FE'],['#7C3AED','#F5F3FF'],['#0EA5E9','#E0F2FE'],
  ['#059669','#ECFDF5'],['#D97706','#FFFBEB'],['#DB2777','#FDF2F8'],
  ['#DC2626','#FEF2F2'],['#0891B2','#ECFEFF'],['#16A34A','#F0FDF4'],
]
function pal(n) { return PALETTES[n.charCodeAt(0)%PALETTES.length] }

const STATUS = {
  applied:   { label:'Upcoming',  bg:'var(--brand-bg)', color:'var(--brand)', dot:'var(--brand)' },
  attended:  { label:'Attended',  bg:'var(--green-bg)', color:'var(--green)', dot:'var(--green)' },
  cancelled: { label:'Cancelled', bg:'var(--red-bg)',   color:'var(--red)',   dot:'var(--red)'   },
}

function fmtWalkin(iso) {
  const today = new Date(); today.setHours(0,0,0,0)
  const tom   = new Date(today); tom.setDate(today.getDate()+1)
  const d     = new Date(iso)
  if (d.toDateString()===today.toDateString()) return { label:'Today',    urgent:true  }
  if (d.toDateString()===tom.toDateString())   return { label:'Tomorrow', urgent:false }
  return { label: d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}), urgent:false }
}

export default function MyInterviews() {
  const { user } = useAuth()
  const [apps,    setApps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState(null)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    fetch(`${API}/my-applications?user_id=${user.id}`)
      .then(r=>r.json()).then(setApps).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  async function handleStatus(id, status) {
    try {
      await fetch(`${API}/application/${id}/status`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status}) })
      setApps(p=>p.map(a=>a.app_id===id?{...a,status}:a))
      showToast(`Marked as ${status}`, 'success')
    } catch { showToast('Update failed.','error') }
  }

  function showToast(msg,type) { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const total=apps.length, upcoming=apps.filter(a=>a.status==='applied').length
  const attended=apps.filter(a=>a.status==='attended').length, cancelled=apps.filter(a=>a.status==='cancelled').length
  const filtered = filter==='all' ? apps : apps.filter(a => filter==='applied' ? a.status==='applied' : filter==='attended' ? a.status==='attended' : a.status==='cancelled')

  const tabs = [
    { key:'all', label:'All', count:total, color:'var(--brand)' },
    { key:'applied', label:'Upcoming', count:upcoming, color:'var(--amber)' },
    { key:'attended', label:'Attended', count:attended, color:'var(--green)' },
    { key:'cancelled', label:'Cancelled', count:cancelled, color:'var(--red)' },
  ]

  return (
    <div style={{ background:'var(--bg)', minHeight:'calc(100vh - 56px)', padding:'32px 20px' }}>
      <div style={{ maxWidth:'860px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:'28px' }}>
          <h1 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.7rem', fontWeight:800, color:'var(--text-1)', marginBottom:'6px' }}>
            My Interview Schedule
          </h1>
          <p style={{ fontSize:'0.875rem', color:'var(--text-3)' }}>
            Track every walk-in you've applied to. Update status after attending.
          </p>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
            {tabs.map(t => (
              <div key={t.key} onClick={()=>setFilter(t.key)} style={{
                background:'var(--bg-card)', border:`1.5px solid ${filter===t.key ? t.color : 'var(--border)'}`,
                borderRadius:'14px', padding:'16px', textAlign:'center', cursor:'pointer',
                transition:'all 0.15s ease',
                boxShadow: filter===t.key ? `0 0 0 3px ${t.color}20, var(--shadow-1)` : 'var(--shadow-1)',
              }}>
                <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'2rem', fontWeight:800, color:t.color, lineHeight:1 }}>{t.count}</p>
                <p style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:'5px' }}>{t.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={()=>setFilter(t.key)} style={{
              display:'inline-flex', alignItems:'center', gap:'7px',
              padding:'7px 16px', borderRadius:'999px', border:'1.5px solid',
              borderColor: filter===t.key ? t.color : 'var(--border)',
              fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
              background: filter===t.key ? t.color : 'var(--bg-card)',
              color: filter===t.key ? 'white' : 'var(--text-2)',
              transition:'all 0.15s ease',
            }}>
              {t.label}
              <span style={{ background: filter===t.key?'rgba(255,255,255,0.25)':'var(--bg-raised)', color: filter===t.key?'white':'var(--text-3)', borderRadius:'999px', padding:'0 6px', fontSize:'0.7rem', fontWeight:700 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {Array.from({length:3}).map((_,i)=><div key={i} className="skeleton" style={{height:'110px',animationDelay:`${i*0.1}s`}}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', background:'var(--bg-card)', borderRadius:'18px', border:'1.5px solid var(--border)' }}>
            <p style={{ fontSize:'2.5rem', marginBottom:'12px' }}>📭</p>
            <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:600, color:'var(--text-1)', marginBottom:'6px' }}>
              {filter==='all' ? "You haven't applied to any interviews yet" : `No ${filter} interviews`}
            </p>
            <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginBottom:'20px' }}>
              {filter==='all' ? 'Head to the Interviews page and start applying!' : 'Try a different filter'}
            </p>
            {filter==='all' && <Link to="/dashboard" className="btn-primary" style={{ padding:'10px 24px', fontSize:'0.875rem' }}>Browse Interviews</Link>}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {filtered.map(app => {
              const st     = STATUS[app.status]||STATUS.applied
              const walkin = fmtWalkin(app.date)
              const [ic, ib] = pal(app.company)
              return (
                <div key={app.app_id} style={{
                  background:'var(--bg-card)', border:'1.5px solid var(--border)',
                  borderRadius:'16px', padding:'18px',
                  opacity: app.status==='cancelled' ? 0.55 : 1,
                  boxShadow:'var(--shadow-1)',
                  transition:'all 0.15s ease',
                }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>

                    {/* Left */}
                    <div style={{ display:'flex', gap:'12px', flex:1, minWidth:0 }}>
                      <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:ib, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1rem', fontWeight:800, color:ic }}>
                        {app.company[0]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px', marginBottom:'5px' }}>
                          <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, color:'var(--text-1)' }}>{app.company}</span>
                          <span style={{ color:'var(--border)' }}>·</span>
                          <span style={{ fontSize:'0.85rem', color:'var(--text-2)' }}>{app.role}</span>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'0.7rem', fontWeight:700, background:st.bg, color:st.color, borderRadius:'999px', padding:'2px 10px' }}>
                            <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:st.dot, display:'inline-block' }}/>
                            {st.label}
                          </span>
                          {walkin.urgent && (
                            <span style={{ fontSize:'0.7rem', fontWeight:700, background:'var(--amber-bg)', color:'var(--amber)', borderRadius:'999px', padding:'2px 10px', animation:'pulse 2s infinite' }}>
                              🔥 TODAY
                            </span>
                          )}
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'14px', marginBottom:'10px' }}>
                          {[`📍 ${app.location}`, `📅 Walk-in: ${walkin.label}`, `🕒 Applied ${new Date(app.applied_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`].map(t=>(
                            <span key={t} style={{ fontSize:'0.75rem', color: t.includes('TODAY')||walkin.urgent&&t.includes('Walk') ? 'var(--amber)' : 'var(--text-3)' }}>{t}</span>
                          ))}
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                          {app.skills_required.split(',').map(s=>(
                            <span key={s} style={{ fontSize:'0.68rem', fontWeight:500, background:'var(--bg-raised)', color:'var(--text-3)', borderRadius:'6px', padding:'2px 8px', border:'1px solid var(--border)' }}>{s.trim()}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'7px', flexShrink:0 }}>
                      {app.status==='applied' && (
                        <button onClick={()=>handleStatus(app.app_id,'attended')} className="btn-soft" style={{ padding:'7px 14px', fontSize:'0.8rem', background:'var(--green-bg)', color:'var(--green)', border:'1.5px solid rgba(22,163,74,0.2)' }}>
                          ✓ Attended
                        </button>
                      )}
                      {app.status==='attended' && (
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.8rem', fontWeight:600, color:'var(--green)', background:'var(--green-bg)', borderRadius:'10px', padding:'7px 14px' }}>
                          ✅ Attended
                        </div>
                      )}
                      {app.status!=='cancelled' && (
                        <button onClick={()=>handleStatus(app.app_id,'cancelled')} style={{ background:'transparent', color:'var(--text-3)', border:'1.5px solid var(--border)', borderRadius:'10px', padding:'7px 14px', fontSize:'0.78rem', fontWeight:500, cursor:'pointer', transition:'all 0.15s ease' }}
                          onMouseEnter={e=>{e.currentTarget.style.color='var(--red)';e.currentTarget.style.borderColor='rgba(220,38,38,0.3)'}}
                          onMouseLeave={e=>{e.currentTarget.style.color='var(--text-3)';e.currentTarget.style.borderColor='var(--border)'}}>
                          Cancel
                        </button>
                      )}
                      {app.status==='cancelled' && (
                        <button onClick={()=>handleStatus(app.app_id,'applied')} className="btn-ghost" style={{ padding:'7px 14px', fontSize:'0.78rem' }}>
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', zIndex:100, background:toast.type==='success'?'#16A34A':'#DC2626', color:'white', borderRadius:'999px', padding:'10px 22px', fontSize:'0.875rem', fontWeight:600, boxShadow:'var(--shadow-3)', animation:'slideUp 0.25s ease' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
