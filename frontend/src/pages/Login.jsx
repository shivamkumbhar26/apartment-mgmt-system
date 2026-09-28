import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginUser, saveAuthData } from '../services/authService'
import { LoginContext } from '../App'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setLoginStatus, setRole, setUserData } = useContext(LoginContext)

  const handleLogin = async (e) => {
    if (e) e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.warning('Please enter both email and password')
      return
    }

    try {
      setLoading(true)
      const result = await loginUser(email.trim(), password.trim())

      if (result.status === 'success') {
        saveAuthData(result.data)
        setLoginStatus(true)
        setRole(result.data.role)
        setUserData(result.data)
        toast.success(`Welcome back, ${result.data.name || 'User'}!`)

        if (result.data.role === 'ADMIN') {
          navigate('/admin/dashboard')
        } else {
          navigate('/resident/dashboard')
        }
      } else {
        toast.error(result.data || 'Invalid email or password')
      }
    } catch (err) {
      toast.error('Network error or server unavailable during sign in')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickCredentials = (quickEmail, quickPassword) => {
    setEmail(quickEmail)
    setPassword(quickPassword)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '960px', width: '100%' }}>
        <div className="row g-0">
          {/* Left Hero Panel */}
          <div className="col-lg-5 p-5 text-white d-flex flex-column justify-content-between" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <div>
              <Link to="/" className="btn btn-sm btn-outline-light rounded-pill mb-4 px-3">
                <i className="bi bi-arrow-left me-1"></i> Back to Home
              </Link>
              <div className="d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-buildings-fill fs-2"></i>
                <h3 className="fw-bold mb-0">Skyline Heights</h3>
              </div>
              <h4 className="fw-bold mb-3">Apartment Society Management System</h4>
              <p className="text-white-50">
                A unified digital platform connecting society administrators and apartment residents for flats, bills, maintenance payments, and complaints.
              </p>
            </div>

            <div className="mt-4 pt-4 border-top border-primary-subtle">
              <div className="small fw-semibold text-white-50 mb-2">QUICK DEMO CREDENTIALS:</div>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-light text-start py-2 px-3 rounded-3"
                  onClick={() => fillQuickCredentials('admin@society.com', 'admin123')}
                >
                  <span className="badge bg-danger me-2">ADMIN</span>
                  <strong>admin@society.com</strong> (admin123)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-light text-start py-2 px-3 rounded-3"
                  onClick={() => fillQuickCredentials('rahul@example.com', 'resident123')}
                >
                  <span className="badge bg-success me-2">RESIDENT</span>
                  <strong>rahul@example.com</strong> (Flat A-101)
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-light text-start py-2 px-3 rounded-3"
                  onClick={() => fillQuickCredentials('priya@example.com', 'resident123')}
                >
                  <span className="badge bg-success me-2">RESIDENT</span>
                  <strong>priya@example.com</strong> (Flat A-102)
                </button>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="col-lg-7 p-5 bg-white d-flex flex-column justify-content-center">
            <div className="mb-4 text-center text-lg-start">
              <h2 className="fw-bold text-dark mb-1">Account Sign In</h2>
              <p className="text-muted">Enter your registered email and password to access the portal</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-muted"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0 py-2"
                    placeholder="e.g. admin@society.com or rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-muted"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control bg-light border-start-0 py-2"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold rounded-3 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span><i className="spinner-border spinner-border-sm me-2"></i>Signing in...</span>
                ) : (
                  <span><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
