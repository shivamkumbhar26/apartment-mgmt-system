import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getAllComplaints, assignComplaint, updateComplaintStatus } from '../../services/adminService'
import { toast } from 'react-toastify'

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [technicianName, setTechnicianName] = useState('')
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'IN_PROGRESS',
    resolutionRemarks: ''
  })

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const res = await getAllComplaints()
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

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!technicianName.trim()) {
      toast.warning('Please enter technician or staff name')
      return
    }

    try {
      const res = await assignComplaint(selectedComplaint.complaint_id, technicianName.trim())
      if (res.status === 'success') {
        toast.success(`Complaint assigned to ${technicianName}`)
        setShowAssignModal(false)
        setSelectedComplaint(null)
        setTechnicianName('')
        loadComplaints()
      } else {
        toast.error(res.data || 'Failed to assign complaint')
      }
    } catch (err) {
      toast.error('Network error assigning complaint')
    }
  }

  const handleStatusSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await updateComplaintStatus(
        selectedComplaint.complaint_id,
        statusUpdate.status,
        statusUpdate.resolutionRemarks
      )
      if (res.status === 'success') {
        toast.success(`Status updated to ${statusUpdate.status}`)
        setShowStatusModal(false)
        setSelectedComplaint(null)
        loadComplaints()
      } else {
        toast.error(res.data || 'Failed to update status')
      }
    } catch (err) {
      toast.error('Network error updating status')
    }
  }

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
    <AdminLayout
      title="Complaints & Service Requests"
      subtitle="Review resident tickets, assign technicians, update workflows, and resolve grievances"
      actionButton={
        <button className="btn btn-outline-primary btn-sm" onClick={loadComplaints}>
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh Tickets
        </button>
      }
    >
      {/* Modal: Assign Complaint */}
      {showAssignModal && selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Assign Ticket #{selectedComplaint.complaint_id}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <p className="small text-muted mb-1">Title: <strong>{selectedComplaint.title}</strong></p>
                    <p className="small text-muted mb-0">Raised by: {selectedComplaint.resident_name} (Flat {selectedComplaint.flat_number})</p>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Assignee / Technician Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Suresh Kumar (Electrician) or Ganesh (Plumbing)"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Assign Staff</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Update Complaint Status */}
      {showStatusModal && selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Update Complaint Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
              </div>
              <form onSubmit={handleStatusSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Complaint Status</label>
                    <select
                      className="form-select"
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    >
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Resolution Remarks / Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter work done or update details for the resident"
                      value={statusUpdate.resolutionRemarks}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, resolutionRemarks: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowStatusModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Update Status</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complaints Table */}
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark"><i className="bi bi-tools me-2 text-primary"></i>All Tickets ({complaints.length})</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>ID</th>
                <th>Resident / Flat</th>
                <th>Category</th>
                <th>Title & Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Remarks</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading tickets...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">No complaints raised yet.</td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.complaint_id}>
                    <td className="fw-bold text-muted">#{c.complaint_id}</td>
                    <td>
                      <div className="fw-bold text-dark">{c.resident_name}</div>
                      <small className="badge bg-light text-muted border">Flat {c.flat_number}</small>
                    </td>
                    <td><span className="badge bg-light text-dark border">{c.category}</span></td>
                    <td style={{ maxWidth: '280px' }}>
                      <div className="fw-semibold text-dark">{c.title}</div>
                      <small className="text-muted text-truncate d-block">{c.description}</small>
                    </td>
                    <td>{getPriorityBadge(c.priority)}</td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      {c.assigned_to ? (
                        <span className="text-dark small fw-semibold">
                          <i className="bi bi-person-badge text-primary me-1"></i>{c.assigned_to}
                        </span>
                      ) : (
                        <span className="text-muted small fst-italic">Unassigned</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '180px' }}>
                      <small className="text-muted text-truncate d-block">{c.resolution_remarks || '-'}</small>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          title="Assign Staff"
                          onClick={() => {
                            setSelectedComplaint(c)
                            setTechnicianName(c.assigned_to || '')
                            setShowAssignModal(true)
                          }}
                        >
                          <i className="bi bi-person-plus"></i> Assign
                        </button>
                        <button
                          className="btn btn-outline-success"
                          title="Update Status"
                          onClick={() => {
                            setSelectedComplaint(c)
                            setStatusUpdate({
                              status: c.status === 'OPEN' ? 'ASSIGNED' : c.status,
                              resolutionRemarks: c.resolution_remarks || ''
                            })
                            setShowStatusModal(true)
                          }}
                        >
                          <i className="bi bi-arrow-repeat"></i> Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
