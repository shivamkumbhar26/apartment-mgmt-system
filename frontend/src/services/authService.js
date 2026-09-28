import axios from 'axios'
import config from './config'

export async function loginUser(email, password) {
    const URL = config.BASE_URL + '/auth/login'
    const response = await axios.post(URL, { email, password })
    return response.data
}

export function saveAuthData(userData) {
    sessionStorage.setItem('token', userData.token)
    sessionStorage.setItem('role', userData.role)
    sessionStorage.setItem('email', userData.email)
    sessionStorage.setItem('name', userData.name)
    if (userData.flatNumber) sessionStorage.setItem('flatNumber', userData.flatNumber)
    if (userData.residentId) sessionStorage.setItem('residentId', userData.residentId)
}

export function clearAuthData() {
    sessionStorage.clear()
}

export function getAuthToken() {
    return sessionStorage.getItem('token')
}
