import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { LoginContext } from '../App'
import './Home.css'

export default function Home() {
  const { loginStatus, role } = useContext(LoginContext)
  const navigate = useNavigate()

  const handlePortalRedirect = () => {
    if (!loginStatus) {
      navigate('/login')
    } else if (role === 'ADMIN') {
      navigate('/admin/dashboard')
    } else {
      navigate('/resident/dashboard')
    }
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>

        <div className="container position-relative z-1">
          <div className="row align-items-center g-5">
            {/* Left Content */}
            <div className="col-lg-6">
              <div className="hero-badge">
                <i className="bi bi-shield-check text-info"></i>
                <span>Skyline Heights Residential Complex</span>
              </div>

              <h1 className="hero-title">
                Smart Living, <br />
                <span>Seamless Community</span> Management.
              </h1>

              <p className="hero-description">
                A unified digital platform connecting society administrators and apartment residents for flat occupancy, transparent maintenance billing, swift grievance resolution, and community expense tracking.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-primary hero-cta-btn" onClick={handlePortalRedirect}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  {loginStatus ? 'Go to Your Dashboard' : 'Access Portal / Sign In'}
                </button>
                <a href="#features" className="btn hero-secondary-btn">
                  <i className="bi bi-compass me-2"></i>
                  Explore Features
                </a>
              </div>
            </div>

            {/* Right Interactive Showcase */}
            <div className="col-lg-6">
              <div className="hero-stats-card">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary">
                  <div>
                    <h5 className="fw-bold text-white mb-1">
                      <i className="bi bi-buildings-fill text-primary me-2"></i>Apartment Society Hub
                    </h5>
                    <small className="text-secondary">Connected Operations & Live Ledger</small>
                  </div>
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                    <i className="bi bi-circle-fill me-1 small"></i> System Active
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="stat-pill">
                      <div className="d-flex align-items-center gap-2 text-info small fw-semibold mb-1">
                        <i className="bi bi-door-open fs-5"></i>
                        <span>Flats Management</span>
                      </div>
                      <div className="text-white fw-bold fs-5">8 Units</div>
                      <small className="text-muted">A & B Blocks</small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-pill">
                      <div className="d-flex align-items-center gap-2 text-warning small fw-semibold mb-1">
                        <i className="bi bi-receipt fs-5"></i>
                        <span>Monthly Billing</span>
                      </div>
                      <div className="text-white fw-bold fs-5">Instant Dues</div>
                      <small className="text-muted">UPI / Net Banking</small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-pill">
                      <div className="d-flex align-items-center gap-2 text-danger small fw-semibold mb-1">
                        <i className="bi bi-tools fs-5"></i>
                        <span>Complaints</span>
                      </div>
                      <div className="text-white fw-bold fs-5">Full Lifecycle</div>
                      <small className="text-muted">Open &rarr; Resolved</small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="stat-pill">
                      <div className="d-flex align-items-center gap-2 text-success small fw-semibold mb-1">
                        <i className="bi bi-shield-lock fs-5"></i>
                        <span>Role Isolation</span>
                      </div>
                      <div className="text-white fw-bold fs-5">100% Private</div>
                      <small className="text-muted">JWT Protected</small>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top border-secondary text-center">
                  <small className="text-light opacity-75">
                    <i className="bi bi-database-check text-info me-1"></i>
                    Powered by Node.js, Express, MySQL & React 19
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
              COMMUNITY FEATURES
            </span>
            <h2 className="fw-bold text-dark fs-2 mb-3">
              Everything Your Society Needs in One Place
            </h2>
            <p className="text-muted">
              Built to simplify residential administration, eliminate billing disputes, and resolve maintenance tickets promptly.
            </p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon-wrapper bg-primary-subtle text-primary">
                  <i className="bi bi-building"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Flats & Occupancy</h5>
                <p className="text-muted small mb-0">
                  Configure apartment blocks, floors, flat types (1 BHK, 2 BHK, Penthouse), and monitor occupied vs. vacant units in real time.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon-wrapper bg-success-subtle text-success">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Resident Onboarding</h5>
                <p className="text-muted small mb-0">
                  Register residents, provision secure login accounts, map flats, and track move-in dates with one-click assignment.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon-wrapper bg-warning-subtle text-warning">
                  <i className="bi bi-receipt-cutoff"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Maintenance Billing</h5>
                <p className="text-muted small mb-0">
                  Generate monthly maintenance invoices individually or batch-generate for all occupied flats. Track dues with due dates.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon-wrapper bg-info-subtle text-info">
                  <i className="bi bi-credit-card-2-front"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Multi-Mode Payments</h5>
                <p className="text-muted small mb-0">
                  Record collections via UPI, Net Banking, Cards, Cheque, or Cash. Bills automatically transition from PENDING to PAID.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon-wrapper bg-danger-subtle text-danger">
                  <i className="bi bi-wrench-adjustable"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Grievance Redressal</h5>
                <p className="text-muted small mb-0">
                  Residents raise service tickets for plumbing, electrical, and security. Admin assigns technicians and tracks progress to resolution.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="col-md-4">
              <div className="feature-box">
                <div className="feature-icon-wrapper bg-secondary-subtle text-secondary">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Society Expenses Ledger</h5>
                <p className="text-muted small mb-0">
                  Log operational costs for elevator servicing, security agencies, housekeeping, and landscaping with live financial updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials & Fast Assessment Access */}
      <section className="py-5 bg-white border-top">
        <div className="container">
          <div className="demo-banner">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <div className="badge bg-warning text-dark fw-bold mb-2">COLLEGE ASSESSMENT DEMO</div>
                <h3 className="fw-bold text-white mb-2">Ready to Test the Workflows?</h3>
                <p className="text-white-50 mb-0">
                  Use the pre-configured credentials below to evaluate both the Admin management console and the Resident self-service portal.
                </p>
              </div>
              <div className="col-lg-5 text-lg-end">
                <Link to="/login" className="btn btn-primary btn-lg px-4 rounded-3 shadow">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Go to Sign In Page
                </Link>
              </div>
            </div>

            <div className="row g-3 mt-3 pt-3 border-top border-secondary">
              <div className="col-md-6">
                <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary">
                  <div className="badge bg-danger mb-2">ADMIN ROLE</div>
                  <div className="small text-white">Email: <strong>admin@society.com</strong></div>
                  <div className="small text-white">Password: <strong>admin123</strong></div>
                  <small className="text-secondary">Full administrative control over flats, residents, and ledgers</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary">
                  <div className="badge bg-success mb-2">RESIDENT ROLE</div>
                  <div className="small text-white">Email: <strong>rahul@example.com</strong></div>
                  <div className="small text-white">Password: <strong>resident123</strong></div>
                  <small className="text-secondary">Occupant of Flat A-101 with private bills and complaints</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-white border-top mt-auto">
        <div className="container d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-buildings-fill text-primary fs-5"></i>
            <span className="fw-bold text-dark">Skyline Heights</span>
            <span className="text-muted small">&copy; 2026. Apartment Society Management System.</span>
          </div>
          <div className="d-flex gap-3 small">
            <Link to="/login" className="text-decoration-none text-muted">Sign In</Link>
            <a href="#features" className="text-decoration-none text-muted">Features</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
