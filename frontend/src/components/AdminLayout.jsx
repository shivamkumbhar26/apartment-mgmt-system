import React from 'react'
import Navbar from './Navbar'

export default function AdminLayout({ children, title, subtitle, actionButton }) {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />
      <main className="flex-grow-1 p-4">
        <div className="container-fluid">
          {(title || actionButton) && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <div>
                <h2 className="fw-bold mb-1 text-dark">{title}</h2>
                {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
              </div>
              {actionButton && <div>{actionButton}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
      <footer className="py-3 text-center text-muted small border-top bg-white">
        Apartment Society Management System &copy; 2026. All rights reserved.
      </footer>
    </div>
  )
}
