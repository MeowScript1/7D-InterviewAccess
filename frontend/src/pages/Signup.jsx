import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

const API = 'http://localhost:8000'

export default function Signup() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ name:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name||!form.email||!form.password) return setError('All fields are required.')
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail||'Signup failed.')
      login(data.user); navigate('/dashboard')
    } catch(e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ position:'fixed', top:'16px', right:'16px' }}><ThemeToggle /></div>

      <div style={{ width:'100%', maxWidth:'420px' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginBottom:'36px' }}>
          <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg, var(--brand), var(--brand-2))', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.78rem', fontWeight:800, color:'white', boxShadow:'var(--shadow-brand)' }}>7D</div>
          <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, fontSize:'1rem', color:'var(--text-1)' }}>InterviewAccess</span>
        </Link>

        <div style={{ background:'var(--bg-card)', border:'1.5px solid var(--border)', borderRadius:'20px', padding:'36px', boxShadow:'var(--shadow-3)' }}>
          <h1 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.6rem', fontWeight:800, color:'var(--text-1)', marginBottom:'6px' }}>
            Create your account 🚀
          </h1>
          <p style={{ fontSize:'0.875rem', color:'var(--text-3)', marginBottom:'32px' }}>
            7 days of unlimited walk-in interview access — free.
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            {[
              { name:'name',     label:'Full Name',      type:'text',     placeholder:'Jagmit Singh' },
              { name:'email',    label:'Email address',  type:'email',    placeholder:'you@email.com' },
              { name:'password', label:'Password',       type:'password', placeholder:'Min 6 characters' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--text-2)', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{f.label}</label>
                <input type={f.type} value={form[f.name]} onChange={e=>setForm(p=>({...p,[f.name]:e.target.value}))}
                  className="input" placeholder={f.placeholder} required/>
              </div>
            ))}

            {error && (
              <div style={{ background:'var(--red-bg)', border:'1.5px solid rgba(220,38,38,0.2)', borderRadius:'10px', padding:'10px 14px', fontSize:'0.82rem', color:'var(--red)', fontWeight:500 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ padding:'13px', fontSize:'0.95rem', marginTop:'6px' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.875rem', color:'var(--text-3)', marginTop:'20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--brand)', fontWeight:600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
