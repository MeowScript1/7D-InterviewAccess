import React, { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'
import ThemeToggle from './ThemeToggle.jsx'

function getDayCount(user) {
  // Use user id as seed for signup day (stored in localStorage)
  const key  = `signup_date_${user.id}`
  let stored = localStorage.getItem(key)
  if (!stored) {
    stored = new Date().toISOString()
    localStorage.setItem(key, stored)
  }
  const signupDate = new Date(stored)
  const now        = new Date()
  const diffDays   = Math.floor((now - signupDate) / (1000 * 60 * 60 * 24))
  return Math.min(diffDays + 1, 7) // Day 1 to Day 7
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [day, setDay] = useState(1)

  useEffect(() => {
    if (user) setDay(getDayCount(user))
  }, [user])

  const daysLeft  = 7 - day + 1
  const urgency   = daysLeft <= 2 ? 'red' : daysLeft <= 4 ? 'amber' : 'green'
  const urgencyColors = {
    green: { bg:'var(--green-bg)',   color:'var(--green)',  border:'rgba(22,163,74,0.2)' },
    amber: { bg:'var(--amber-bg)',   color:'var(--amber)',  border:'rgba(217,119,6,0.2)' },
    red:   { bg:'var(--red-bg)',     color:'var(--red)',    border:'rgba(220,38,38,0.2)' },
  }
  const uc = urgencyColors[urgency]

  return (
    <header style={{
      position:'sticky', top:0, zIndex:100,
      background:'var(--bg-card)',
      borderBottom:'1px solid var(--border)',
    }}>
      <div style={{
        maxWidth:'1320px', margin:'0 auto',
        padding:'0 20px', height:'56px',
        display:'flex', alignItems:'center', gap:'16px',
      }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          <div style={{
            width:'30px', height:'30px',
            background:'linear-gradient(135deg, var(--brand), var(--brand-2))',
            borderRadius:'8px',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'0.7rem', fontWeight:800, color:'white',
            boxShadow:'0 2px 8px rgba(91,94,239,0.3)',
          }}>7D</div>
          <span style={{ fontFamily:'Bricolage Grotesque, sans-serif', fontWeight:700, fontSize:'0.9rem', color:'var(--text-1)' }}>
            InterviewAccess
          </span>
        </Link>

        {/* Separator */}
        <div style={{ width:'1px', height:'20px', background:'var(--border)', flexShrink:0 }}/>

        {/* Nav links */}
        <nav style={{ display:'flex', alignItems:'center', gap:'2px', flex:1 }}>
          {[
            { to:'/dashboard',     label:'Interviews' },
            { to:'/my-interviews', label:'My Schedule' },
            { to:'/resume',        label:'Resume'     },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              fontSize:'0.85rem', fontWeight:500,
              color: isActive ? 'var(--brand)' : 'var(--text-2)',
              padding:'5px 12px', borderRadius:'8px',
              background: isActive ? 'var(--brand-bg)' : 'transparent',
              border: isActive ? '1px solid var(--brand-border)' : '1px solid transparent',
              transition:'all 0.15s ease',
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Day counter chip ── */}
        <div style={{
          display:'flex', alignItems:'center', gap:'6px',
          background: uc.bg,
          border:`1.5px solid ${uc.border}`,
          borderRadius:'999px',
          padding:'5px 12px',
          flexShrink:0,
        }}>
          {/* Progress dots */}
          <div style={{ display:'flex', gap:'3px', alignItems:'center' }}>
            {Array.from({ length:7 }).map((_,i) => (
              <div key={i} style={{
                width: i < day ? '6px' : '5px',
                height: i < day ? '6px' : '5px',
                borderRadius:'50%',
                background: i < day ? uc.color : 'var(--border)',
                transition:'all 0.2s ease',
              }}/>
            ))}
          </div>
          <span style={{
            fontSize:'0.72rem', fontWeight:700,
            color: uc.color,
            whiteSpace:'nowrap',
          }}>
            Day {day}/7
            {daysLeft === 1 && ' · Last day!'}
            {daysLeft === 2 && ' · 1 day left'}
          </span>
        </div>

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          <ThemeToggle />

          {/* User chip */}
          <div style={{
            display:'flex', alignItems:'center', gap:'7px',
            background:'var(--bg-raised)', border:'1px solid var(--border)',
            borderRadius:'999px', padding:'4px 12px 4px 4px',
          }}>
            <div style={{
              width:'26px', height:'26px', borderRadius:'50%',
              background:'linear-gradient(135deg, var(--brand), var(--brand-2))',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.7rem', fontWeight:800, color:'white',
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--text-2)' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </div>

          <button
            onClick={() => { logout(); navigate('/') }}
            className="btn-ghost"
            style={{ padding:'5px 12px', fontSize:'0.8rem' }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
