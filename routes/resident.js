const express = require('express')
const router = express.Router()
const cryptojs = require('crypto-js')

const pool = require('../db/pool')
const result = require('../utils/result')
const { checkResidentAuthorization } = require('../utils/auth')

// Protect all resident routes
router.use(checkResidentAuthorization)

// Helper: Resolve resident_id & flat_id securely from the JWT payload
function getResidentContext(req, callback) {
    const payload = req.headers.payload
    const sql = `
        SELECT r.resident_id, r.user_id, r.flat_id, r.name, r.email, r.phone, r.move_in_date, r.status,
               f.flat_number, f.block, f.floor, f.flat_type
        FROM residents r
        LEFT JOIN flats f ON r.flat_id = f.flat_id
        WHERE r.user_id = ? OR r.email = ?
    `
    pool.query(sql, [payload.userId, payload.email], (err, data) => {
        if (err) return callback(err, null)
        if (data.length === 0) return callback('Resident profile not found', null)
        return callback(null, data[0])
    })
}

// ========================================================
// 1. RESIDENT DASHBOARD SUMMARY
// ========================================================
router.get('/dashboard', (req, res) => {
    getResidentContext(req, (err, resident) => {
        if (err) return res.send(result.createResult(err))

        const flatId = resident.flat_id
        const residentId = resident.resident_id

        if (!flatId) {
            return res.send(result.createResult(null, {
                resident,
                pendingBillsCount: 0,
                totalPendingAmount: 0,
                paidBillsCount: 0,
                totalPaidAmount: 0,
                activeComplaintsCount: 0,
                resolvedComplaintsCount: 0
            }))
        }

        const summarySql = `
            SELECT
                (SELECT COUNT(*) FROM maintenance_bills WHERE flat_id = ? AND status = 'PENDING') AS pendingBillsCount,
                (SELECT COALESCE(SUM(amount), 0) FROM maintenance_bills WHERE flat_id = ? AND status = 'PENDING') AS totalPendingAmount,
                (SELECT COUNT(*) FROM maintenance_bills WHERE flat_id = ? AND status = 'PAID') AS paidBillsCount,
                (SELECT COALESCE(SUM(amount), 0) FROM maintenance_bills WHERE flat_id = ? AND status = 'PAID') AS totalPaidAmount,
                (SELECT COUNT(*) FROM complaints WHERE resident_id = ? AND status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS')) AS activeComplaintsCount,
                (SELECT COUNT(*) FROM complaints WHERE resident_id = ? AND status = 'RESOLVED') AS resolvedComplaintsCount
        `
        pool.query(summarySql, [flatId, flatId, flatId, flatId, residentId, residentId], (sErr, sData) => {
            if (sErr) return res.send(result.createResult(sErr))
            res.send(result.createResult(null, {
                resident,
                ...sData[0]
            }))
        })
    })
})

// ========================================================
// 2. MY FLAT DETAILS
// ========================================================
router.get('/my-flat', (req, res) => {
    getResidentContext(req, (err, resident) => {
        if (err) return res.send(result.createResult(err))
        if (!resident.flat_id) {
            return res.send(result.createResult(null, { assigned: false, message: 'No flat currently assigned' }))
        }

        const sql = `
            SELECT f.flat_id, f.block, f.flat_number, f.floor, f.flat_type, f.status,
                   r.resident_id, r.name AS resident_name, r.email, r.phone, r.move_in_date
            FROM flats f
            JOIN residents r ON f.flat_id = r.flat_id
            WHERE r.resident_id = ?
        `
        pool.query(sql, [resident.resident_id], (fErr, fData) => {
            if (fErr) return res.send(result.createResult(fErr))
            res.send(result.createResult(null, { assigned: true, ...fData[0] }))
        })
    })
})

// ========================================================
// 3. MY MAINTENANCE BILLS
// ========================================================
router.get('/my-bills', (req, res) => {
    getResidentContext(req, (err, resident) => {
        if (err) return res.send(result.createResult(err))
        if (!resident.flat_id) {
            return res.send(result.createResult(null, []))
        }

        const sql = `
            SELECT b.bill_id, b.flat_id, b.month, b.amount, b.due_date, b.status, b.created_at,
                   p.payment_id, p.amount_paid, p.payment_date, p.payment_mode, p.reference_number
            FROM maintenance_bills b
            LEFT JOIN payments p ON b.bill_id = p.bill_id
            WHERE b.flat_id = ?
            ORDER BY b.due_date DESC
        `
        pool.query(sql, [resident.flat_id], (bErr, bills) => {
            res.send(result.createResult(bErr, bills))
        })
    })
})

