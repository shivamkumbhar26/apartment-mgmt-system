require('dotenv').config()

const SECRET = process.env.JWT_SECRET || 'APT_SOCIETY_JWT_SECRET_KEY_2026_COLLEGE_ASSESSMENT'
// SHA-256 for 'resident123'
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD_HASH || '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84'
const PORT = process.env.PORT || 4000

module.exports = { SECRET, DEFAULT_PASSWORD, PORT }
