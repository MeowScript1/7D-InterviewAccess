import React, { createContext, useContext, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Landing      from './pages/Landing.jsx'
import Login        from './pages/Login.jsx'
import Signup       from './pages/Signup.jsx'
import Dashboard    from './pages/Dashboard.jsx'
import MyInterviews from './pages/MyInterviews.jsx'
import ResumeUpload from './pages/ResumeUpload.jsx'
import Navbar       from './components/Navbar.jsx'

// ── Auth Context ──────────────────────────────────────────────────────────────
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

// Persist user in localStorage so refresh doesn't log you out
function loadUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Protected Route ───────────────────────────────────────────────────────────
function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(loadUser)

  function login(userData) {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        {/* Navbar is shown on all pages except landing */}
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/signup"  element={<Signup />} />

          {/* Protected pages */}
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Navbar />
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/my-interviews"
            element={
              <Protected>
                <Navbar />
                <MyInterviews />
              </Protected>
            }
          />
          <Route
            path="/resume"
            element={
              <Protected>
                <Navbar />
                <ResumeUpload />
              </Protected>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
