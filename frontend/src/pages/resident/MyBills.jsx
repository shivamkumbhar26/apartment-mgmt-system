import React, { useEffect, useState } from 'react'
import ResidentLayout from '../../components/ResidentLayout'
import { getMyBills } from '../../services/residentService'
import { toast } from 'react-toastify'

export default function MyBills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBills() {
      try {
        setLoading(true)
        const res = await getMyBills()
        if (res.status === 'success') {
          setBills(res.data)
        } else {
          toast.error(res.data || 'Failed to load bills')
        }
      } catch (err) {
        toast.error('Network error loading bills')
      } finally {
        setLoading(false)
      }
    }
    fetchBills()
  }, [])

  return (
    <ResidentLayout
      title="My Maintenance Bills"
      subtitle="Monthly maintenance charges, billing records, and payment receipts"
    >
      <div className="card custom-card border-0 shadow-sm overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark"><i className="bi bi-receipt me-2 text-primary"></i>Maintenance Invoices ({bills.length})</span>
          <span className="badge bg-warning-subtle text-warning-emphasis">
            Pending: {bills.filter(b => b.status === 'PENDING').length}
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small text-uppercase">
              <tr>
                <th>Invoice #</th>
                <th>Month</th>
                <th>Bill Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Mode</th>
                <th>Reference No</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2"></div>Loading bills...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No maintenance bills found for your flat.</td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.bill_id}>
                    <td className="fw-bold text-muted">INV-{b.bill_id}</td>
                    <td className="fw-semibold text-primary">{b.month}</td>
                    <td className="fw-bold text-dark">₹{Number(b.amount).toLocaleString()}</td>
                    <td>{new Date(b.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${b.status === 'PAID' ? 'badge-paid' : 'badge-pending'} px-2 py-1`}>
                        {b.status}
                      </span>
                    </td>
                    <td>{b.payment_mode ? <span className="badge bg-light text-dark border">{b.payment_mode}</span> : '-'}</td>
                    <td>
                      {b.reference_number ? (
                        <code className="text-dark small">{b.reference_number}</code>
                      ) : (
                        <span className="text-muted small">-</span>
                      )}
                    </td>
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
