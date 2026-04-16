import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing        from './pages/Landing.jsx'
import Login          from './pages/Login.jsx'
import Signup         from './pages/Signup.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import MyInterviews   from './pages/MyInterviews.jsx'
import ResumeUpload   from './pages/ResumeUpload.jsx'
import AdminLogin     from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Navbar         from './components/Navbar.jsx'

export const AuthContext  = createContext(null)
export const ThemeContext = createContext(null)
export function useAuth()  { return useContext(AuthContext)  }
export function useTheme() { return useContext(ThemeContext) }

function loadUser() {
  try { const r = localStorage.getItem('user'); return r ? JSON.parse(r) : null }
  catch { return null }
}

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}
function AdminProtected({ children }) {
  return localStorage.getItem('admin') ? children : <Navigate to="/admin" replace />
}

export default function App() {
  const [user,   setUser]   = useState(loadUser)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const login   = u  => { setUser(u);   localStorage.setItem('user', JSON.stringify(u)) }
  const logout  = () => { setUser(null); localStorage.removeItem('user') }
  const toggleTheme = () => setIsDark(d => !d)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <BrowserRouter>
          <Routes>
            <Route path="/"       element={<Landing />} />
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin"           element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
            <Route path="/dashboard"     element={<Protected><Navbar /><Dashboard /></Protected>} />
            <Route path="/my-interviews" element={<Protected><Navbar /><MyInterviews /></Protected>} />
            <Route path="/resume"        element={<Protected><Navbar /><ResumeUpload /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}
