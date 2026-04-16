import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const API  = 'http://localhost:8000'
const ALL  = ['python','java','sql','html','css','c++','javascript','react','django','spring','node','typescript','docker','kubernetes','redis','kafka','linux','excel','tableau']

export default function ResumeUpload() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const fileRef  = useRef()
  const [file,      setFile]      = useState(null)
  const [skills,    setSkills]    = useState(user.skills?user.skills.split(',').map(s=>s.trim()).filter(Boolean):[])
  const [uploading, setUploading] = useState(false)
  const [done,      setDone]      = useState(!!user.skills)
  const [error,     setError]     = useState('')
  const [dragging,  setDragging]  = useState(false)

  function isValidFile(f) {
    if (!f) return false
    const name = f.name.toLowerCase()
    const type = f.type
    return (
      type === 'application/pdf' ||
      type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      type === 'application/msword' ||
      name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc')
    )
  }

  function handleDrop(e) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (isValidFile(f)) { setFile(f); setError('') }
    else setError('Please drop a PDF or Word document (.pdf, .docx, .doc)')
  }

  async function handleUpload() {
    if (!file) return setError('Please select a PDF file first.')
    setUploading(true); setError('')
    try {
      const fd = new FormData(); fd.append('file', file)
      const res  = await fetch(`${API}/upload-resume?user_id=${user.id}`, { method:'POST', body:fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail||'Upload failed.')
      setSkills(data.skills); setDone(true)
      login({ ...user, skills: data.skills.join(',') })
    } catch(e) { setError(e.message) } finally { setUploading(false) }
  }

  return (
    <div style={{ background:'var(--bg)', minHeight:'calc(100vh - 56px)', padding:'40px 20px' }}>
      <div style={{ maxWidth:'580px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:'32px' }}>
          <h1 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.7rem', fontWeight:800, color:'var(--text-1)', marginBottom:'6px' }}>
            Resume Upload
          </h1>
          <p style={{ fontSize:'0.875rem', color:'var(--text-3)' }}>
            Upload your PDF or Word (.docx) resume — we'll extract your skills and personalise job matches.
          </p>
        </div>

        {/* Extracted skills */}
        {skills.length > 0 && (
          <div style={{ background:'var(--bg-card)', border:'1.5px solid var(--border)', borderRadius:'18px', padding:'22px', marginBottom:'20px', boxShadow:'var(--shadow-2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)' }}>
                {done ? '✨ Extracted skills' : 'Your skills'}
              </p>
              <span style={{ fontSize:'0.7rem', fontWeight:600, background:'var(--brand-bg)', color:'var(--brand)', borderRadius:'999px', padding:'2px 10px' }}>
                {skills.length} found
              </span>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {skills.map(s => (
                <span key={s} style={{ fontSize:'0.8rem', fontWeight:600, background:'var(--brand-bg)', color:'var(--brand)', border:'1.5px solid var(--brand-border)', borderRadius:'8px', padding:'5px 14px' }}>
                  {s}
                </span>
              ))}
            </div>
            {done && (
              <button onClick={()=>navigate('/dashboard')} className="btn-primary" style={{ marginTop:'20px', width:'100%', padding:'12px', fontSize:'0.95rem' }}>
                View Matched Interviews →
              </button>
            )}
          </div>
        )}

        {/* Upload area */}
        <div style={{ background:'var(--bg-card)', border:'1.5px solid var(--border)', borderRadius:'18px', padding:'24px', boxShadow:'var(--shadow-1)' }}>
          {/* Drop zone */}
          <div
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={handleDrop}
            onClick={()=>fileRef.current.click()}
            style={{
              border:`2px dashed ${dragging?'var(--brand)':'var(--border-strong)'}`,
              borderRadius:'14px', padding:'36px 20px', textAlign:'center', cursor:'pointer',
              background: dragging?'var(--brand-bg)':'var(--bg-raised)',
              transition:'all 0.18s ease',
            }}
          >
            <div style={{ fontSize:'2.5rem', marginBottom:'10px' }}>{file ? '📄' : '☁️'}</div>
            {file ? (
              <>
                <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:600, color:'var(--text-1)', fontSize:'0.9rem' }}>{file.name}</p>
                <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginTop:'4px' }}>{(file.size/1024).toFixed(0)} KB · Click to change</p>
              </>
            ) : (
              <>
                <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:600, color:'var(--text-1)' }}>Drop your resume here</p>
                <p style={{ fontSize:'0.8rem', color:'var(--text-3)', marginTop:'4px' }}>PDF, DOCX, or DOC · Click to browse</p>
                <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginTop:'12px' }}>
                  {['PDF', 'DOCX', 'DOC'].map(fmt => (
                    <span key={fmt} style={{ fontSize:'0.68rem', fontWeight:700, background:'var(--bg-card)', border:'1.5px solid var(--border)', borderRadius:'6px', padding:'3px 10px', color:'var(--text-3)' }}>{fmt}</span>
                  ))}
                </div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword" style={{ display:'none' }} onChange={e=>{const f=e.target.files[0]; if(f){setFile(f);setError('')}}}/>

          {error && (
            <div style={{ background:'var(--red-bg)', border:'1.5px solid rgba(220,38,38,0.2)', borderRadius:'10px', padding:'10px 14px', fontSize:'0.82rem', color:'var(--red)', marginTop:'14px', fontWeight:500 }}>
              {error}
            </div>
          )}

          <button onClick={handleUpload} disabled={!file||uploading} className="btn-primary" style={{ marginTop:'16px', width:'100%', padding:'12px', fontSize:'0.95rem' }}>
            {uploading ? '⏳ Extracting your skills…' : '🚀 Upload & Extract Skills'}
          </button>
        </div>

        {/* Skills reference */}
        <div style={{ background:'var(--bg-card)', border:'1.5px solid var(--border)', borderRadius:'18px', padding:'22px', marginTop:'20px' }}>
          <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', marginBottom:'14px' }}>
            Skills we automatically detect
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
            {ALL.map(s => {
              const has = skills.includes(s)
              return (
                <span key={s} style={{
                  fontSize:'0.75rem', fontWeight: has?700:400,
                  borderRadius:'8px', padding:'4px 12px',
                  background: has ? 'var(--brand-bg)' : 'var(--bg-raised)',
                  color: has ? 'var(--brand)' : 'var(--text-3)',
                  border: `1.5px solid ${has ? 'var(--brand-border)' : 'var(--border)'}`,
                  transition:'all 0.15s ease',
                }}>{s}</span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
