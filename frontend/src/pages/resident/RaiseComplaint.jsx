import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResidentLayout from '../../components/ResidentLayout'
import { raiseComplaint } from '../../services/residentService'
import { toast } from 'react-toastify'

export default function RaiseComplaint() {
  const [formData, setFormData] = useState({
    category: 'Plumbing',
    title: '',
    description: '',
    priority: 'HIGH'
  })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.warning('Please enter both title and description')
      return
    }

    try {
      setSubmitting(true)
      const res = await raiseComplaint(formData)
      if (res.status === 'success') {
        toast.success('Complaint registered successfully! Society admin notified.')
        navigate('/resident/my-complaints')
      } else {
        toast.error(res.data || 'Failed to submit complaint')
      }
    } catch (err) {
      toast.error('Network error submitting complaint')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ResidentLayout
      title="Raise a Service Complaint"
      subtitle="Report maintenance, plumbing, electrical, or society issues to administration"
    >
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card custom-card border-0 shadow-sm p-4">
            <h5 className="fw-bold text-dark mb-4 border-bottom pb-2">
              <i className="bi bi-tools text-danger me-2"></i>Service Ticket Form
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Complaint Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cleanliness">Cleanliness & Waste</option>
                    <option value="Security">Security & Intercom</option>
                    <option value="Carpentry">Carpentry & Hardware</option>
                    <option value="Lift">Lift & Elevator</option>
                    <option value="General">General Maintenance</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Priority Level</label>
                  <select
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="LOW">LOW - Routine maintenance</option>
                    <option value="MEDIUM">MEDIUM - Standard request</option>
                    <option value="HIGH">HIGH - Urgent attention needed</option>
                    <option value="CRITICAL">CRITICAL - Emergency issue</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Complaint Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. Water leakage near kitchen sink"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Detailed Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="4"
                  placeholder="Provide precise details of the issue to help the maintenance team bring the right tools and parts..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => navigate('/resident/my-complaints')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Register Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ResidentLayout>
  )
}
