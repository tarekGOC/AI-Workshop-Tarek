-- Appointment Booking System Database Schema
-- This file is auto-loaded by PostgreSQL on first run

CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    keycloak_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    specialty VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE provider_availability (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES providers(id),
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE provider_breaks (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES providers(id),
    day_of_week INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE blocked_dates (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES providers(id),
    blocked_date DATE NOT NULL,
    reason VARCHAR(500)
);

CREATE TABLE service_types (
    id SERIAL PRIMARY KEY,
    provider_id INT REFERENCES providers(id),
    name VARCHAR(255) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    buffer_minutes INT DEFAULT 0,
    deposit_percentage DECIMAL(5,2) DEFAULT 0,
    description TEXT
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    confirmation_number VARCHAR(20) UNIQUE NOT NULL,
    provider_id INT REFERENCES providers(id),
    service_type_id INT REFERENCES service_types(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'booked',
    cancellation_reason TEXT,
    cancellation_token VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_amount DECIMAL(10,2) DEFAULT 0,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    performed_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    appointment_id INT REFERENCES appointments(id),
    type VARCHAR(20) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT
);

-- Seed data: providers (keycloak_id will be updated on first login)
INSERT INTO providers (keycloak_id, name, email, phone, specialty) VALUES
('provider1', 'Alice Smith', 'provider1@example.com', '+1-555-0101', 'General Consultation'),
('provider2', 'Bob Johnson', 'provider2@example.com', '+1-555-0102', 'Technical Review');

-- Seed data: availability for provider 1 (Mon-Fri 9am-5pm)
INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time) VALUES
(1, 1, '09:00', '17:00'),
(1, 2, '09:00', '17:00'),
(1, 3, '09:00', '17:00'),
(1, 4, '09:00', '17:00'),
(1, 5, '09:00', '17:00');

-- Seed data: availability for provider 2 (Mon-Wed 10am-6pm, Thu-Fri 8am-2pm)
INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time) VALUES
(2, 1, '10:00', '18:00'),
(2, 2, '10:00', '18:00'),
(2, 3, '10:00', '18:00'),
(2, 4, '08:00', '14:00'),
(2, 5, '08:00', '14:00');

-- Seed data: breaks for provider 1 (lunch 12-1pm Mon-Fri)
INSERT INTO provider_breaks (provider_id, day_of_week, start_time, end_time) VALUES
(1, 1, '12:00', '13:00'),
(1, 2, '12:00', '13:00'),
(1, 3, '12:00', '13:00'),
(1, 4, '12:00', '13:00'),
(1, 5, '12:00', '13:00');

-- Seed data: breaks for provider 2 (lunch 12-12:30 Mon-Wed)
INSERT INTO provider_breaks (provider_id, day_of_week, start_time, end_time) VALUES
(2, 1, '12:00', '12:30'),
(2, 2, '12:00', '12:30'),
(2, 3, '12:00', '12:30');

-- Seed data: service types for provider 1
INSERT INTO service_types (provider_id, name, duration_minutes, price, buffer_minutes, deposit_percentage, description) VALUES
(1, 'Quick Consultation', 30, 50.00, 5, 20, 'A 30-minute consultation session'),
(1, 'Full Session', 60, 90.00, 10, 25, 'A full hour consultation'),
(1, 'Extended Review', 90, 130.00, 15, 30, '90-minute deep dive session');

-- Seed data: service types for provider 2
INSERT INTO service_types (provider_id, name, duration_minutes, price, buffer_minutes, deposit_percentage, description) VALUES
(2, 'Code Review', 45, 75.00, 10, 0, '45-minute code review session'),
(2, 'Architecture Planning', 60, 120.00, 15, 50, '1-hour architecture planning'),
(2, 'Sprint Planning', 120, 200.00, 15, 25, '2-hour sprint planning session');

-- Create some indexes
CREATE INDEX idx_appointments_provider ON appointments(provider_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_confirmation ON appointments(confirmation_number);
CREATE INDEX idx_appointments_cancellation_token ON appointments(cancellation_token);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_at);
