import React, { useEffect, useState } from 'react'
import ResidentLayout from '../../components/ResidentLayout'
import { getMyFlat } from '../../services/residentService'
import { toast } from 'react-toastify'

export default function MyFlat() {
  const [flat, setFlat] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFlat() {
      try {
        setLoading(true)
        const res = await getMyFlat()
        if (res.status === 'success') {
          setFlat(res.data)
        } else {
          toast.error(res.data || 'Failed to load flat details')
        }
      } catch (err) {
        toast.error('Network error loading flat info')
      } finally {
        setLoading(false)
      }
    }
    fetchFlat()
  }, [])

  return (
    <ResidentLayout
      title="My Flat Information"
      subtitle="Details of your allocated apartment unit in the society"
    >
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted mt-2">Loading flat information...</p>
        </div>
      ) : !flat || !flat.assigned ? (
        <div className="card custom-card border-0 shadow-sm p-5 text-center">
          <i className="bi bi-door-closed fs-1 text-muted mb-3"></i>
          <h4>No Flat Assigned</h4>
          <p className="text-muted">You are registered as a resident, but no flat has been mapped to your account yet. Please contact the society administrator.</p>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card custom-card border-0 shadow-sm h-100 p-4">
              <h5 className="fw-bold text-dark mb-4 border-bottom pb-2">
                <i className="bi bi-building text-primary me-2"></i>Apartment Unit Details
              </h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Flat Number:</span>
                  <strong className="text-dark fs-5">{flat.flat_number}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Block / Wing:</span>
                  <strong className="text-dark">{flat.block} Block</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Floor Number:</span>
                  <strong className="text-dark">Floor {flat.floor}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Flat Type:</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2">{flat.flat_type}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Occupancy Status:</span>
                  <span className="badge badge-occupied px-3 py-2">{flat.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card custom-card border-0 shadow-sm h-100 p-4">
              <h5 className="fw-bold text-dark mb-4 border-bottom pb-2">
                <i className="bi bi-person-badge text-success me-2"></i>Resident Occupant Details
              </h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Resident Name:</span>
                  <strong className="text-dark">{flat.resident_name}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Registered Email:</span>
                  <span className="text-dark">{flat.email}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Mobile Number:</span>
                  <span className="text-dark">{flat.phone}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Move-in Date:</span>
                  <span className="text-dark">{flat.move_in_date ? new Date(flat.move_in_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResidentLayout>
  )
}
