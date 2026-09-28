const jwt = require('jsonwebtoken')
const config = require('./config')
const result = require('./result')

function authUser(req, res, next) {
    const allAllowedUrls = ['/auth/login', '/health']

    if (allAllowedUrls.includes(req.path) || allAllowedUrls.includes(req.url)) {
        return next()
    }

    const token = req.headers.token
    if (!token) {
        return res.send(result.createResult('Token is missing'))
    }

    try {
        const payload = jwt.verify(token, config.SECRET)
        req.headers.payload = payload
        next()
    } catch (err) {
        return res.send(result.createResult('Token is Invalid'))
    }
}

function checkAdminAuthorization(req, res, next) {
    if (req.headers.payload && req.headers.payload.role === 'ADMIN') {
        return next()
    } else {
        return res.send(result.createResult('UnAuthorized access'))
    }
}

function checkResidentAuthorization(req, res, next) {
    if (req.headers.payload && req.headers.payload.role === 'RESIDENT') {
        return next()
    } else {
        return res.send(result.createResult('UnAuthorized access'))
    }
}

module.exports = { authUser, checkAdminAuthorization, checkResidentAuthorization }
