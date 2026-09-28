const express = require('express')
const router = express.Router()
const cryptojs = require('crypto-js')

const pool = require('../db/pool')
const result = require('../utils/result')
const config = require('../utils/config')
const { checkAdminAuthorization } = require('../utils/auth')

// Protect all admin routes
router.use(checkAdminAuthorization)

// ========================================================
// 1. DASHBOARD STATISTICS
// ========================================================
router.get('/dashboard/stats', (req, res) => {
    const statsQuery = `
        SELECT
            (SELECT COUNT(*) FROM flats) AS totalFlats,
            (SELECT COUNT(*) FROM flats WHERE status = 'OCCUPIED') AS occupiedFlats,
            (SELECT COUNT(*) FROM flats WHERE status = 'VACANT') AS vacantFlats,
            (SELECT COUNT(*) FROM residents WHERE status = 'ACTIVE') AS totalResidents,
            (SELECT COUNT(*) FROM maintenance_bills WHERE status = 'PENDING') AS pendingBills,
            (SELECT COUNT(*) FROM maintenance_bills WHERE status = 'PAID') AS paidBills,
            (SELECT COALESCE(SUM(amount_paid), 0) FROM payments) AS totalCollection,
            (SELECT COUNT(*) FROM complaints WHERE status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS')) AS openComplaints,
            (SELECT COUNT(*) FROM complaints WHERE status = 'RESOLVED') AS resolvedComplaints,
            (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS totalExpenses
    `
    pool.query(statsQuery, (error, data) => {
        if (error) {
            return res.send(result.createResult(error))
        }
        res.send(result.createResult(null, data[0]))
    })
})

// ========================================================
// 2. FLATS MANAGEMENT
// ========================================================
router.get('/flats', (req, res) => {
    const sql = `
        SELECT f.flat_id, f.block, f.flat_number, f.floor, f.flat_type, f.status, f.created_at,
               r.resident_id, r.name AS resident_name, r.phone AS resident_phone, r.email AS resident_email
        FROM flats f
        LEFT JOIN residents r ON f.flat_id = r.flat_id AND r.status = 'ACTIVE'
        ORDER BY f.block ASC, f.floor ASC, f.flat_number ASC
    `
    pool.query(sql, (error, data) => {
        res.send(result.createResult(error, data))
    })
})

router.post('/flats', (req, res) => {
    const { block, flatNumber, floor, flatType } = req.body

    if (!block || !flatNumber || floor === undefined || !flatType) {
        return res.send(result.createResult('All flat fields (block, flat number, floor, type) are required'))
    }

    const checkSql = `SELECT flat_id FROM flats WHERE flat_number = ?`
    pool.query(checkSql, [flatNumber.trim()], (err, existing) => {
        if (err) return res.send(result.createResult(err))
        if (existing.length > 0) {
            return res.send(result.createResult(`Flat number ${flatNumber} already exists`))
        }

        const insertSql = `INSERT INTO flats (block, flat_number, floor, flat_type, status) VALUES (?, ?, ?, ?, 'VACANT')`
        pool.query(insertSql, [block.trim().toUpperCase(), flatNumber.trim(), parseInt(floor), flatType.trim()], (error, data) => {
            res.send(result.createResult(error, { message: 'Flat created successfully', flatId: data ? data.insertId : null }))
        })
    })
})

router.put('/flats/:flatId', (req, res) => {
    const flatId = req.params.flatId
    const { block, flatNumber, floor, flatType, status } = req.body

    const updateSql = `
        UPDATE flats 
        SET block = ?, flat_number = ?, floor = ?, flat_type = ?, status = ?
        WHERE flat_id = ?
    `
    pool.query(updateSql, [block, flatNumber, floor, flatType, status, flatId], (error, data) => {
        res.send(result.createResult(error, 'Flat updated successfully'))
    })
})

router.delete('/flats/:flatId', (req, res) => {
    const flatId = req.params.flatId

    // Check if occupied
    const checkSql = `SELECT * FROM residents WHERE flat_id = ? AND status = 'ACTIVE'`
    pool.query(checkSql, [flatId], (err, residents) => {
        if (err) return res.send(result.createResult(err))
        if (residents.length > 0) {
            return res.send(result.createResult('Cannot delete flat with an active resident assigned. Unassign resident first.'))
        }

        const deleteSql = `DELETE FROM flats WHERE flat_id = ?`
        pool.query(deleteSql, [flatId], (error, data) => {
            res.send(result.createResult(error, 'Flat deleted successfully'))
        })
    })
})

