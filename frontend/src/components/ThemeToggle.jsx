import React from 'react'
import { useTheme } from '../App.jsx'

export default function ThemeToggle({ compact = false }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 0 : '8px',
        padding: compact ? '8px' : '6px 12px 6px 8px',
        background: 'var(--bg-raised)',
        border: '1.5px solid var(--border)',
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        color: 'var(--text-2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--brand)'
        e.currentTarget.style.color = 'var(--brand)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-2)'
      }}
    >
      {/* Sun / Moon icon */}
      <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>
        {isDark ? '🌙' : '☀️'}
      </span>

      {/* Toggle track */}
      {!compact && (
        <>
          <div style={{
            position: 'relative',
            width: '32px', height: '18px',
            background: isDark ? 'var(--brand)' : 'var(--border)',
            borderRadius: '999px',
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: isDark ? '15px' : '3px',
              width: '12px', height: '12px',
              borderRadius: '50%',
              background: 'white',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, userSelect: 'none' }}>
            {isDark ? 'Dark' : 'Light'}
          </span>
        </>
      )}
    </button>
  )
}
