import React, { useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LoginContext } from '../App'
import { clearAuthData } from '../services/authService'

export default function Navbar() {
  const { loginStatus, setLoginStatus, role, setRole, userData } = useContext(LoginContext)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    clearAuthData()
    setLoginStatus(false)
    setRole('GUEST')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'active fw-bold text-primary' : ''
  const isAdminActive = (path) => location.pathname === path ? 'active text-info fw-bold' : 'text-light'

  // GUEST NAVBAR (NOT LOGGED IN / PUBLIC LANDING)
  if (!loginStatus) {
    return (
      <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom sticky-top py-3">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" to="/">
            <i className="bi bi-buildings-fill fs-4"></i>
            <span>Apartment Society Manager</span>
          </Link>

          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#guestNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="guestNavbar">
            <ul className="navbar-nav ms-auto gap-3 align-items-center">
              <li className="nav-item">
                <Link className={`nav-link fw-semibold ${location.pathname === '/' ? 'text-primary' : 'text-dark'}`} to="/">
                  <i className="bi bi-house-door me-1"></i> Home
                </Link>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-semibold text-dark" href="/#features">
                  <i className="bi bi-stars me-1"></i> Features
                </a>
              </li>
              <li className="nav-item">
                <Link className="btn btn-outline-primary px-3 rounded-pill" to="/login">
                  <i className="bi bi-shield-lock me-1"></i> Resident / Admin Portal
                </Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary px-4 rounded-pill" to="/login">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }

  // ADMIN NAVBAR
  if (role === 'ADMIN') {
    return (
      <header className="sticky-top shadow">
        {/* Top Dark Bar */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }} className="px-4 py-2 border-bottom border-secondary">
          <div className="d-flex align-items-center justify-content-between">
            <Link className="navbar-brand fw-bold text-white d-flex align-items-center gap-2 text-decoration-none" to="/admin/dashboard">
              <i className="bi bi-shield-check text-info fs-4"></i>
              <span className="fs-5">Society Admin Console</span>
            </Link>

            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="btn btn-outline-secondary btn-sm text-light rounded-pill px-3">
                <i className="bi bi-globe me-1"></i> Public Site
              </Link>
              <span className="badge bg-secondary text-light px-3 py-2 rounded-pill">
                <i className="bi bi-person-fill-gear me-1"></i> Administrator
              </span>
              <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Admin Navigation Bar */}
        <nav className="navbar navbar-expand-lg py-2" style={{ background: '#1e293b' }}>
          <div className="container-fluid px-4">
            <button className="navbar-toggler border-secondary text-white" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
              <i className="bi bi-list text-white fs-4"></i>
            </button>
            <div className="collapse navbar-collapse" id="adminNavbar">
              <ul className="navbar-nav me-auto gap-2">
                <li className="nav-item">
                  <Link className={`nav-link ${isAdminActive('/admin/dashboard')}`} to="/admin/dashboard">
                    <i className="bi bi-grid-1x2-fill me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isAdminActive('/admin/flats')}`} to="/admin/flats">
                    <i className="bi bi-door-open-fill me-1"></i> Flats
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isAdminActive('/admin/residents')}`} to="/admin/residents">
                    <i className="bi bi-people-fill me-1"></i> Residents
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isAdminActive('/admin/bills')}`} to="/admin/bills">
                    <i className="bi bi-receipt me-1"></i> Maintenance Bills
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isAdminActive('/admin/payments')}`} to="/admin/payments">
                    <i className="bi bi-credit-card-fill me-1"></i> Payments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isAdminActive('/admin/complaints')}`} to="/admin/complaints">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Complaints
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isAdminActive('/admin/expenses')}`} to="/admin/expenses">
                    <i className="bi bi-wallet2 me-1"></i> Society Expenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    )
  }

  // RESIDENT NAVBAR
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom sticky-top py-2">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" to="/resident/dashboard">
          <i className="bi bi-house-door-fill fs-4"></i>
          <span>Resident Portal</span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#residentNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="residentNavbar">
          <ul className="navbar-nav me-auto gap-2 ms-4">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/resident/dashboard')}`} to="/resident/dashboard">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/resident/my-flat')}`} to="/resident/my-flat">
                <i className="bi bi-key-fill me-1"></i> My Flat
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/resident/my-bills')}`} to="/resident/my-bills">
                <i className="bi bi-cash-stack me-1"></i> My Bills
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/resident/my-payments')}`} to="/resident/my-payments">
                <i className="bi bi-clock-history me-1"></i> My Payments
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/resident/my-complaints')}`} to="/resident/my-complaints">
                <i className="bi bi-card-checklist me-1"></i> Complaints
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/resident/raise-complaint')}`} to="/resident/raise-complaint">
                <i className="bi bi-plus-circle-fill me-1 text-danger"></i> Raise Complaint
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
              <i className="bi bi-globe me-1"></i> Home
            </Link>
            <div className="text-end d-none d-md-block">
              <div className="fw-bold text-dark small">{userData?.name || sessionStorage.getItem('name') || 'Resident'}</div>
              <div className="badge bg-primary-subtle text-primary border border-primary-subtle">
                Flat: {userData?.flatNumber || sessionStorage.getItem('flatNumber') || 'Assigned'}
              </div>
            </div>
            <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
