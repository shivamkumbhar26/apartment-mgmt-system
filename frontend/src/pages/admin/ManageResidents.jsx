import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  getAllResidents,
  getAllFlats,
  addResident,
  assignFlatToResident,
  unassignFlatFromResident,
  deleteResident
} from '../../services/adminService'
import { toast } from 'react-toastify'

export default function ManageResidents() {
  const [residents, setResidents] = useState([])
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedResident, setSelectedResident] = useState(null)
  const [selectedFlatId, setSelectedFlatId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    flatId: '',
    moveInDate: new Date().toISOString().slice(0, 10),
    password: 'resident123'
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [rRes, fRes] = await Promise.all([getAllResidents(), getAllFlats()])
      if (rRes.status === 'success') setResidents(rRes.data)
      if (fRes.status === 'success') setFlats(fRes.data)
    } catch (err) {
      toast.error('Error loading residents and flats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegisterResident = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.warning('Please enter name, email, and phone')
      return
    }

    try {
      const res = await addResident(formData)
      if (res.status === 'success') {
        toast.success('Resident registered successfully! Default password is "resident123"')
        setShowAddModal(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          flatId: '',
          moveInDate: new Date().toISOString().slice(0, 10),
          password: 'resident123'
        })
        loadData()
      } else {
        toast.error(res.data || 'Failed to register resident')
      }
    } catch (err) {
      toast.error('Network error registering resident')
    }
  }

  const handleAssignFlat = async (e) => {
    e.preventDefault()
    if (!selectedResident || !selectedFlatId) {
      toast.warning('Please choose a flat to assign')
      return
    }

    try {
      const res = await assignFlatToResident(selectedResident.resident_id, selectedFlatId)
      if (res.status === 'success') {
        toast.success(`Flat assigned to ${selectedResident.name}`)
        setShowAssignModal(false)
        setSelectedResident(null)
        setSelectedFlatId('')
        loadData()
      } else {
        toast.error(res.data || 'Failed to assign flat')
      }
    } catch (err) {
      toast.error('Network error assigning flat')
    }
  }

  const handleUnassignFlat = async (resident) => {
    if (!window.confirm(`Unassign flat ${resident.flat_number} from resident ${resident.name}?`)) {
      return
    }

    try {
      const res = await unassignFlatFromResident(resident.resident_id)
      if (res.status === 'success') {
        toast.success('Flat unassigned')
        loadData()
      } else {
        toast.error(res.data || 'Failed to unassign flat')
      }
    } catch (err) {
      toast.error('Error unassigning flat')
    }
  }

  const handleDeleteResident = async (resident) => {
    if (!window.confirm(`Are you sure you want to remove resident ${resident.name}? This will also delete their login account.`)) {
      return
    }

    try {
      const res = await deleteResident(resident.resident_id)
      if (res.status === 'success') {
        toast.success('Resident removed successfully')
        loadData()
      } else {
        toast.error(res.data || 'Failed to remove resident')
      }
    } catch (err) {
      toast.error('Error removing resident')
    }
  }

  const vacantFlats = flats.filter(f => f.status === 'VACANT')

  return (
    <AdminLayout
      title="Residents Directory"
      subtitle="Onboard residents, map flats, and manage society occupancy records"
      actionButton={
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus-fill me-1"></i> Register New Resident
        </button>
      }
    >
      {/* Modal: Register Resident */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Register Resident</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleRegisterResident}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email Address (Login Username)</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Mobile Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Initial Password</label>
                      <input
                        type="text"
                        name="password"
                        className="form-control"
                        placeholder="Defaults to resident123"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <small className="text-muted">Resident can change password after login</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Assign Flat (Optional)</label>
                      <select
                        name="flatId"
                        className="form-select"
                        value={formData.flatId}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Do Not Assign Yet (Vacant) --</option>
                        {vacantFlats.map(f => (
                          <option key={f.flat_id} value={f.flat_id}>
                            Flat {f.flat_number} ({f.block} Block - {f.flat_type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Move In Date</label>
                      <input
                        type="date"
                        name="moveInDate"
                        className="form-control"
                        value={formData.moveInDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Register Resident</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign / Reassign Flat */}
      {showAssignModal && selectedResident && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Assign Flat to {selectedResident.name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignFlat}>
                <div className="modal-body p-4">
                  <p className="text-muted small">
                    Currently Assigned Flat: <strong>{selectedResident.flat_number || 'None'}</strong>
                  </p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Available Flat</label>
                    <select
                      className="form-select"
                      value={selectedFlatId}
                      onChange={(e) => setSelectedFlatId(e.target.value)}
                      required
                    >
                      <option value="">-- Choose a Vacant Flat --</option>
                      {vacantFlats.map(f => (
                        <option key={f.flat_id} value={f.flat_id}>
                          Flat {f.flat_number} ({f.block} Block - {f.flat_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowAssignModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Assign Flat</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Residents Table */}
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark"><i className="bi bi-people me-2 text-primary"></i>All Residents ({residents.length})</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Resident Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Assigned Flat</th>
                <th>Move In Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading residents...
                  </td>
                </tr>
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No residents registered yet.</td>
                </tr>
              ) : (
                residents.map((r) => (
                  <tr key={r.resident_id}>
                    <td>
                      <div className="fw-bold text-dark">{r.name}</div>
                    </td>
                    <td>{r.email}</td>
                    <td><i className="bi bi-telephone text-muted me-1"></i>{r.phone}</td>
                    <td>
                      {r.flat_number ? (
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                          <i className="bi bi-door-closed me-1"></i>Flat {r.flat_number} ({r.block} Block)
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary px-2 py-1">Unassigned</span>
                      )}
                    </td>
                    <td>{r.move_in_date ? new Date(r.move_in_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success px-2 py-1">
                        {r.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          title="Assign or Change Flat"
                          onClick={() => {
                            setSelectedResident(r)
                            setSelectedFlatId('')
                            setShowAssignModal(true)
                          }}
                        >
                          <i className="bi bi-key"></i> {r.flat_number ? 'Change Flat' : 'Assign Flat'}
                        </button>
                        {r.flat_number && (
                          <button
                            className="btn btn-outline-warning"
                            title="Unassign Flat"
                            onClick={() => handleUnassignFlat(r)}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger"
                          title="Delete Resident"
                          onClick={() => handleDeleteResident(r)}
                        >
                          <i className="bi bi-trash"></i>
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
