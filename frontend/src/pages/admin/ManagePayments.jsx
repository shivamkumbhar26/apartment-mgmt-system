import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { getAllPayments, getAllBills, recordPayment } from '../../services/adminService'
import { toast } from 'react-toastify'

export default function ManagePayments() {
  const [payments, setPayments] = useState([])
  const [pendingBills, setPendingBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const location = useLocation()

  const [paymentForm, setPaymentForm] = useState({
    billId: '',
    amountPaid: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMode: 'UPI',
    referenceNumber: '',
    remarks: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [pRes, bRes] = await Promise.all([getAllPayments(), getAllBills()])
      if (pRes.status === 'success') setPayments(pRes.data)
      if (bRes.status === 'success') {
        const pending = bRes.data.filter(b => b.status === 'PENDING')
        setPendingBills(pending)
      }
    } catch (err) {
      toast.error('Error loading payments and bills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // If navigated with preselected bill from ManageBills page
  useEffect(() => {
    if (location.state && location.state.billId) {
      setPaymentForm(prev => ({
        ...prev,
        billId: location.state.billId,
        amountPaid: location.state.amount || ''
      }))
      setShowAddModal(true)
    }
  }, [location.state])

  const handleBillSelect = (billId) => {
    const selected = pendingBills.find(b => String(b.bill_id) === String(billId))
    setPaymentForm(prev => ({
      ...prev,
      billId,
      amountPaid: selected ? selected.amount : ''
    }))
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (!paymentForm.billId || !paymentForm.amountPaid || !paymentForm.paymentDate) {
      toast.warning('Please select a bill, payment amount, and date')
      return
    }

    try {
      const res = await recordPayment(paymentForm)
      if (res.status === 'success') {
        toast.success(res.data.message || 'Payment recorded successfully! Bill marked as PAID.')
        setShowAddModal(false)
        setPaymentForm({
          billId: '',
          amountPaid: '',
          paymentDate: new Date().toISOString().slice(0, 10),
          paymentMode: 'UPI',
          referenceNumber: '',
          remarks: ''
        })
        loadData()
      } else {
        toast.error(res.data || 'Failed to record payment')
      }
    } catch (err) {
      toast.error('Network error recording payment')
    }
  }

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)

  return (
    <AdminLayout
      title="Maintenance Payments"
      subtitle="Track collection receipts, digital payments, cash deposits, and ledger updates"
      actionButton={
        <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle me-1"></i> Record New Payment
        </button>
      }
    >
      {/* Modal: Record Payment */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Record Maintenance Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Pending Bill</label>
                    <select
                      className="form-select"
                      value={paymentForm.billId}
                      onChange={(e) => handleBillSelect(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Pending Bill --</option>
                      {pendingBills.map(b => (
                        <option key={b.bill_id} value={b.bill_id}>
                          Bill #{b.bill_id} - Flat {b.flat_number} ({b.month}) - ₹{Number(b.amount).toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Amount Paid (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={paymentForm.amountPaid}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Payment Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Payment Mode</label>
                      <select
                        className="form-select"
                        value={paymentForm.paymentMode}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                      >
                        <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                        <option value="NET_BANKING">Net Banking / NEFT</option>
                        <option value="CARD">Credit / Debit Card</option>
                        <option value="CASH">Cash</option>
                        <option value="CHEQUE">Cheque</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Transaction / Ref No.</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. UPI-98432109"
                        value={paymentForm.referenceNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label fw-semibold">Remarks / Notes</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Optional notes"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4">Submit Payment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card and Payments Table */}
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap">
          <span className="fw-bold text-dark"><i className="bi bi-credit-card-2-front me-2 text-primary"></i>Payment Transactions ({payments.length})</span>
          <span className="fw-bold text-success fs-6">
            Total Collected: ₹{totalCollected.toLocaleString()}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Receipt ID</th>
                <th>Flat No</th>
                <th>Resident</th>
                <th>Month</th>
                <th>Amount Paid</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Reference No</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">No payments recorded yet.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id}>
                    <td className="fw-bold text-muted">RCPT-{p.payment_id}</td>
                    <td className="fw-bold text-dark">{p.flat_number}</td>
                    <td>{p.resident_name || <span className="text-muted">N/A</span>}</td>
                    <td><span className="badge bg-light text-dark border">{p.month}</span></td>
                    <td className="fw-bold text-success">₹{Number(p.amount_paid).toLocaleString()}</td>
                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                        {p.payment_mode}
                      </span>
                    </td>
                    <td>
                      <code className="text-dark small">{p.reference_number || '-'}</code>
                    </td>
                    <td className="text-muted small">{p.remarks || '-'}</td>
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
