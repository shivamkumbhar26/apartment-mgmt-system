import axios from 'axios'
import config from './config'

function getHeaders() {
    const token = sessionStorage.getItem('token')
    return { token }
}

export async function getResidentDashboard() {
    const URL = config.BASE_URL + '/resident/dashboard'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function getMyFlat() {
    const URL = config.BASE_URL + '/resident/my-flat'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function getMyBills() {
    const URL = config.BASE_URL + '/resident/my-bills'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function getMyPayments() {
    const URL = config.BASE_URL + '/resident/my-payments'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function getMyComplaints() {
    const URL = config.BASE_URL + '/resident/my-complaints'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function raiseComplaint(complaintData) {
    const URL = config.BASE_URL + '/resident/complaints'
    const response = await axios.post(URL, complaintData, { headers: getHeaders() })
    return response.data
}

export async function changePassword(passwordData) {
    const URL = config.BASE_URL + '/resident/change-password'
    const response = await axios.put(URL, passwordData, { headers: getHeaders() })
    return response.data
}
