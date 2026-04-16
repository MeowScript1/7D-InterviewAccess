import React from 'react'

const PALETTES = [
  { icon: '#4F6EF7', bg: '#EEF1FE', accent: '#4F6EF7' },
  { icon: '#7C3AED', bg: '#F5F3FF', accent: '#7C3AED' },
  { icon: '#0EA5E9', bg: '#E0F2FE', accent: '#0EA5E9' },
  { icon: '#059669', bg: '#ECFDF5', accent: '#059669' },
  { icon: '#D97706', bg: '#FFFBEB', accent: '#D97706' },
  { icon: '#DB2777', bg: '#FDF2F8', accent: '#DB2777' },
  { icon: '#DC2626', bg: '#FEF2F2', accent: '#DC2626' },
  { icon: '#0891B2', bg: '#ECFEFF', accent: '#0891B2' },
  { icon: '#16A34A', bg: '#F0FDF4', accent: '#16A34A' },
]
function palette(name) { return PALETTES[name.charCodeAt(0) % PALETTES.length] }

function fmtDate(iso) {
  const today = new Date(); today.setHours(0,0,0,0)
  const tom   = new Date(today); tom.setDate(today.getDate()+1)
  const d     = new Date(iso)
  if (d.toDateString()===today.toDateString()) return { label:'Today',    warn:true  }
  if (d.toDateString()===tom.toDateString())   return { label:'Tomorrow', warn:false }
  return { label: d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}), warn:false }
}

export default function JobCard({ job, applied, isTopMatch, isNew, onClick, isSelected }) {
  const p   = palette(job.company)
  const dt  = fmtDate(job.date)
  const today = dt.label === 'Today'

  return (
    <div
      onClick={() => onClick(job)}
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        border: `1.5px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: '14px',
        padding: '14px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(91,94,239,0.12), var(--shadow-2)'
          : 'var(--shadow-1)',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--brand)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = 'var(--shadow-3)'
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = 'var(--shadow-1)'
        }
      }}
    >
      {/* Accent line top */}
      {isSelected && (
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'3px',
          background: 'linear-gradient(90deg, var(--brand), var(--brand-2))',
        }}/>
      )}
      {today && !isSelected && (
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:'3px',
          background: 'linear-gradient(90deg, var(--amber), #FDE68A)',
        }}/>
      )}

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', paddingTop: (today || isSelected) ? '6px' : 0 }}>
        {/* Avatar */}
        <div style={{
          width:'38px', height:'38px', flexShrink:0,
          borderRadius:'10px',
          background: p.bg,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontFamily:'Bricolage Grotesque, sans-serif',
          fontSize:'1rem', fontWeight:800, color: p.icon,
        }}>
          {job.company[0]}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{
              fontFamily:'Bricolage Grotesque, sans-serif',
              fontSize:'0.875rem', fontWeight:700, color:'var(--text-1)',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{job.company}</p>
            <div style={{ display:'flex', gap:'4px', flexShrink:0, marginLeft:'6px' }}>
              {isTopMatch && (
                <span style={{ fontSize:'0.6rem', fontWeight:700, background:'var(--brand-bg)', color:'var(--brand)', border:'1px solid var(--brand-border)', borderRadius:'999px', padding:'1px 7px', whiteSpace:'nowrap' }}>
                  ⚡ Match
                </span>
              )}
              {isNew && (
                <span style={{ fontSize:'0.6rem', fontWeight:700, background:'var(--green-bg)', color:'var(--green)', borderRadius:'999px', padding:'1px 7px' }}>
                  New
                </span>
              )}
              {applied && (
                <span style={{ fontSize:'0.6rem', fontWeight:700, background:'var(--green-bg)', color:'var(--green)', borderRadius:'999px', padding:'1px 7px' }}>
                  ✓
                </span>
              )}
            </div>
          </div>
          <p style={{ fontSize:'0.75rem', color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {job.role}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height:'1px', background:'var(--border)', margin:'10px 0' }}/>

      {/* Info */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px 12px' }}>
        {[
          { k:'Walk-in', v: dt.label,        bold: today, color: today ? 'var(--amber)' : 'var(--text-1)' },
          { k:'Package', v: job.avg_salary,  bold: true,  color: 'var(--green)' },
          { k:'Timing',  v: job.walkin_time, bold: false, color: 'var(--text-2)' },
          { k:'Location',v: job.location,    bold: false, color: 'var(--text-2)' },
        ].map(item => (
          <div key={item.k}>
            <p style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--text-3)', marginBottom:'2px' }}>
              {item.k}
            </p>
            <p style={{
              fontSize:'0.775rem', fontWeight: item.bold ? 700 : 500,
              color: item.color,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>
              {item.v}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
