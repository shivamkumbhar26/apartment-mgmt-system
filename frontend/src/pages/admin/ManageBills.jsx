import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getAllBills, getAllFlats, createBill, generateBatchBills, deleteBill } from '../../services/adminService'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function ManageBills() {
  const [bills, setBills] = useState([])
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const navigate = useNavigate()

  const [singleBill, setSingleBill] = useState({
    flatId: '',
    month: 'October 2026',
    amount: 2500,
    dueDate: '2026-10-10'
  })

  const [batchBill, setBatchBill] = useState({
    month: 'November 2026',
    amount: 2500,
    dueDate: '2026-11-10'
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [bRes, fRes] = await Promise.all([getAllBills(), getAllFlats()])
      if (bRes.status === 'success') setBills(bRes.data)
      if (fRes.status === 'success') setFlats(fRes.data)
    } catch (err) {
      toast.error('Error loading maintenance bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateSingle = async (e) => {
    e.preventDefault()
    if (!singleBill.flatId || !singleBill.month.trim() || !singleBill.amount || !singleBill.dueDate) {
      toast.warning('Please fill all bill fields')
      return
    }

    try {
      const res = await createBill(singleBill)
      if (res.status === 'success') {
        toast.success('Maintenance bill created successfully!')
        setShowCreateModal(false)
        loadData()
      } else {
        toast.error(res.data || 'Failed to create bill')
      }
    } catch (err) {
      toast.error('Network error creating bill')
    }
  }

  const handleBatchGenerate = async (e) => {
    e.preventDefault()
    if (!batchBill.month.trim() || !batchBill.amount || !batchBill.dueDate) {
      toast.warning('Please specify month, amount, and due date')
      return
    }

    try {
      const res = await generateBatchBills(batchBill)
      if (res.status === 'success') {
        toast.success(res.data.message || 'Batch bills generated!')
        setShowBatchModal(false)
        loadData()
      } else {
        toast.error(res.data || 'Failed to generate batch bills')
      }
    } catch (err) {
      toast.error('Network error generating bills')
    }
  }

  const handleDeleteBill = async (billId, month, flatNumber) => {
    if (!window.confirm(`Delete maintenance bill for flat ${flatNumber} (${month})?`)) {
      return
    }

    try {
      const res = await deleteBill(billId)
      if (res.status === 'success') {
        toast.success('Bill deleted successfully')
        loadData()
      } else {
        toast.error(res.data || 'Failed to delete bill')
      }
    } catch (err) {
      toast.error('Error deleting bill')
    }
  }

  const filteredBills = bills.filter(b => {
    if (filterStatus === 'ALL') return true
    return b.status === filterStatus
  })

  return (
    <AdminLayout
      title="Maintenance Bills"
      subtitle="Issue monthly maintenance invoices, track pending dues, and manage bill statuses"
      actionButton={
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => setShowBatchModal(true)}>
            <i className="bi bi-stack me-1"></i> Generate Batch Bills
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-plus-circle me-1"></i> Create Single Bill
          </button>
        </div>
      }
    >
      {/* Modal: Single Bill */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Create Maintenance Bill</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateSingle}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Target Flat</label>
                    <select
                      className="form-select"
                      value={singleBill.flatId}
                      onChange={(e) => setSingleBill({ ...singleBill, flatId: e.target.value })}
                      required
                    >
                      <option value="">-- Select Flat --</option>
                      {flats.map(f => (
                        <option key={f.flat_id} value={f.flat_id}>
                          Flat {f.flat_number} ({f.block} Block) {f.resident_name ? ` - Occupied by ${f.resident_name}` : ' - Vacant'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Billing Month</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. October 2026"
                      value={singleBill.month}
                      onChange={(e) => setSingleBill({ ...singleBill, month: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Bill Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="100"
                      value={singleBill.amount}
                      onChange={(e) => setSingleBill({ ...singleBill, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={singleBill.dueDate}
                      onChange={(e) => setSingleBill({ ...singleBill, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Generate Bill</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Batch Generate Bills */}
      {showBatchModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Batch Generate Bills for All Occupied Flats</h5>
                <button type="button" className="btn-close" onClick={() => setShowBatchModal(false)}></button>
              </div>
              <form onSubmit={handleBatchGenerate}>
                <div className="modal-body p-4">
                  <div className="alert alert-info py-2 small">
                    <i className="bi bi-info-circle me-1"></i> This will generate identical maintenance invoices for every active occupied flat for the chosen month.
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Billing Month</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. November 2026"
                      value={batchBill.month}
                      onChange={(e) => setBatchBill({ ...batchBill, month: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Amount per Flat (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="100"
                      value={batchBill.amount}
                      onChange={(e) => setBatchBill({ ...batchBill, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={batchBill.dueDate}
                      onChange={(e) => setBatchBill({ ...batchBill, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowBatchModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Generate Batch</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span className="fw-bold text-dark"><i className="bi bi-receipt me-2 text-primary"></i>All Bills ({bills.length})</span>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Filter:</span>
            <div className="btn-group btn-group-sm">
              <button
                className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('ALL')}
              >
                All ({bills.length})
              </button>
              <button
                className={`btn ${filterStatus === 'PENDING' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('PENDING')}
              >
                Pending ({bills.filter(b => b.status === 'PENDING').length})
              </button>
              <button
                className={`btn ${filterStatus === 'PAID' ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setFilterStatus('PAID')}
              >
                Paid ({bills.filter(b => b.status === 'PAID').length})
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Bill ID</th>
                <th>Flat No</th>
                <th>Resident</th>
                <th>Billing Month</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading bills...
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No maintenance bills found.</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.bill_id}>
                    <td className="text-muted fw-bold">#{bill.bill_id}</td>
                    <td className="fw-bold text-dark">{bill.flat_number}</td>
                    <td>{bill.resident_name || <span className="text-muted fst-italic">Vacant Flat</span>}</td>
                    <td><span className="fw-semibold text-primary">{bill.month}</span></td>
                    <td className="fw-bold">₹{Number(bill.amount).toLocaleString()}</td>
                    <td>{new Date(bill.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${bill.status === 'PAID' ? 'badge-paid' : 'badge-pending'} px-2 py-1`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {bill.status === 'PENDING' ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            title="Record Payment"
                            onClick={() => navigate('/admin/payments', { state: { billId: bill.bill_id, amount: bill.amount } })}
                          >
                            <i className="bi bi-cash me-1"></i> Pay
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Delete Bill"
                            onClick={() => handleDeleteBill(bill.bill_id, bill.month, bill.flat_number)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ) : (
                        <span className="badge bg-light text-success border border-success-subtle">
                          <i className="bi bi-check2-all me-1"></i> Paid
                        </span>
                      )}
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
