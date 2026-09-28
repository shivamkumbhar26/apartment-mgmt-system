import React, { useEffect, useState } from 'react'
import ResidentLayout from '../../components/ResidentLayout'
import { getMyPayments } from '../../services/residentService'
import { toast } from 'react-toastify'

export default function MyPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true)
        const res = await getMyPayments()
        if (res.status === 'success') {
          setPayments(res.data)
        } else {
          toast.error(res.data || 'Failed to load payments')
        }
      } catch (err) {
        toast.error('Network error loading payments')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  return (
    <ResidentLayout
      title="My Payment History"
      subtitle="Complete ledger of payments made for your flat's maintenance"
    >
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark"><i className="bi bi-clock-history me-2 text-primary"></i>Paid Receipts ({payments.length})</span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Receipt ID</th>
                <th>Month Covered</th>
                <th>Amount Paid</th>
                <th>Payment Date</th>
                <th>Payment Mode</th>
                <th>Reference / Transaction ID</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading payment history...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No completed payment records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id}>
                    <td className="fw-bold text-muted">RCPT-{p.payment_id}</td>
                    <td><span className="fw-semibold text-primary">{p.month}</span></td>
                    <td className="fw-bold text-success">₹{Number(p.amount_paid).toLocaleString()}</td>
                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                        {p.payment_mode}
                      </span>
                    </td>
                    <td><code className="text-dark small">{p.reference_number || '-'}</code></td>
                    <td className="text-muted small">{p.remarks || '-'}</td>
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
