import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle.jsx'

const FEATURES = [
  { icon:'⚡', title:'Instant Matching', desc:'Your skills are matched against every open walk-in the moment you upload your resume.' },
  { icon:'♾️', title:'No Limits', desc:'Apply to as many interviews as you want. There is no daily or weekly cap — ever.' },
  { icon:'📅', title:'7-Day Window', desc:'Full access for a week. Enough time to attend multiple interviews and land an offer.' },
  { icon:'🎯', title:'Walk-in Ready', desc:'Every listing includes the exact date, time, and venue. Just show up.' },
]

const COMPANIES = ['Google','Amazon','Microsoft','Flipkart','Razorpay','Swiggy','Dream11','Zerodha','PhonePe','Zomato']

export default function Landing() {
  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>

      {/* Nav */}
      <header style={{ background:'var(--bg-card)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{
              width:'32px', height:'32px',
              background:'linear-gradient(135deg, var(--brand), var(--brand-2))',
              borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.72rem', fontWeight:800, color:'white',
              boxShadow:'var(--shadow-brand)',
            }}>7D</div>
            <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, color:'var(--text-1)' }}>
              InterviewAccess
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <ThemeToggle />
            <Link to="/login"  className="btn-ghost" style={{ padding:'7px 16px', fontSize:'0.85rem' }}>Login</Link>
            <Link to="/signup" className="btn-primary" style={{ padding:'7px 18px', fontSize:'0.85rem' }}>Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section style={{ textAlign:'center', padding:'88px 24px 72px', maxWidth:'700px', margin:'0 auto' }}>
          {/* Label */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            background:'var(--brand-bg)', color:'var(--brand)',
            border:'1.5px solid var(--brand-border)',
            borderRadius:'999px', padding:'6px 16px',
            fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.05em',
            marginBottom:'28px',
          }}>
            🚀 Unlimited Walk-ins · 7 Days Only
          </div>

          <h1 style={{
            fontFamily:'Bricolage Grotesque, sans-serif',
            fontSize:'clamp(2.8rem,7vw,4.5rem)',
            fontWeight:800, lineHeight:1.08,
            color:'var(--text-1)', marginBottom:'22px',
            letterSpacing:'-0.02em',
          }}>
            Unlimited Interviews
            <br/>
            <span style={{ color:'var(--brand)' }}>for 7 Days</span>
          </h1>

          <p style={{ fontSize:'1.1rem', color:'var(--text-2)', lineHeight:1.7, maxWidth:'480px', margin:'0 auto 40px' }}>
            Every walk-in interview matched to your skills. No limits, no waiting lists. Apply to as many as you want — all in one place.
          </p>

          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'12px' }}>
            <Link to="/signup" className="btn-primary" style={{ padding:'14px 36px', fontSize:'1rem' }}>
              Start Free →
            </Link>
            <Link to="/login" className="btn-ghost" style={{ padding:'14px 28px', fontSize:'1rem' }}>
              I already have an account
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'16px', marginTop:'56px' }}>
            {[
              { n:'20+', l:'Walk-in Interviews' },
              { n:'∞',   l:'Daily Applications' },
              { n:'7',   l:'Days Access' },
              { n:'10+', l:'Top Companies' },
            ].map(s => (
              <div key={s.l} style={{
                background:'var(--bg-card)', border:'1.5px solid var(--border)',
                borderRadius:'14px', padding:'16px 24px', textAlign:'center',
                boxShadow:'var(--shadow-1)', minWidth:'110px',
              }}>
                <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.8rem', fontWeight:800, color:'var(--brand)', lineHeight:1 }}>{s.n}</p>
                <p style={{ fontSize:'0.72rem', fontWeight:500, color:'var(--text-3)', marginTop:'4px' }}>{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ background:'var(--bg-card)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'64px 24px' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <p style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.6rem', fontWeight:800, textAlign:'center', color:'var(--text-1)', marginBottom:'44px' }}>
              Everything you need to land the job
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px' }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{
                  background:'var(--bg)', border:'1.5px solid var(--border)',
                  borderRadius:'16px', padding:'24px',
                  transition:'all 0.18s ease',
                }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--brand)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='var(--shadow-2)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none' }}
                >
                  <p style={{ fontSize:'1.8rem', marginBottom:'12px' }}>{f.icon}</p>
                  <h3 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, color:'var(--text-1)', marginBottom:'8px', fontSize:'0.95rem' }}>{f.title}</h3>
                  <p style={{ fontSize:'0.85rem', color:'var(--text-2)', lineHeight:1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Companies marquee */}
        <section style={{ padding:'56px 24px', textAlign:'center' }}>
          <p style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--text-3)', marginBottom:'24px' }}>
            Walk-ins from these companies
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'10px', maxWidth:'700px', margin:'0 auto' }}>
            {COMPANIES.map(c => (
              <span key={c} style={{
                background:'var(--bg-card)', border:'1.5px solid var(--border)',
                borderRadius:'999px', padding:'7px 18px',
                fontSize:'0.875rem', fontWeight:500, color:'var(--text-2)',
                boxShadow:'var(--shadow-1)',
              }}>{c}</span>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section style={{ padding:'0 24px 72px' }}>
          <div style={{
            maxWidth:'700px', margin:'0 auto',
            background:'linear-gradient(135deg, var(--brand-bg), var(--bg-card))',
            border:'1.5px solid var(--brand-border)',
            borderRadius:'24px', padding:'48px 40px',
            textAlign:'center',
          }}>
            <h2 style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontSize:'1.8rem', fontWeight:800, color:'var(--text-1)', marginBottom:'12px' }}>
              Ready to land your next job?
            </h2>
            <p style={{ fontSize:'0.95rem', color:'var(--text-2)', marginBottom:'28px' }}>
              Sign up free, upload your resume, and start applying to unlimited walk-in interviews today.
            </p>
            <Link to="/signup" className="btn-primary" style={{ padding:'14px 40px', fontSize:'1rem' }}>
              Get 7-Day Access — Free →
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'20px 24px', textAlign:'center' }}>
        <p style={{ fontSize:'0.8rem', color:'var(--text-3)' }}>
          © 2025 7 Day Interview Access · FastAPI + React
          <span style={{ margin:'0 8px', color:'var(--border)' }}>·</span>
          <Link to="/admin" style={{ color:'var(--text-3)', textDecoration:'none' }}>Admin</Link>
        </p>
      </footer>
    </div>
  )
}
