import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ResidentLayout from '../../components/ResidentLayout'
import { getResidentDashboard } from '../../services/residentService'
import { toast } from 'react-toastify'

export default function ResidentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getResidentDashboard()
      if (res.status === 'success') {
        setData(res.data)
      } else {
        toast.error(res.data || 'Failed to load resident dashboard')
      }
    } catch (err) {
      toast.error('Network error loading resident dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const resident = data?.resident

  return (
    <ResidentLayout
      title={`Welcome, ${resident?.name || 'Resident'}!`}
      subtitle={`Flat: ${resident?.flat_number ? `Flat ${resident.flat_number} (${resident.block} Block)` : 'No Flat Assigned'}`}
    >
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Loading your society information...</p>
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-primary border-4">
                <span className="text-muted small fw-semibold text-uppercase">My Flat</span>
                <h3 className="fw-bold my-1 text-primary">{resident?.flat_number || 'None'}</h3>
                <small className="text-muted">{resident?.flat_type || 'Unassigned'}</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-warning border-4">
                <span className="text-muted small fw-semibold text-uppercase">Pending Bills</span>
                <h3 className="fw-bold my-1 text-warning">{data?.pendingBillsCount ?? 0}</h3>
                <small className="text-danger fw-semibold">₹{Number(data?.totalPendingAmount || 0).toLocaleString()} Due</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-success border-4">
                <span className="text-muted small fw-semibold text-uppercase">Paid Invoices</span>
                <h3 className="fw-bold my-1 text-success">{data?.paidBillsCount ?? 0}</h3>
                <small className="text-muted">₹{Number(data?.totalPaidAmount || 0).toLocaleString()} Cleared</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="stat-card p-3 h-100 border-start border-danger border-4">
                <span className="text-muted small fw-semibold text-uppercase">Active Complaints</span>
                <h3 className="fw-bold my-1 text-danger">{data?.activeComplaintsCount ?? 0}</h3>
                <small className="text-success">{data?.resolvedComplaintsCount ?? 0} Resolved</small>
              </div>
            </div>
          </div>

          {/* Quick Access Tiles */}
          <div className="card custom-card border-0 shadow-sm p-4">
            <h5 className="fw-bold text-dark mb-3">Resident Services</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <Link to="/resident/my-flat" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light text-dark hover-shadow">
                    <div className="fw-bold mb-1"><i className="bi bi-key-fill text-primary me-2"></i>My Flat Details</div>
                    <small className="text-muted">View your apartment specifications, block, and registration date.</small>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/resident/my-bills" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light text-dark hover-shadow">
                    <div className="fw-bold mb-1"><i className="bi bi-receipt-cutoff text-warning me-2"></i>Maintenance Bills</div>
                    <small className="text-muted">Check current month dues, billing breakdown, and status.</small>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/resident/raise-complaint" className="text-decoration-none">
                  <div className="p-3 border rounded-3 bg-light text-dark hover-shadow">
                    <div className="fw-bold mb-1"><i className="bi bi-tools text-danger me-2"></i>Raise a Complaint</div>
                    <small className="text-muted">Report plumbing, electrical, security, or maintenance issues.</small>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </ResidentLayout>
  )
}
