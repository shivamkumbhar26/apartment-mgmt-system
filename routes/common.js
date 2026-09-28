const express = require('express')
const cryptojs = require('crypto-js')
const jwt = require('jsonwebtoken')
const router = express.Router()

const pool = require('../db/pool')
const result = require('../utils/result')
const config = require('../utils/config')

// --------------------------------------------------------
// Health Check Endpoint
// --------------------------------------------------------
router.get('/health', (req, res) => {
    res.send(result.createResult(null, 'Apartment Society API is running'))
})

// --------------------------------------------------------
// User Login (Admin & Resident)
// --------------------------------------------------------
router.post('/auth/login', (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.send(result.createResult('Email and password are required'))
    }

    const hashedPassword = cryptojs.SHA256(password).toString()
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`

    pool.query(sql, [email, hashedPassword], (error, users) => {
        if (error) {
            return res.send(result.createResult(error))
        }

        if (users.length === 0) {
            return res.send(result.createResult('Invalid email or password'))
        }

        const user = users[0]
        const role = user.role

        if (role === 'RESIDENT') {
            const residentSql = `
                SELECT r.resident_id, r.name, r.email, r.phone, r.flat_id, f.flat_number, f.block, f.flat_type
                FROM residents r
                LEFT JOIN flats f ON r.flat_id = f.flat_id
                WHERE r.user_id = ? OR r.email = ?
            `
            pool.query(residentSql, [user.user_id, user.email], (rError, rData) => {
                if (rError) {
                    return res.send(result.createResult(rError))
                }

                const resident = rData.length > 0 ? rData[0] : null
                const payload = {
                    userId: user.user_id,
                    email: user.email,
                    role: 'RESIDENT',
                    residentId: resident ? resident.resident_id : null,
                    flatId: resident ? resident.flat_id : null
                }

                const token = jwt.sign(payload, config.SECRET, { expiresIn: '7d' })
                const responseData = {
                    token,
                    role: 'RESIDENT',
                    userId: user.user_id,
                    email: user.email,
                    name: resident ? resident.name : 'Resident',
                    residentId: resident ? resident.resident_id : null,
                    flatId: resident ? resident.flat_id : null,
                    flatNumber: resident ? resident.flat_number : 'Not Assigned',
                    block: resident ? resident.block : ''
                }
                return res.send(result.createResult(null, responseData))
            })
        } else {
            // ADMIN
            const payload = {
                userId: user.user_id,
                email: user.email,
                role: 'ADMIN'
            }
            const token = jwt.sign(payload, config.SECRET, { expiresIn: '7d' })
            const responseData = {
                token,
                role: 'ADMIN',
                userId: user.user_id,
                email: user.email,
                name: 'Society Manager / Admin'
            }
            return res.send(result.createResult(null, responseData))
        }
    })
})

module.exports = router