// ========================================================
// 3. RESIDENTS MANAGEMENT
// ========================================================
router.get('/residents', (req, res) => {
    const sql = `
        SELECT r.resident_id, r.user_id, r.name, r.email, r.phone, r.move_in_date, r.status, r.created_at,
               f.flat_id, f.flat_number, f.block, f.floor, f.flat_type
        FROM residents r
        LEFT JOIN flats f ON r.flat_id = f.flat_id
        ORDER BY r.name ASC
    `
    pool.query(sql, (error, data) => {
        res.send(result.createResult(error, data))
    })
})

router.post('/residents', (req, res) => {
    const { name, email, phone, flatId, moveInDate, password } = req.body

    if (!name || !email || !phone) {
        return res.send(result.createResult('Name, email, and phone are required'))
    }

    // Step 1: Check if user/resident email already exists
    const checkEmailSql = `SELECT user_id FROM users WHERE email = ?`
    pool.query(checkEmailSql, [email.trim()], (err, existingUsers) => {
        if (err) return res.send(result.createResult(err))
        if (existingUsers.length > 0) {
            return res.send(result.createResult(`User with email '${email}' already exists`))
        }

        // If flat is specified, check if it's already occupied
        if (flatId) {
            const checkFlatSql = `SELECT resident_id FROM residents WHERE flat_id = ? AND status = 'ACTIVE'`
            pool.query(checkFlatSql, [flatId], (fErr, activeResidents) => {
                if (fErr) return res.send(result.createResult(fErr))
                if (activeResidents.length > 0) {
                    return res.send(result.createResult('Selected flat is already occupied by an active resident'))
                }
                createNewResident()
            })
        } else {
            createNewResident()
        }

        function createNewResident() {
            const passHash = password ? cryptojs.SHA256(password).toString() : config.DEFAULT_PASSWORD
            const userSql = `INSERT INTO users (email, password, role) VALUES (?, ?, 'RESIDENT')`

            pool.query(userSql, [email.trim(), passHash], (uErr, uData) => {
                if (uErr) return res.send(result.createResult('Failed to create user account: ' + uErr.message))

                const userId = uData.insertId
                const residentSql = `
                    INSERT INTO residents (user_id, flat_id, name, email, phone, move_in_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
                `
                const dateValue = moveInDate || new Date().toISOString().slice(0, 10)
                pool.query(residentSql, [userId, flatId || null, name.trim(), email.trim(), phone.trim(), dateValue], (rErr, rData) => {
                    if (rErr) return res.send(result.createResult('Failed to register resident: ' + rErr.message))

                    // If flat was assigned, mark flat as OCCUPIED
                    if (flatId) {
                        pool.query(`UPDATE flats SET status = 'OCCUPIED' WHERE flat_id = ?`, [flatId], (updateErr) => {
                            if (updateErr) console.error('Error updating flat status:', updateErr)
                            res.send(result.createResult(null, { message: 'Resident registered and flat assigned successfully', residentId: rData.insertId }))
                        })
                    } else {
                        res.send(result.createResult(null, { message: 'Resident registered successfully', residentId: rData.insertId }))
                    }
                })
            })
        }
    })
})

router.put('/residents/:residentId', (req, res) => {
    const residentId = req.params.residentId
    const { name, phone, moveInDate, status } = req.body

    const sql = `
        UPDATE residents 
        SET name = ?, phone = ?, move_in_date = ?, status = ?
        WHERE resident_id = ?
    `
    pool.query(sql, [name, phone, moveInDate, status, residentId], (error, data) => {
        res.send(result.createResult(error, 'Resident details updated successfully'))
    })
})

// Assign / Reassign Flat to Resident
router.put('/residents/:residentId/assign-flat', (req, res) => {
    const residentId = req.params.residentId
    const { flatId } = req.body

    if (!flatId) {
        return res.send(result.createResult('Flat ID is required'))
    }

    // Check if flat is already occupied by someone else
    const checkFlatSql = `SELECT resident_id, name FROM residents WHERE flat_id = ? AND resident_id != ? AND status = 'ACTIVE'`
    pool.query(checkFlatSql, [flatId, residentId], (fErr, occupied) => {
        if (fErr) return res.send(result.createResult(fErr))
        if (occupied.length > 0) {
            return res.send(result.createResult(`This flat is already assigned to resident '${occupied[0].name}'`))
        }

        // Get resident's previous flat to vacate it if changed
        pool.query(`SELECT flat_id FROM residents WHERE resident_id = ?`, [residentId], (rErr, rData) => {
            if (rErr) return res.send(result.createResult(rErr))
            const oldFlatId = rData.length > 0 ? rData[0].flat_id : null

            // Assign new flat
            pool.query(`UPDATE residents SET flat_id = ? WHERE resident_id = ?`, [flatId, residentId], (uErr) => {
                if (uErr) return res.send(result.createResult(uErr))

                // Mark new flat as OCCUPIED
                pool.query(`UPDATE flats SET status = 'OCCUPIED' WHERE flat_id = ?`, [flatId], () => {
                    // If resident had a different old flat, mark old flat as VACANT
                    if (oldFlatId && oldFlatId != flatId) {
                        pool.query(`UPDATE flats SET status = 'VACANT' WHERE flat_id = ?`, [oldFlatId], () => {})
                    }
                    res.send(result.createResult(null, 'Flat assigned successfully'))
                })
            })
        })
    })
})

