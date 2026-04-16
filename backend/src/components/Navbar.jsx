import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-brand' : 'text-ink-700 hover:text-brand'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
            7D
          </span>
          <span className="font-display text-sm font-bold text-ink-900 hidden sm:block">
            InterviewAccess
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          <NavLink to="/dashboard"      className={linkClass}>Interviews</NavLink>
          <NavLink to="/my-interviews"  className={linkClass}>My Schedule</NavLink>
          <NavLink to="/resume"         className={linkClass}>Resume</NavLink>
        </nav>

        {/* User area */}
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-500 sm:block">
            Hi, <strong className="text-ink-900">{user?.name?.split(' ')[0]}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-red-300 hover:text-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
