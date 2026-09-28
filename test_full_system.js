require('dotenv').config()
const http = require('http')

const PORT = process.env.PORT || 4000
const BASE_URL = process.env.API_URL || `http://localhost:${PORT}`

async function request(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}${path}`)
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        if (token) options.headers['token'] = token

        const req = http.request(options, (res) => {
            let data = ''
            res.on('data', chunk => data += chunk)
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data))
                } catch (e) {
                    resolve(data)
                }
            })
        })
        req.on('error', reject)
        if (body) req.write(JSON.stringify(body))
        req.end()
    })
}

async function runTests() {
    console.log('========================================================')
    console.log('STARTING FULL AUTOMATED TEST SUITE')
    console.log('Apartment Society Management System')
    console.log('========================================================\n')

    let adminToken = null
    let residentToken = null
    let vikramToken = null
    let newFlatId = null
    let newResidentId = null
    let newBillId = null
    let newComplaintId = null

    // ----------------------------------------------------
    // TEST 1: Admin login, create flat, create resident, assign resident
    // ----------------------------------------------------
    console.log('[TEST 1] Flat & Resident Workflow:')
    const adminLogin = await request('/auth/login', 'POST', {
        email: 'admin@society.com',
        password: 'admin123'
    })
    console.log('  1.1 Admin login response:', adminLogin.status, 'Role:', adminLogin.data.role)
    adminToken = adminLogin.data.token
    if (adminLogin.status !== 'success') throw new Error('Admin login failed')

    // Create flat
    const createFlat = await request('/admin/flats', 'POST', {
        block: 'C',
        flatNumber: 'C-101',
        floor: 1,
        flatType: '2 BHK'
    }, adminToken)
    console.log('  1.2 Create flat C-101:', createFlat.status, createFlat.data)
    newFlatId = createFlat.data.flatId

    // Verify flat appears as VACANT
    const flatsList = await request('/admin/flats', 'GET', null, adminToken)
    const flatC101 = flatsList.data.find(f => f.flat_number === 'C-101')
    console.log('  1.3 Flat C-101 status before resident assignment:', flatC101.status)
    if (flatC101.status !== 'VACANT') throw new Error('New flat should be VACANT')

    // Register resident & assign to C-101
    const createResident = await request('/admin/residents', 'POST', {
        name: 'Vikram Malhotra',
        email: 'vikram@example.com',
        phone: '9876500001',
        flatId: newFlatId,
        moveInDate: '2026-10-01',
        password: 'resident123'
    }, adminToken)
    console.log('  1.4 Register resident Vikram:', createResident.status, createResident.data)
    newResidentId = createResident.data.residentId

    // Verify flat C-101 is now OCCUPIED by Vikram
    const updatedFlats = await request('/admin/flats', 'GET', null, adminToken)
    const updatedC101 = updatedFlats.data.find(f => f.flat_number === 'C-101')
    console.log('  1.5 Flat C-101 status after resident assignment:', updatedC101.status, 'Resident:', updatedC101.resident_name)
    if (updatedC101.status !== 'OCCUPIED') throw new Error('Flat should be OCCUPIED')
    console.log('  -> TEST 1 PASSED!\n')

    // ----------------------------------------------------
    // TEST 2: Admin creates maintenance bill
    // ----------------------------------------------------
    console.log('[TEST 2] Maintenance Bill Workflow:')
    const initialStats = await request('/admin/dashboard/stats', 'GET', null, adminToken)
    const initialPendingBills = initialStats.data.pendingBills
    console.log('  2.1 Current pending bills in society:', initialPendingBills)

    const createBill = await request('/admin/bills', 'POST', {
        flatId: newFlatId,
        month: 'November 2026',
        amount: 3200,
        dueDate: '2026-11-15'
    }, adminToken)
    console.log('  2.2 Create bill for C-101:', createBill.status, createBill.data)
    newBillId = createBill.data.billId

    // Verify bill appears in bills list with status PENDING
    const billsList = await request('/admin/bills', 'GET', null, adminToken)
    const c101Bill = billsList.data.find(b => b.bill_id === newBillId)
    console.log('  2.3 Bill verification:', c101Bill.flat_number, c101Bill.month, 'Status:', c101Bill.status, 'Amount: ₹' + c101Bill.amount)
    if (c101Bill.status !== 'PENDING') throw new Error('Bill status must be PENDING initially')
    console.log('  -> TEST 2 PASSED!\n')

    // ----------------------------------------------------
    // TEST 3: Payment recording & Dashboard update
    // ----------------------------------------------------
    console.log('[TEST 3] Payment Workflow:')
    const statsBeforePay = await request('/admin/dashboard/stats', 'GET', null, adminToken)
    const collectionBefore = Number(statsBeforePay.data.totalCollection)
    console.log('  3.1 Total Collection before payment: ₹' + collectionBefore)

    const recordPay = await request('/admin/payments', 'POST', {
        billId: newBillId,
        amountPaid: 3200,
        paymentDate: '2026-10-10',
        paymentMode: 'UPI',
        referenceNumber: 'UPI-NOV-998877',
        remarks: 'Advance online payment via GPay'
    }, adminToken)
    console.log('  3.2 Record payment:', recordPay.status, recordPay.data)

    // Verify bill changes from PENDING to PAID
    const billsAfterPay = await request('/admin/bills', 'GET', null, adminToken)
    const updatedBill = billsAfterPay.data.find(b => b.bill_id === newBillId)
    console.log('  3.3 Bill status after payment:', updatedBill.status)
    if (updatedBill.status !== 'PAID') throw new Error('Bill must transition to PAID after payment')

    // Verify dashboard updates
    const statsAfterPay = await request('/admin/dashboard/stats', 'GET', null, adminToken)
    const collectionAfter = Number(statsAfterPay.data.totalCollection)
    console.log('  3.4 Total Collection after payment: ₹' + collectionAfter)
    if (collectionAfter !== collectionBefore + 3200) throw new Error('Dashboard total collection did not update correctly')
    console.log('  -> TEST 3 PASSED!\n')

    // ----------------------------------------------------
    // TEST 4: Resident login, view flat, view bills, view payment
    // ----------------------------------------------------
    console.log('[TEST 4] Resident Access & Data Isolation:')
    const vikramLogin = await request('/auth/login', 'POST', {
        email: 'vikram@example.com',
        password: 'resident123'
    })
    console.log('  4.1 Resident login:', vikramLogin.status, 'Resident:', vikramLogin.data.name, 'Flat:', vikramLogin.data.flatNumber)
    vikramToken = vikramLogin.data.token

    // Resident views own flat
    const myFlat = await request('/resident/my-flat', 'GET', null, vikramToken)
    console.log('  4.2 Resident view own flat:', myFlat.status, 'Flat Number:', myFlat.data.flat_number, 'Block:', myFlat.data.block, 'Type:', myFlat.data.flat_type)
    if (myFlat.data.flat_number !== 'C-101') throw new Error('Resident did not see their own flat')

    // Resident views own bills
    const myBills = await request('/resident/my-bills', 'GET', null, vikramToken)
    console.log('  4.3 Resident view bills count:', myBills.data.length, 'Month:', myBills.data[0].month, 'Status:', myBills.data[0].status)

    // Resident views own payments
    const myPayments = await request('/resident/my-payments', 'GET', null, vikramToken)
    console.log('  4.4 Resident view payments count:', myPayments.data.length, 'Receipt ref:', myPayments.data[0].reference_number)
    console.log('  -> TEST 4 PASSED!\n')

    // ----------------------------------------------------
    // TEST 5: Complaint lifecycle
    // ----------------------------------------------------
    console.log('[TEST 5] Complaint Lifecycle (OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED):')
    // Resident raises complaint
    const raiseComplaint = await request('/resident/complaints', 'POST', {
        category: 'Plumbing',
        title: 'Kitchen tap dripping water',
        description: 'Washer worn out, continuous dripping',
        priority: 'HIGH'
    }, vikramToken)
    console.log('  5.1 Resident raises complaint:', raiseComplaint.status, raiseComplaint.data)
    newComplaintId = raiseComplaint.data.complaintId

    // Admin sees complaint
    const allComplaints = await request('/admin/complaints', 'GET', null, adminToken)
    const newComplaint = allComplaints.data.find(c => c.complaint_id === newComplaintId)
    console.log('  5.2 Admin sees complaint:', newComplaint.title, 'Status:', newComplaint.status)
    if (newComplaint.status !== 'OPEN') throw new Error('Complaint status should initially be OPEN')

    // Admin assigns complaint
    const assignRes = await request(`/admin/complaints/${newComplaintId}/assign`, 'PUT', {
        assignedTo: 'Mukesh Plumber'
    }, adminToken)
    console.log('  5.3 Admin assigns complaint:', assignRes.status, assignRes.data)

    // Admin changes status to IN_PROGRESS
    const inProgressRes = await request(`/admin/complaints/${newComplaintId}/status`, 'PUT', {
        status: 'IN_PROGRESS',
        resolutionRemarks: 'Inspection done, parts procured'
    }, adminToken)
    console.log('  5.4 Admin updates to IN_PROGRESS:', inProgressRes.status, inProgressRes.data)

    // Admin resolves complaint
    const resolveRes = await request(`/admin/complaints/${newComplaintId}/status`, 'PUT', {
        status: 'RESOLVED',
        resolutionRemarks: 'Washer replaced and leakage fully resolved'
    }, adminToken)
    console.log('  5.5 Admin resolves complaint:', resolveRes.status, resolveRes.data)

    // Resident sees RESOLVED
    const residentComplaints = await request('/resident/my-complaints', 'GET', null, vikramToken)
    const verifiedComplaint = residentComplaints.data.find(c => c.complaint_id === newComplaintId)
    console.log('  5.6 Resident checks complaint status:', verifiedComplaint.status, 'Remarks:', verifiedComplaint.resolution_remarks)
    if (verifiedComplaint.status !== 'RESOLVED') throw new Error('Complaint should be RESOLVED from resident perspective')
    console.log('  -> TEST 5 PASSED!\n')

    // ----------------------------------------------------
    // TEST 6: Society Expense Workflow
    // ----------------------------------------------------
    console.log('[TEST 6] Society Expense Workflow:')
    const statsBeforeExp = await request('/admin/dashboard/stats', 'GET', null, adminToken)
    const expBefore = Number(statsBeforeExp.data.totalExpenses)
    console.log('  6.1 Total Society Expenses before:', '₹' + expBefore)

    const addExp = await request('/admin/expenses', 'POST', {
        category: 'Maintenance',
        description: 'Fire extinguisher refilling and safety audit',
        amount: 4500,
        expenseDate: '2026-10-09',
        paymentMode: 'ONLINE'
    }, adminToken)
    console.log('  6.2 Record Society Expense:', addExp.status, addExp.data)

    const statsAfterExp = await request('/admin/dashboard/stats', 'GET', null, adminToken)
    const expAfter = Number(statsAfterExp.data.totalExpenses)
    console.log('  6.3 Total Society Expenses after:', '₹' + expAfter)
    if (expAfter !== expBefore + 4500) throw new Error('Dashboard society expenses total did not update correctly')
    console.log('  -> TEST 6 PASSED!\n')

    // ----------------------------------------------------
    // TEST 7: Security & Role Authorization Tests
    // ----------------------------------------------------
    console.log('[TEST 7] Security & Role Access Controls:')
    // Resident attempting admin route
    const residentHackingAdmin = await request('/admin/flats', 'GET', null, vikramToken)
    console.log('  7.1 Resident accessing /admin/flats:', residentHackingAdmin.status, residentHackingAdmin.data)
    if (residentHackingAdmin.data !== 'UnAuthorized access') throw new Error('Resident should be blocked from admin routes')

    // Admin attempting resident route
    const adminAccessingResident = await request('/resident/my-flat', 'GET', null, adminToken)
    console.log('  7.2 Admin accessing /resident/my-flat:', adminAccessingResident.status, adminAccessingResident.data)
    if (adminAccessingResident.data !== 'UnAuthorized access') throw new Error('Admin should be blocked from resident routes')

    // Unauthenticated request without token
    const noTokenRequest = await request('/admin/flats', 'GET', null, null)
    console.log('  7.3 Request without token:', noTokenRequest.status, noTokenRequest.data)
    if (noTokenRequest.data !== 'Token is missing') throw new Error('Unauthenticated request must be rejected')

    // Corrupted token
    const fakeTokenRequest = await request('/admin/flats', 'GET', null, 'corrupted_fake_token')
    console.log('  7.4 Request with fake token:', fakeTokenRequest.status, fakeTokenRequest.data)
    if (fakeTokenRequest.data !== 'Token is Invalid') throw new Error('Invalid token must be rejected')

    console.log('  -> TEST 7 PASSED!\n')

    console.log('========================================================')
    console.log('ALL 7 WORKFLOW & SECURITY TESTS PASSED PERFECTLY!')
    console.log('========================================================')
}

runTests().catch(err => {
    console.error('Test suite failed:', err)
    process.exit(1)
})