// Unassign Flat from Resident
router.put('/residents/:residentId/unassign-flat', (req, res) => {
    const residentId = req.params.residentId

    pool.query(`SELECT flat_id FROM residents WHERE resident_id = ?`, [residentId], (err, data) => {
        if (err) return res.send(result.createResult(err))
        if (data.length === 0 || !data[0].flat_id) {
            return res.send(result.createResult('Resident does not have an assigned flat'))
        }

        const flatId = data[0].flat_id
        pool.query(`UPDATE residents SET flat_id = NULL WHERE resident_id = ?`, [residentId], (uErr) => {
            if (uErr) return res.send(result.createResult(uErr))

            pool.query(`UPDATE flats SET status = 'VACANT' WHERE flat_id = ?`, [flatId], (fErr) => {
                res.send(result.createResult(fErr, 'Flat unassigned successfully'))
            })
        })
    })
})

router.delete('/residents/:residentId', (req, res) => {
    const residentId = req.params.residentId

    pool.query(`SELECT user_id, flat_id FROM residents WHERE resident_id = ?`, [residentId], (err, data) => {
        if (err) return res.send(result.createResult(err))
        if (data.length === 0) return res.send(result.createResult('Resident not found'))

        const { user_id, flat_id } = data[0]

        // Delete resident
        pool.query(`DELETE FROM residents WHERE resident_id = ?`, [residentId], (rErr) => {
            if (rErr) return res.send(result.createResult(rErr))

            // Vacate flat if assigned
            if (flat_id) {
                pool.query(`UPDATE flats SET status = 'VACANT' WHERE flat_id = ?`, [flat_id], () => {})
            }
            // Delete user login account
            if (user_id) {
                pool.query(`DELETE FROM users WHERE user_id = ?`, [user_id], () => {})
            }
            res.send(result.createResult(null, 'Resident removed successfully'))
        })
    })
})

// ========================================================
// 4. MAINTENANCE BILLS
// ========================================================
router.get('/bills', (req, res) => {
    const sql = `
        SELECT b.bill_id, b.flat_id, b.month, b.amount, b.due_date, b.status, b.created_at,
               f.flat_number, f.block, f.flat_type,
               r.resident_id, r.name AS resident_name, r.phone AS resident_phone,
               p.payment_id, p.amount_paid, p.payment_date, p.payment_mode, p.reference_number
        FROM maintenance_bills b
        JOIN flats f ON b.flat_id = f.flat_id
        LEFT JOIN residents r ON f.flat_id = r.flat_id AND r.status = 'ACTIVE'
        LEFT JOIN payments p ON b.bill_id = p.bill_id
        ORDER BY b.due_date DESC, b.bill_id DESC
    `
    pool.query(sql, (error, data) => {
        res.send(result.createResult(error, data))
    })
})

router.post('/bills', (req, res) => {
    const { flatId, month, amount, dueDate } = req.body

    if (!flatId || !month || !amount || !dueDate) {
        return res.send(result.createResult('Flat, month, amount, and due date are required'))
    }

    if (amount <= 0) {
        return res.send(result.createResult('Bill amount must be greater than 0'))
    }

    // Check if flat exists
    pool.query(`SELECT flat_id, flat_number FROM flats WHERE flat_id = ?`, [flatId], (err, flats) => {
        if (err) return res.send(result.createResult(err))
        if (flats.length === 0) return res.send(result.createResult('Selected flat does not exist'))

        // Check if bill for this flat + month already exists
        const checkDuplicateSql = `SELECT bill_id FROM maintenance_bills WHERE flat_id = ? AND month = ?`
        pool.query(checkDuplicateSql, [flatId, month.trim()], (dErr, existingBills) => {
            if (dErr) return res.send(result.createResult(dErr))
            if (existingBills.length > 0) {
                return res.send(result.createResult(`A bill for flat ${flats[0].flat_number} for '${month}' already exists`))
            }

            const insertSql = `
                INSERT INTO maintenance_bills (flat_id, month, amount, due_date, status)
                VALUES (?, ?, ?, ?, 'PENDING')
            `
            pool.query(insertSql, [flatId, month.trim(), amount, dueDate], (error, data) => {
                res.send(result.createResult(error, { message: 'Maintenance bill created successfully', billId: data ? data.insertId : null }))
            })
        })
    })
})

