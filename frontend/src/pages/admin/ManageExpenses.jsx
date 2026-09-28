import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { getAllExpenses, addExpense, deleteExpense } from '../../services/adminService'
import { toast } from 'react-toastify'

export default function ManageExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const [formData, setFormData] = useState({
    category: 'Maintenance',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    paymentMode: 'ONLINE'
  })

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const res = await getAllExpenses()
      if (res.status === 'success') {
        setExpenses(res.data)
      } else {
        toast.error(res.data || 'Failed to load society expenses')
      }
    } catch (err) {
      toast.error('Network error loading expenses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [])

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!formData.category.trim() || !formData.description.trim() || !formData.amount || !formData.expenseDate) {
      toast.warning('Please fill in all expense details')
      return
    }

    try {
      const res = await addExpense(formData)
      if (res.status === 'success') {
        toast.success('Society expense recorded successfully!')
        setShowAddModal(false)
        setFormData({
          category: 'Maintenance',
          description: '',
          amount: '',
          expenseDate: new Date().toISOString().slice(0, 10),
          paymentMode: 'ONLINE'
        })
        loadExpenses()
      } else {
        toast.error(res.data || 'Failed to record expense')
      }
    } catch (err) {
      toast.error('Network error recording expense')
    }
  }

  const handleDeleteExpense = async (expenseId, description) => {
    if (!window.confirm(`Delete expense record "${description}"?`)) {
      return
    }

    try {
      const res = await deleteExpense(expenseId)
      if (res.status === 'success') {
        toast.success('Expense record deleted')
        loadExpenses()
      } else {
        toast.error(res.data || 'Failed to delete expense')
      }
    } catch (err) {
      toast.error('Error deleting expense')
    }
  }

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)

  return (
    <AdminLayout
      title="Society Expenses"
      subtitle="Log operational expenditures, utility bills, vendor contracts, and repairs"
      actionButton={
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Record Society Expense
        </button>
      }
    >
      {/* Modal: Add Expense */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Record Society Expense</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddExpense}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Expense Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="Maintenance">Maintenance & Service</option>
                      <option value="Security">Security Guard Services</option>
                      <option value="Cleaning">Sanitation & Housekeeping</option>
                      <option value="Repairs">Repairs & Replacements</option>
                      <option value="Electricity">Common Area Electricity</option>
                      <option value="Water">Water Supply & Tankers</option>
                      <option value="Gardening">Landscaping & Gardening</option>
                      <option value="Administrative">Office & Administrative</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description / Vendor Name</label>
                    <input
                      type="text"
                      name="description"
                      className="form-control"
                      placeholder="e.g. Lift repair quarterly inspection"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Amount (₹)</label>
                      <input
                        type="number"
                        name="amount"
                        className="form-control"
                        min="1"
                        placeholder="15000"
                        value={formData.amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Expense Date</label>
                      <input
                        type="date"
                        name="expenseDate"
                        className="form-control"
                        value={formData.expenseDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Mode</label>
                    <select
                      name="paymentMode"
                      className="form-select"
                      value={formData.paymentMode}
                      onChange={handleInputChange}
                    >
                      <option value="ONLINE">Online Bank Transfer / NEFT</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Record Expense</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap">
          <span className="fw-bold text-dark"><i className="bi bi-wallet2 me-2 text-primary"></i>Expenses Ledger ({expenses.length})</span>
          <span className="fw-bold text-danger fs-6">
            Total Outflow: ₹{totalExpenseAmount.toLocaleString()}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Expense ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment Mode</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No society expenses recorded.</td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.expense_id}>
                    <td className="fw-bold text-muted">EXP-{e.expense_id}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                        {e.category}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark">{e.description}</td>
                    <td className="fw-bold text-danger">₹{Number(e.amount).toLocaleString()}</td>
                    <td>{new Date(e.expense_date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {e.payment_mode}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Expense"
                        onClick={() => handleDeleteExpense(e.expense_id, e.description)}
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
