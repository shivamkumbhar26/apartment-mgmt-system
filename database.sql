-- ========================================================
-- Apartment Society Management System - Database Initialization
-- ========================================================
-- IMPORTANT:
-- This script initializes the database with all required tables,
-- foreign key relationships, indexes, and realistic sample data.
-- Execute this script manually in MySQL before running the app.
-- ========================================================

CREATE DATABASE IF NOT EXISTS apartment_society_db;
USE apartment_society_db;

-- --------------------------------------------------------
-- 1. Table: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS maintenance_bills;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS residents;
DROP TABLE IF EXISTS flats;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL,
    role ENUM('ADMIN', 'RESIDENT') NOT NULL DEFAULT 'RESIDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 2. Table: flats
-- --------------------------------------------------------
CREATE TABLE flats (
    flat_id INT AUTO_INCREMENT PRIMARY KEY,
    block VARCHAR(10) NOT NULL,
    flat_number VARCHAR(20) NOT NULL UNIQUE,
    floor INT NOT NULL,
    flat_type VARCHAR(20) NOT NULL,
    status ENUM('VACANT', 'OCCUPIED') NOT NULL DEFAULT 'VACANT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_flats_status (status),
    INDEX idx_flats_block (block)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 3. Table: residents
-- --------------------------------------------------------
CREATE TABLE residents (
    resident_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    flat_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    move_in_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resident_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_resident_flat FOREIGN KEY (flat_id) REFERENCES flats(flat_id) ON DELETE SET NULL,
    INDEX idx_resident_email (email),
    INDEX idx_resident_flat (flat_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 4. Table: maintenance_bills
-- --------------------------------------------------------
CREATE TABLE maintenance_bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    flat_id INT NOT NULL,
    month VARCHAR(30) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bill_flat FOREIGN KEY (flat_id) REFERENCES flats(flat_id) ON DELETE CASCADE,
    CONSTRAINT uq_flat_month UNIQUE (flat_id, month),
    INDEX idx_bill_status (status),
    INDEX idx_bill_month (month)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 5. Table: payments
-- --------------------------------------------------------
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL UNIQUE,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode ENUM('CASH', 'UPI', 'NET_BANKING', 'CARD', 'CHEQUE') NOT NULL DEFAULT 'UPI',
    reference_number VARCHAR(100) NULL,
    remarks VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES maintenance_bills(bill_id) ON DELETE CASCADE,
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 6. Table: complaints
-- --------------------------------------------------------
CREATE TABLE complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    assigned_to VARCHAR(100) NULL,
    resolution_remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_resident FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE,
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_resident (resident_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- 7. Table: expenses
-- --------------------------------------------------------
CREATE TABLE expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_mode ENUM('CASH', 'ONLINE', 'CHEQUE') NOT NULL DEFAULT 'ONLINE',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expense_user FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_expense_date (expense_date),
    INDEX idx_expense_category (category)
) ENGINE=InnoDB;

-- ========================================================
-- SAMPLE DATA INSERTION
-- Password hashes use SHA-256:
-- 'admin123'    -> '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
-- 'resident123' -> '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84'
-- ========================================================

-- Insert Users
INSERT INTO users (user_id, email, password, role) VALUES
(1, 'admin@society.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ADMIN'),
(2, 'rahul@example.com', '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', 'RESIDENT'),
(3, 'priya@example.com', '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', 'RESIDENT'),
(4, 'amit@example.com', '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', 'RESIDENT'),
(5, 'sneha@example.com', '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', 'RESIDENT');

-- Insert Flats (A & B Blocks)
INSERT INTO flats (flat_id, block, flat_number, floor, flat_type, status) VALUES
(1, 'A', 'A-101', 1, '2 BHK', 'OCCUPIED'),
(2, 'A', 'A-102', 1, '2 BHK', 'OCCUPIED'),
(3, 'A', 'A-201', 2, '3 BHK', 'VACANT'),
(4, 'A', 'A-202', 2, '3 BHK', 'VACANT'),
(5, 'B', 'B-101', 1, '1 BHK', 'VACANT'),
(6, 'B', 'B-102', 1, '1 BHK', 'VACANT'),
(7, 'B', 'B-201', 2, '2 BHK', 'OCCUPIED'),
(8, 'B', 'B-202', 2, '2 BHK', 'OCCUPIED');

-- Insert Residents linked to users and flats
INSERT INTO residents (resident_id, user_id, flat_id, name, email, phone, move_in_date, status) VALUES
(1, 2, 1, 'Rahul Sharma', 'rahul@example.com', '9876543210', '2026-01-15', 'ACTIVE'),
(2, 3, 2, 'Priya Patel', 'priya@example.com', '9876543211', '2026-02-01', 'ACTIVE'),
(3, 4, 7, 'Amit Verma', 'amit@example.com', '9876543212', '2026-03-10', 'ACTIVE'),
(4, 5, 8, 'Sneha Reddy', 'sneha@example.com', '9876543213', '2026-04-05', 'ACTIVE');

-- Insert Maintenance Bills
INSERT INTO maintenance_bills (bill_id, flat_id, month, amount, due_date, status) VALUES
-- September 2026 (Historical - Paid)
(1, 1, 'September 2026', 2500.00, '2026-09-10', 'PAID'),
(2, 2, 'September 2026', 2500.00, '2026-09-10', 'PAID'),
(3, 7, 'September 2026', 3000.00, '2026-09-10', 'PAID'),
(4, 8, 'September 2026', 3000.00, '2026-09-10', 'PAID'),
-- October 2026 (Current - Mixed)
(5, 1, 'October 2026', 2500.00, '2026-10-10', 'PENDING'),
(6, 2, 'October 2026', 2500.00, '2026-10-10', 'PAID'),
(7, 7, 'October 2026', 3000.00, '2026-10-10', 'PAID'),
(8, 8, 'October 2026', 3000.00, '2026-10-10', 'PENDING');

-- Insert Payments for Paid Bills
INSERT INTO payments (payment_id, bill_id, amount_paid, payment_date, payment_mode, reference_number, remarks) VALUES
(1, 1, 2500.00, '2026-09-08', 'UPI', 'UPI-SEP-8839201', 'September maintenance cleared on time'),
(2, 2, 2500.00, '2026-09-09', 'NET_BANKING', 'HDFC-TXN-492018', 'Online net banking transfer'),
(3, 3, 3000.00, '2026-09-05', 'CARD', 'CARD-REF-918234', 'Debit card swipe at society office'),
(4, 4, 3000.00, '2026-09-10', 'UPI', 'UPI-SEP-3920182', 'GPay transaction'),
(5, 6, 2500.00, '2026-10-04', 'UPI', 'UPI-OCT-9981245', 'October advance payment'),
(6, 7, 3000.00, '2026-10-06', 'NET_BANKING', 'ICICI-TXN-778219', 'October maintenance bill');

-- Insert Complaints across different statuses
INSERT INTO complaints (complaint_id, resident_id, category, title, description, priority, status, assigned_to, resolution_remarks) VALUES
(1, 1, 'Plumbing', 'Water leakage in kitchen', 'Water leaking near kitchen sink drain pipe.', 'HIGH', 'OPEN', NULL, NULL),
(2, 2, 'Electrical', 'Corridor light flickering', 'Corridor light fixture directly outside flat A-102 flickers continuously.', 'MEDIUM', 'ASSIGNED', 'Suresh Kumar (Electrician)', 'Scheduled inspection for today afternoon.'),
(3, 3, 'Cleanliness', 'Staircase garbage cleanup', 'Dry leaves and construction dust on 2nd floor staircase.', 'LOW', 'IN_PROGRESS', 'Ramesh Yadav (Housekeeping)', 'Cleaning started; second sweep scheduled.'),
(4, 4, 'Security', 'Intercom calling faulty', 'Security guard call from gate 1 is not ringing in B-202.', 'HIGH', 'RESOLVED', 'Manoj Telecom Support', 'Repaired loose wiring in junction box on floor 2.');

-- Insert Society Expenses
INSERT INTO expenses (expense_id, category, description, amount, expense_date, payment_mode, created_by) VALUES
(1, 'Maintenance', 'Lift maintenance service & emergency brake testing', 15000.00, '2026-10-05', 'ONLINE', 1),
(2, 'Security', 'Monthly payment to Premier Security Agency (3 guards)', 24000.00, '2026-10-01', 'ONLINE', 1),
(3, 'Cleaning', 'Deep cleaning & chlorination of overhead water tanks', 6500.00, '2026-09-25', 'CHEQUE', 1),
(4, 'Gardening', 'Trimming boundary trees and seasonal plant fertilization', 3500.00, '2026-09-20', 'CASH', 1),
(5, 'Repairs', 'Common area diesel generator quarterly servicing', 8000.00, '2026-09-15', 'ONLINE', 1);