// Batch generate bills for all occupied flats for a month
router.post('/bills/generate-batch', (req, res) => {
    const { month, amount, dueDate } = req.body

    if (!month || !amount || !dueDate) {
        return res.send(result.createResult('Month, amount, and due date are required'))
    }

    // Get all occupied flats
    const occupiedSql = `SELECT flat_id FROM flats WHERE status = 'OCCUPIED'`
    pool.query(occupiedSql, (err, flats) => {
        if (err) return res.send(result.createResult(err))
        if (flats.length === 0) {
            return res.send(result.createResult('No occupied flats found to generate bills for'))
        }

        let createdCount = 0
        let skippedCount = 0
        let processed = 0

        flats.forEach(flat => {
            const insertSql = `
                INSERT IGNORE INTO maintenance_bills (flat_id, month, amount, due_date, status)
                VALUES (?, ?, ?, ?, 'PENDING')
            `
            pool.query(insertSql, [flat.flat_id, month.trim(), amount, dueDate], (insertErr, resultData) => {
                processed++
                if (!insertErr && resultData.affectedRows > 0) {
                    createdCount++
                } else {
                    skippedCount++
                }

                if (processed === flats.length) {
                    res.send(result.createResult(null, {
                        message: `Generated ${createdCount} bills for '${month}'. (${skippedCount} already existed or skipped)`
                    }))
                }
            })
        })
    })
})

router.delete('/bills/:billId', (req, res) => {
    const billId = req.params.billId

    pool.query(`SELECT status FROM maintenance_bills WHERE bill_id = ?`, [billId], (err, bills) => {
        if (err) return res.send(result.createResult(err))
        if (bills.length === 0) return res.send(result.createResult('Bill not found'))

        if (bills[0].status === 'PAID') {
            return res.send(result.createResult('Cannot delete a bill that has already been PAID. Reverse payment first if needed.'))
        }

        pool.query(`DELETE FROM maintenance_bills WHERE bill_id = ?`, [billId], (error, data) => {
            res.send(result.createResult(error, 'Maintenance bill deleted successfully'))
        })
    })
})

// ========================================================
// 5. PAYMENTS MANAGEMENT
// ========================================================
router.get('/payments', (req, res) => {
    const sql = `
        SELECT p.payment_id, p.bill_id, p.amount_paid, p.payment_date, p.payment_mode, p.reference_number, p.remarks, p.created_at,
               b.month, b.amount AS billed_amount,
               f.flat_number, f.block,
               r.name AS resident_name, r.phone AS resident_phone
        FROM payments p
        JOIN maintenance_bills b ON p.bill_id = b.bill_id
        JOIN flats f ON b.flat_id = f.flat_id
        LEFT JOIN residents r ON f.flat_id = r.flat_id
        ORDER BY p.payment_date DESC, p.payment_id DESC
    `
    pool.query(sql, (error, data) => {
        res.send(result.createResult(error, data))
    })
})

router.post('/payments', (req, res) => {
    const { billId, amountPaid, paymentDate, paymentMode, referenceNumber, remarks } = req.body

    if (!billId || !amountPaid || !paymentDate) {
        return res.send(result.createResult('Bill, payment amount, and payment date are required'))
    }

    if (amountPaid <= 0) {
        return res.send(result.createResult('Payment amount must be greater than 0'))
    }

    // Verify bill exists and is not already paid
    pool.query(`SELECT bill_id, amount, status FROM maintenance_bills WHERE bill_id = ?`, [billId], (bErr, bills) => {
        if (bErr) return res.send(result.createResult(bErr))
        if (bills.length === 0) return res.send(result.createResult('Bill not found'))

        if (bills[0].status === 'PAID') {
            return res.send(result.createResult('This bill is already recorded as PAID'))
        }

        // Insert payment record
        const insertPaymentSql = `
            INSERT INTO payments (bill_id, amount_paid, payment_date, payment_mode, reference_number, remarks)
            VALUES (?, ?, ?, ?, ?, ?)
        `
        const mode = paymentMode || 'UPI'
        pool.query(insertPaymentSql, [billId, amountPaid, paymentDate, mode, referenceNumber || null, remarks || null], (pErr, pData) => {
            if (pErr) return res.send(result.createResult('Failed to record payment: ' + pErr.message))

            // Mark bill as PAID
            pool.query(`UPDATE maintenance_bills SET status = 'PAID' WHERE bill_id = ?`, [billId], (uErr) => {
                if (uErr) return res.send(result.createResult('Payment saved, but failed to update bill status: ' + uErr.message))

                res.send(result.createResult(null, {
                    message: 'Payment recorded successfully. Bill marked as PAID.',
                    paymentId: pData.insertId
                }))
            })
        })
    })
})