// ========================================================
// 4. MY PAYMENTS HISTORY
// ========================================================
router.get('/my-payments', (req, res) => {
    getResidentContext(req, (err, resident) => {
        if (err) return res.send(result.createResult(err))
        if (!resident.flat_id) {
            return res.send(result.createResult(null, []))
        }

        const sql = `
            SELECT p.payment_id, p.bill_id, p.amount_paid, p.payment_date, p.payment_mode, p.reference_number, p.remarks, p.created_at,
                   b.month, b.amount AS billed_amount,
                   f.flat_number, f.block
            FROM payments p
            JOIN maintenance_bills b ON p.bill_id = b.bill_id
            JOIN flats f ON b.flat_id = f.flat_id
            WHERE b.flat_id = ?
            ORDER BY p.payment_date DESC, p.payment_id DESC
        `
        pool.query(sql, [resident.flat_id], (pErr, payments) => {
            res.send(result.createResult(pErr, payments))
        })
    })
})

// ========================================================
// 5. MY COMPLAINTS
// ========================================================
router.get('/my-complaints', (req, res) => {
    getResidentContext(req, (err, resident) => {
        if (err) return res.send(result.createResult(err))

        const sql = `
            SELECT c.complaint_id, c.resident_id, c.category, c.title, c.description, c.priority, c.status,
                   c.assigned_to, c.resolution_remarks, c.created_at, c.updated_at
            FROM complaints c
            WHERE c.resident_id = ?
            ORDER BY c.created_at DESC
        `
        pool.query(sql, [resident.resident_id], (cErr, complaints) => {
            res.send(result.createResult(cErr, complaints))
        })
    })
})

// Raise a new complaint
router.post('/complaints', (req, res) => {
    const { category, title, description, priority } = req.body

    if (!category || !title || !description) {
        return res.send(result.createResult('Category, title, and description are required'))
    }

    getResidentContext(req, (err, resident) => {
        if (err) return res.send(result.createResult(err))

        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        const complaintPriority = validPriorities.includes(priority) ? priority : 'MEDIUM'

        const sql = `
            INSERT INTO complaints (resident_id, category, title, description, priority, status)
            VALUES (?, ?, ?, ?, ?, 'OPEN')
        `
        pool.query(sql, [resident.resident_id, category.trim(), title.trim(), description.trim(), complaintPriority], (cErr, data) => {
            res.send(result.createResult(cErr, { message: 'Complaint registered successfully', complaintId: data ? data.insertId : null }))
        })
    })
})

// ========================================================
// 6. CHANGE PASSWORD
// ========================================================
router.put('/change-password', (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!newPassword || !confirmPassword) {
        return res.send(result.createResult('New password and confirmation are required'))
    }

    if (newPassword !== confirmPassword) {
        return res.send(result.createResult('Passwords do not match'))
    }

    if (newPassword.length < 6) {
        return res.send(result.createResult('New password must be at least 6 characters'))
    }

    const email = req.headers.payload.email
    const newHash = cryptojs.SHA256(newPassword).toString()

    // If current password provided, check it
    if (currentPassword) {
        const curHash = cryptojs.SHA256(currentPassword).toString()
        pool.query(`SELECT user_id FROM users WHERE email = ? AND password = ?`, [email, curHash], (vErr, users) => {
            if (vErr) return res.send(result.createResult(vErr))
            if (users.length === 0) return res.send(result.createResult('Incorrect current password'))

            pool.query(`UPDATE users SET password = ? WHERE email = ?`, [newHash, email], (uErr) => {
                res.send(result.createResult(uErr, 'Password updated successfully'))
            })
        })
    } else {
        pool.query(`UPDATE users SET password = ? WHERE email = ?`, [newHash, email], (uErr) => {
            res.send(result.createResult(uErr, 'Password updated successfully'))
        })
    }
})

module.exports = router
