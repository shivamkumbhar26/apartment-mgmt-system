import React, { createContext, useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './App.css'
import Login from './pages/Login'

import Home from './pages/Home'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageFlats from './pages/admin/ManageFlats'
import ManageResidents from './pages/admin/ManageResidents'
import ManageBills from './pages/admin/ManageBills'
import ManagePayments from './pages/admin/ManagePayments'
import ManageComplaints from './pages/admin/ManageComplaints'
import ManageExpenses from './pages/admin/ManageExpenses'

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard'
import MyFlat from './pages/resident/MyFlat'
import MyBills from './pages/resident/MyBills'
import MyPayments from './pages/resident/MyPayments'
import MyComplaints from './pages/resident/MyComplaints'
import RaiseComplaint from './pages/resident/RaiseComplaint'

export const LoginContext = createContext()

export default function App() {
  const [loginStatus, setLoginStatus] = useState(() => {
    return Boolean(sessionStorage.getItem('token'))
  })

  const [role, setRole] = useState(() => {
    return sessionStorage.getItem('role') || 'GUEST'
  })

  const [userData, setUserData] = useState(() => {
    return {
      name: sessionStorage.getItem('name') || '',
      email: sessionStorage.getItem('email') || '',
      flatNumber: sessionStorage.getItem('flatNumber') || '',
      residentId: sessionStorage.getItem('residentId') || ''
    }
  })

  return (
    <LoginContext.Provider value={{ loginStatus, setLoginStatus, role, setRole, userData, setUserData }}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={loginStatus && role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/flats"
          element={loginStatus && role === 'ADMIN' ? <ManageFlats /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/residents"
          element={loginStatus && role === 'ADMIN' ? <ManageResidents /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/bills"
          element={loginStatus && role === 'ADMIN' ? <ManageBills /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/payments"
          element={loginStatus && role === 'ADMIN' ? <ManagePayments /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/complaints"
          element={loginStatus && role === 'ADMIN' ? <ManageComplaints /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/expenses"
          element={loginStatus && role === 'ADMIN' ? <ManageExpenses /> : <Navigate to="/login" />}
        />

        {/* Resident Protected Routes */}
        <Route
          path="/resident/dashboard"
          element={loginStatus && role === 'RESIDENT' ? <ResidentDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/resident/my-flat"
          element={loginStatus && role === 'RESIDENT' ? <MyFlat /> : <Navigate to="/login" />}
        />
        <Route
          path="/resident/my-bills"
          element={loginStatus && role === 'RESIDENT' ? <MyBills /> : <Navigate to="/login" />}
        />
        <Route
          path="/resident/my-payments"
          element={loginStatus && role === 'RESIDENT' ? <MyPayments /> : <Navigate to="/login" />}
        />
        <Route
          path="/resident/my-complaints"
          element={loginStatus && role === 'RESIDENT' ? <MyComplaints /> : <Navigate to="/login" />}
        />
        <Route
          path="/resident/raise-complaint"
          element={loginStatus && role === 'RESIDENT' ? <RaiseComplaint /> : <Navigate to="/login" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </LoginContext.Provider>
  )
}
