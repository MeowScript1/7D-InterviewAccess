import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.jsx'

const API = 'http://localhost:8000'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/admin/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      navigate('/admin/dashboard')
    } catch(e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ position:'fixed', top:'16px', right:'16px' }}><ThemeToggle /></div>

      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'48px', height:'48px', background:'linear-gradient(135deg, var(--brand), var(--brand-2))', borderRadius:'14px', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:800, color:'white', boxShadow:'var(--shadow-brand)', marginBottom:'12px' }}>
            7D
          </div>
          <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, color:'var(--text-1)' }}>Admin Portal</p>
          <p style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>InterviewAccess Management</p>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1.5px solid var(--border)', borderRadius:'20px', padding:'32px', boxShadow:'var(--shadow-3)' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            {[
              {name:'email', label:'Admin Email', type:'email', placeholder:'admin@interview.com'},
              {name:'password', label:'Password', type:'password', placeholder:'••••••••'},
            ].map(f=>(
              <div key={f.name}>
                <label style={{ display:'block', fontSize:'0.72rem', fontWeight:700, color:'var(--text-2)', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.07em' }}>{f.label}</label>
                <input type={f.type} value={form[f.name]} onChange={e=>setForm(p=>({...p,[f.name]:e.target.value}))} className="input" placeholder={f.placeholder} required/>
              </div>
            ))}

            {error && <div style={{ background:'var(--red-bg)', borderRadius:'10px', padding:'10px 14px', fontSize:'0.82rem', color:'var(--red)', fontWeight:500 }}>{error}</div>}

            <button type="submit" className="btn-primary" style={{ padding:'12px' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to Admin →'}
            </button>
          </form>

          <div style={{ marginTop:'20px', background:'var(--bg-raised)', borderRadius:'12px', padding:'12px 14px', border:'1px solid var(--border)' }}>
            <p style={{ fontSize:'0.72rem', fontWeight:600, color:'var(--text-3)', marginBottom:'5px' }}>Default credentials</p>
            <p style={{ fontSize:'0.75rem', fontFamily:'monospace', color:'var(--text-2)' }}>admin@interview.com · admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