// ========================================================
// 6. COMPLAINTS MANAGEMENT
// ========================================================
router.get('/complaints', (req, res) => {
    const sql = `
        SELECT c.complaint_id, c.resident_id, c.category, c.title, c.description, c.priority, c.status,
               c.assigned_to, c.resolution_remarks, c.created_at, c.updated_at,
               r.name AS resident_name, r.phone AS resident_phone, r.email AS resident_email,
               f.flat_number, f.block
        FROM complaints c
        JOIN residents r ON c.resident_id = r.resident_id
        LEFT JOIN flats f ON r.flat_id = f.flat_id
        ORDER BY 
            CASE c.status
                WHEN 'OPEN' THEN 1
                WHEN 'ASSIGNED' THEN 2
                WHEN 'IN_PROGRESS' THEN 3
                WHEN 'RESOLVED' THEN 4
            END,
            c.created_at DESC
    `
    pool.query(sql, (error, data) => {
        res.send(result.createResult(error, data))
    })
})

// Assign complaint to technician / staff
router.put('/complaints/:complaintId/assign', (req, res) => {
    const complaintId = req.params.complaintId
    const { assignedTo } = req.body

    if (!assignedTo || !assignedTo.trim()) {
        return res.send(result.createResult('Assigned personnel name is required'))
    }

    const sql = `
        UPDATE complaints 
        SET assigned_to = ?, 
            status = CASE WHEN status = 'OPEN' THEN 'ASSIGNED' ELSE status END
        WHERE complaint_id = ?
    `
    pool.query(sql, [assignedTo.trim(), complaintId], (error, data) => {
        res.send(result.createResult(error, 'Complaint assigned successfully'))
    })
})

// Update complaint status and resolution notes
router.put('/complaints/:complaintId/status', (req, res) => {
    const complaintId = req.params.complaintId
    const { status, resolutionRemarks } = req.body

    const validStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED']
    if (!validStatuses.includes(status)) {
        return res.send(result.createResult(`Invalid status. Must be one of: ${validStatuses.join(', ')}`))
    }

    const sql = `
        UPDATE complaints 
        SET status = ?, resolution_remarks = ?
        WHERE complaint_id = ?
    `
    pool.query(sql, [status, resolutionRemarks || null, complaintId], (error, data) => {
        res.send(result.createResult(error, `Complaint status updated to ${status}`))
    })
})

// ========================================================
// 7. SOCIETY EXPENSES MANAGEMENT
// ========================================================
router.get('/expenses', (req, res) => {
    const sql = `
        SELECT e.expense_id, e.category, e.description, e.amount, e.expense_date, e.payment_mode, e.created_at,
               u.email AS created_by_email
        FROM expenses e
        LEFT JOIN users u ON e.created_by = u.user_id
        ORDER BY e.expense_date DESC, e.expense_id DESC
    `
    pool.query(sql, (error, data) => {
        res.send(result.createResult(error, data))
    })
})

router.post('/expenses', (req, res) => {
    const { category, description, amount, expenseDate, paymentMode } = req.body
    const userId = req.headers.payload ? req.headers.payload.userId : null

    if (!category || !description || !amount || !expenseDate) {
        return res.send(result.createResult('Category, description, amount, and expense date are required'))
    }

    if (amount <= 0) {
        return res.send(result.createResult('Expense amount must be greater than 0'))
    }

    const sql = `
        INSERT INTO expenses (category, description, amount, expense_date, payment_mode, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    const mode = paymentMode || 'ONLINE'
    pool.query(sql, [category.trim(), description.trim(), amount, expenseDate, mode, userId], (error, data) => {
        res.send(result.createResult(error, { message: 'Expense recorded successfully', expenseId: data ? data.insertId : null }))
    })
})

router.delete('/expenses/:expenseId', (req, res) => {
    const expenseId = req.params.expenseId
    const sql = `DELETE FROM expenses WHERE expense_id = ?`
    pool.query(sql, [expenseId], (error, data) => {
        res.send(result.createResult(error, 'Expense deleted successfully'))
    })
})

module.exports = router
