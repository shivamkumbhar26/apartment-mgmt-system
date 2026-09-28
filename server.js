require('dotenv').config()
const express = require('express')
const cors = require('cors')

const commonRouter = require('./routes/common')
const adminRouter = require('./routes/admin')
const residentRouter = require('./routes/resident')
const { authUser } = require('./utils/auth')
const config = require('./utils/config')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Global Authentication Middleware
app.use(authUser)

// Mount Routers
app.use(commonRouter)
app.use('/admin', adminRouter)
app.use('/resident', residentRouter)

const PORT = config.PORT || 4000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apartment Society Management System API running on port ${PORT}`)
})

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason)
})
