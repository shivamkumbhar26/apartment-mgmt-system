import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getAllFlats, addFlat, deleteFlat } from '../../services/adminService'
import { toast } from 'react-toastify'

export default function ManageFlats() {
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    block: 'A',
    flatNumber: '',
    floor: 1,
    flatType: '2 BHK'
  })

  const loadFlats = async () => {
    try {
      setLoading(true)
      const res = await getAllFlats()
      if (res.status === 'success') {
        setFlats(res.data)
      } else {
        toast.error(res.data || 'Failed to fetch flats')
      }
    } catch (err) {
      toast.error('Network error loading flats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlats()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCreateFlat = async (e) => {
    e.preventDefault()
    if (!formData.block.trim() || !formData.flatNumber.trim() || !formData.flatType.trim()) {
      toast.warning('Please fill in all flat fields')
      return
    }

    try {
      const res = await addFlat(formData)
      if (res.status === 'success') {
        toast.success('Flat added successfully!')
        setShowAddModal(false)
        setFormData({ block: 'A', flatNumber: '', floor: 1, flatType: '2 BHK' })
        loadFlats()
      } else {
        toast.error(res.data || 'Failed to create flat')
      }
    } catch (err) {
      toast.error('Server error creating flat')
    }
  }

  const handleDeleteFlat = async (flatId, flatNumber) => {
    if (!window.confirm(`Are you sure you want to delete flat ${flatNumber}?`)) {
      return
    }

    try {
      const res = await deleteFlat(flatId)
      if (res.status === 'success') {
        toast.success(`Flat ${flatNumber} deleted`)
        loadFlats()
      } else {
        toast.error(res.data || 'Failed to delete flat')
      }
    } catch (err) {
      toast.error('Error deleting flat')
    }
  }

  return (
    <AdminLayout
      title="Flats Inventory"
      subtitle="View, register, and manage apartment units and their occupancy status"
      actionButton={
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Add New Flat
        </button>
      }
    >
      {/* Modal for Adding Flat */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Register New Flat</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleCreateFlat}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Block / Wing</label>
                      <input
                        type="text"
                        name="block"
                        className="form-control"
                        placeholder="e.g. A or B"
                        value={formData.block}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Flat Number</label>
                      <input
                        type="text"
                        name="flatNumber"
                        className="form-control"
                        placeholder="e.g. A-101"
                        value={formData.flatNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Floor</label>
                      <input
                        type="number"
                        name="floor"
                        className="form-control"
                        min="0"
                        max="50"
                        value={formData.floor}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Flat Type</label>
                      <select
                        name="flatType"
                        className="form-select"
                        value={formData.flatType}
                        onChange={handleInputChange}
                      >
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="Penthouse">Penthouse</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Save Flat</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Flats Table */}
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark"><i className="bi bi-buildings me-2 text-primary"></i>All Registered Flats ({flats.length})</span>
          <span className="badge bg-secondary-subtle text-secondary">{flats.filter(f => f.status === 'OCCUPIED').length} Occupied / {flats.filter(f => f.status === 'VACANT').length} Vacant</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Flat No</th>
                <th>Block</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Assigned Resident</th>
                <th>Contact</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading flats...
                  </td>
                </tr>
              ) : flats.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No flats registered yet.</td>
                </tr>
              ) : (
                flats.map((flat) => (
                  <tr key={flat.flat_id}>
                    <td className="fw-bold text-dark">{flat.flat_number}</td>
                    <td>{flat.block}</td>
                    <td>{flat.floor}</td>
                    <td><span className="badge bg-light text-dark border">{flat.flat_type}</span></td>
                    <td>
                      <span className={`badge ${flat.status === 'OCCUPIED' ? 'badge-occupied' : 'badge-vacant'} px-2 py-1`}>
                        {flat.status}
                      </span>
                    </td>
                    <td>
                      {flat.resident_name ? (
                        <div className="fw-semibold text-dark">{flat.resident_name}</div>
                      ) : (
                        <span className="text-muted fst-italic">None</span>
                      )}
                    </td>
                    <td>
                      {flat.resident_phone ? (
                        <small className="text-muted"><i className="bi bi-telephone me-1"></i>{flat.resident_phone}</small>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-danger btn-sm rounded-3"
                        title="Delete Flat"
                        disabled={flat.status === 'OCCUPIED'}
                        onClick={() => handleDeleteFlat(flat.flat_id, flat.flat_number)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
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
