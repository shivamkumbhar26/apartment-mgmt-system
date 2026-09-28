require('dotenv').config()
const mysql2 = require('mysql2')

const pool = mysql2.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'manager',
    database: process.env.DB_NAME || 'apartment_society_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

pool.on('error', (err) => {
    console.error('MySQL Pool Error:', err)
})

module.exports = pool
