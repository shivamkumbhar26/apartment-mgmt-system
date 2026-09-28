import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getDashboardStats } from '../../services/adminService'
import { toast } from 'react-toastify'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    try {
      setLoading(true)
      const res = await getDashboardStats()
      if (res.status === 'success') {
        setStats(res.data)
      } else {
        toast.error(res.data || 'Failed to load dashboard statistics')
      }
    } catch (err) {
      toast.error('Network error loading dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <AdminLayout
      title="Society Executive Dashboard"
      subtitle="Real-time operational metrics and financial analytics from MySQL database"
      actionButton={
        <button className="btn btn-outline-primary btn-sm" onClick={loadStats} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Stats
        </button>
      }
    >
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Loading live society statistics...</p>
        </div>
      ) : (
        <>
          {/* Top Row: Flats & Residents Overview */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-primary border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Total Flats</span>
                    <h3 className="fw-bold my-1 text-dark">{stats?.totalFlats ?? 0}</h3>
                    <small className="text-success"><i className="bi bi-door-open me-1"></i>Society Inventory</small>
                  </div>
                  <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                    <i className="bi bi-building fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-info border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Occupied Flats</span>
                    <h3 className="fw-bold my-1 text-info">{stats?.occupiedFlats ?? 0}</h3>
                    <small className="text-muted">Vacant: <strong>{stats?.vacantFlats ?? 0}</strong></small>
                  </div>
                  <div className="p-3 bg-info-subtle text-info rounded-circle">
                    <i className="bi bi-house-check fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-success border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Active Residents</span>
                    <h3 className="fw-bold my-1 text-success">{stats?.totalResidents ?? 0}</h3>
                    <small className="text-muted">Registered accounts</small>
                  </div>
                  <div className="p-3 bg-success-subtle text-success rounded-circle">
                    <i className="bi bi-people-fill fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-warning border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Pending Bills</span>
                    <h3 className="fw-bold my-1 text-warning">{stats?.pendingBills ?? 0}</h3>
                    <small className="text-muted">Paid Bills: <strong>{stats?.paidBills ?? 0}</strong></small>
                  </div>
                  <div className="p-3 bg-warning-subtle text-warning rounded-circle">
                    <i className="bi bi-clock-history fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: Financials and Service Complaints */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-primary border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Total Collection</span>
                    <h3 className="fw-bold my-1 text-primary">₹{Number(stats?.totalCollection || 0).toLocaleString()}</h3>
                    <small className="text-success"><i className="bi bi-arrow-up-circle me-1"></i>From Maintenance</small>
                  </div>
                  <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                    <i className="bi bi-cash-coin fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-danger border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Society Expenses</span>
                    <h3 className="fw-bold my-1 text-danger">₹{Number(stats?.totalExpenses || 0).toLocaleString()}</h3>
                    <small className="text-muted">Total outflow recorded</small>
                  </div>
                  <div className="p-3 bg-danger-subtle text-danger rounded-circle">
                    <i className="bi bi-wallet2 fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-danger border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Open Complaints</span>
                    <h3 className="fw-bold my-1 text-danger">{stats?.openComplaints ?? 0}</h3>
                    <small className="text-danger"><i className="bi bi-exclamation-circle me-1"></i>Requires Action</small>
                  </div>
                  <div className="p-3 bg-danger-subtle text-danger rounded-circle">
                    <i className="bi bi-wrench-adjustable-circle fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-success border-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small fw-semibold text-uppercase">Resolved Complaints</span>
                    <h3 className="fw-bold my-1 text-success">{stats?.resolvedComplaints ?? 0}</h3>
                    <small className="text-success"><i className="bi bi-check-circle me-1"></i>Satisfied tickets</small>
                  </div>
                  <div className="p-3 bg-success-subtle text-success rounded-circle">
                    <i className="bi bi-patch-check-fill fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Action Hub */}
          <div className="card custom-card border-0 shadow-sm p-4 mt-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="bi bi-lightning-charge-fill text-warning me-2"></i>Quick Management Modules
            </h5>
            <div className="row g-3">
              <div className="col-md-4">
                <Link to="/admin/flats" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light hover-shadow text-dark">
                    <div className="fw-bold mb-1"><i className="bi bi-door-open text-primary me-2"></i>Manage Flats</div>
                    <small className="text-muted">Create blocks, add flats, inspect occupancy status.</small>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/admin/residents" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light hover-shadow text-dark">
                    <div className="fw-bold mb-1"><i className="bi bi-person-plus text-success me-2"></i>Manage Residents</div>
                    <small className="text-muted">Register residents, assign/unassign flats and accounts.</small>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/admin/bills" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light hover-shadow text-dark">
                    <div className="fw-bold mb-1"><i className="bi bi-receipt text-warning me-2"></i>Maintenance Bills</div>
                    <small className="text-muted">Generate individual or batch maintenance invoices.</small>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/admin/payments" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light hover-shadow text-dark">
                    <div className="fw-bold mb-1"><i className="bi bi-credit-card text-info me-2"></i>Record Payments</div>
                    <small className="text-muted">Mark bills PAID and track transactions & receipts.</small>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/admin/complaints" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light hover-shadow text-dark">
                    <div className="fw-bold mb-1"><i className="bi bi-tools text-danger me-2"></i>Resident Complaints</div>
                    <small className="text-muted">Assign technician, change status, and record resolutions.</small>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/admin/expenses" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light hover-shadow text-dark">
                    <div className="fw-bold mb-1"><i className="bi bi-cash-stack text-dark me-2"></i>Society Expenses</div>
                    <small className="text-muted">Log maintenance, security, gardening, and repair costs.</small>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
