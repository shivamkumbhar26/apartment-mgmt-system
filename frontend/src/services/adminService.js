import axios from 'axios'
import config from './config'

function getHeaders() {
    const token = sessionStorage.getItem('token')
    return { token }
}

// --------------------------------------------------------
// Dashboard
// --------------------------------------------------------
export async function getDashboardStats() {
    const URL = config.BASE_URL + '/admin/dashboard/stats'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

// --------------------------------------------------------
// Flats
// --------------------------------------------------------
export async function getAllFlats() {
    const URL = config.BASE_URL + '/admin/flats'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function addFlat(flatData) {
    const URL = config.BASE_URL + '/admin/flats'
    const response = await axios.post(URL, flatData, { headers: getHeaders() })
    return response.data
}

export async function updateFlat(flatId, flatData) {
    const URL = config.BASE_URL + `/admin/flats/${flatId}`
    const response = await axios.put(URL, flatData, { headers: getHeaders() })
    return response.data
}

export async function deleteFlat(flatId) {
    const URL = config.BASE_URL + `/admin/flats/${flatId}`
    const response = await axios.delete(URL, { headers: getHeaders() })
    return response.data
}

// --------------------------------------------------------
// Residents
// --------------------------------------------------------
export async function getAllResidents() {
    const URL = config.BASE_URL + '/admin/residents'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function addResident(residentData) {
    const URL = config.BASE_URL + '/admin/residents'
    const response = await axios.post(URL, residentData, { headers: getHeaders() })
    return response.data
}

export async function updateResident(residentId, residentData) {
    const URL = config.BASE_URL + `/admin/residents/${residentId}`
    const response = await axios.put(URL, residentData, { headers: getHeaders() })
    return response.data
}

export async function assignFlatToResident(residentId, flatId) {
    const URL = config.BASE_URL + `/admin/residents/${residentId}/assign-flat`
    const response = await axios.put(URL, { flatId }, { headers: getHeaders() })
    return response.data
}

export async function unassignFlatFromResident(residentId) {
    const URL = config.BASE_URL + `/admin/residents/${residentId}/unassign-flat`
    const response = await axios.put(URL, {}, { headers: getHeaders() })
    return response.data
}

export async function deleteResident(residentId) {
    const URL = config.BASE_URL + `/admin/residents/${residentId}`
    const response = await axios.delete(URL, { headers: getHeaders() })
    return response.data
}

// --------------------------------------------------------
// Maintenance Bills
// --------------------------------------------------------
export async function getAllBills() {
    const URL = config.BASE_URL + '/admin/bills'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function createBill(billData) {
    const URL = config.BASE_URL + '/admin/bills'
    const response = await axios.post(URL, billData, { headers: getHeaders() })
    return response.data
}

export async function generateBatchBills(batchData) {
    const URL = config.BASE_URL + '/admin/bills/generate-batch'
    const response = await axios.post(URL, batchData, { headers: getHeaders() })
    return response.data
}

export async function deleteBill(billId) {
    const URL = config.BASE_URL + `/admin/bills/${billId}`
    const response = await axios.delete(URL, { headers: getHeaders() })
    return response.data
}

// --------------------------------------------------------
// Payments
// --------------------------------------------------------
export async function getAllPayments() {
    const URL = config.BASE_URL + '/admin/payments'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function recordPayment(paymentData) {
    const URL = config.BASE_URL + '/admin/payments'
    const response = await axios.post(URL, paymentData, { headers: getHeaders() })
    return response.data
}

// --------------------------------------------------------
// Complaints
// --------------------------------------------------------
export async function getAllComplaints() {
    const URL = config.BASE_URL + '/admin/complaints'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function assignComplaint(complaintId, assignedTo) {
    const URL = config.BASE_URL + `/admin/complaints/${complaintId}/assign`
    const response = await axios.put(URL, { assignedTo }, { headers: getHeaders() })
    return response.data
}

export async function updateComplaintStatus(complaintId, status, resolutionRemarks) {
    const URL = config.BASE_URL + `/admin/complaints/${complaintId}/status`
    const response = await axios.put(URL, { status, resolutionRemarks }, { headers: getHeaders() })
    return response.data
}

// --------------------------------------------------------
// Expenses
// --------------------------------------------------------
export async function getAllExpenses() {
    const URL = config.BASE_URL + '/admin/expenses'
    const response = await axios.get(URL, { headers: getHeaders() })
    return response.data
}

export async function addExpense(expenseData) {
    const URL = config.BASE_URL + '/admin/expenses'
    const response = await axios.post(URL, expenseData, { headers: getHeaders() })
    return response.data
}

export async function deleteExpense(expenseId) {
    const URL = config.BASE_URL + `/admin/expenses/${expenseId}`
    const response = await axios.delete(URL, { headers: getHeaders() })
    return response.data
}
