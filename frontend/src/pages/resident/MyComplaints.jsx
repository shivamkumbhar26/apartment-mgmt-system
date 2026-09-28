import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ResidentLayout from '../../components/ResidentLayout'
import { getMyComplaints } from '../../services/residentService'
import { toast } from 'react-toastify'

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const res = await getMyComplaints()
      if (res.status === 'success') {
        setComplaints(res.data)
      } else {
        toast.error(res.data || 'Failed to load complaints')
      }
    } catch (err) {
      toast.error('Network error loading complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [])

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <span className="badge bg-danger">{priority}</span>
      case 'MEDIUM':
        return <span className="badge bg-warning text-dark">{priority}</span>
      default:
        return <span className="badge bg-info text-dark">{priority}</span>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="badge badge-open">OPEN</span>
      case 'ASSIGNED':
        return <span className="badge badge-assigned">ASSIGNED</span>
      case 'IN_PROGRESS':
        return <span className="badge badge-progress">IN_PROGRESS</span>
      case 'RESOLVED':
        return <span className="badge badge-resolved">RESOLVED</span>
      default:
        return <span className="badge bg-secondary">{status}</span>
    }
  }

  return (
    <ResidentLayout
      title="My Complaints & Requests"
      subtitle="Track tickets raised for your apartment unit and technician actions"
      actionButton={
        <Link to="/resident/raise-complaint" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i> Raise New Complaint
        </Link>
      }
    >
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark"><i className="bi bi-card-checklist me-2 text-primary"></i>My Registered Tickets ({complaints.length})</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Title & Description</th>
                <th>Priority</th>
                <th>Lifecycle Status</th>
                <th>Assigned Staff</th>
                <th>Resolution Remarks</th>
                <th>Date Raised</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading tickets...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    You have not raised any complaints yet.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.complaint_id}>
                    <td className="fw-bold text-muted">#{c.complaint_id}</td>
                    <td><span className="badge bg-light text-dark border">{c.category}</span></td>
                    <td style={{ maxWidth: '280px' }}>
                      <div className="fw-bold text-dark">{c.title}</div>
                      <small className="text-muted d-block">{c.description}</small>
                    </td>
                    <td>{getPriorityBadge(c.priority)}</td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      {c.assigned_to ? (
                        <span className="text-dark small fw-semibold">
                          <i className="bi bi-person-check text-primary me-1"></i>{c.assigned_to}
                        </span>
                      ) : (
                        <span className="text-muted small fst-italic">Pending Assignment</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      {c.resolution_remarks ? (
                        <div className="small text-success fw-semibold">
                          <i className="bi bi-check-circle me-1"></i>{c.resolution_remarks}
                        </div>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
                    <td><small className="text-muted">{new Date(c.created_at).toLocaleDateString()}</small></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ResidentLayout>
  )
}
