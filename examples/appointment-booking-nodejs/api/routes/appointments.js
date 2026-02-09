const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const { requireAuth, requireRole, optionalAuth } = require('../auth');
const { validateBookingInput, sanitizeString } = require('../utils/validation');
const { calculateAvailableSlots } = require('../utils/slots');
const { generateICalForAppointment } = require('../utils/ical');
const emailService = require('../stubs/emailService');
const paymentService = require('../stubs/paymentService');

// GET list all providers (public)
router.get('/providers', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, specialty FROM providers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching providers:', err);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// GET available slots for a provider on a date range (public)
router.get('/providers/:id/slots', async (req, res) => {
  try {
    const providerId = req.params.id;
    const { start_date, end_date, service_type_id, timezone } = req.query;
    const tz = timezone || 'UTC';

    if (!start_date) {
      return res.status(400).json({ error: 'start_date is required' });
    }

    const endDate = end_date || start_date;

    // Get service type for duration
    let serviceDuration = 30;
    let bufferMinutes = 0;
    if (service_type_id) {
      const svc = await pool.query('SELECT * FROM service_types WHERE id = $1', [service_type_id]);
      if (svc.rows.length > 0) {
        serviceDuration = svc.rows[0].duration_minutes;
        bufferMinutes = svc.rows[0].buffer_minutes;
      }
    }

    // Fetch availability, breaks, blocked dates, existing appointments
    const availability = await pool.query('SELECT * FROM provider_availability WHERE provider_id = $1', [providerId]);
    const breaks = await pool.query('SELECT * FROM provider_breaks WHERE provider_id = $1', [providerId]);
    const blocked = await pool.query('SELECT * FROM blocked_dates WHERE provider_id = $1', [providerId]);
    const appointments = await pool.query(
      "SELECT * FROM appointments WHERE provider_id = $1 AND appointment_date >= $2 AND appointment_date <= $3 AND status != 'cancelled'",
      [providerId, start_date, endDate]
    );

    // Calculate slots for each day in range
    const allSlots = {};
    let current = moment(start_date);
    const end = moment(endDate);

    while (current.isSameOrBefore(end)) {
      const dateStr = current.format('YYYY-MM-DD');
      const dayAppointments = appointments.rows.filter(a => 
        moment(a.appointment_date).format('YYYY-MM-DD') === dateStr
      );
      
      allSlots[dateStr] = calculateAvailableSlots(
        current.toDate(), 
        availability.rows, 
        breaks.rows, 
        blocked.rows, 
        dayAppointments, 
        serviceDuration, 
        bufferMinutes, 
        tz
      );
      current.add(1, 'day');
    }

    res.json(allSlots);
  } catch (err) {
    console.error('Error fetching slots:', err);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// POST book an appointment
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    
    // Validate input
    const errors = validateBookingInput(data);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Sanitize
    data.customer_name = sanitizeString(data.customer_name);
    data.notes = sanitizeString(data.notes);

    // Check slot is still available (prevent double booking)
    const existing = await pool.query(
      "SELECT * FROM appointments WHERE provider_id = $1 AND appointment_date = $2 AND start_time = $3 AND status != 'cancelled'",
      [data.provider_id, data.appointment_date, data.start_time]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }

    // Get service type for end time calculation
    const svc = await pool.query('SELECT * FROM service_types WHERE id = $1', [data.service_type_id]);
    if (svc.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid service type' });
    }
    const service = svc.rows[0];
    
    // Calculate end time
    const startMoment = moment(data.start_time, 'HH:mm');
    const endTime = startMoment.add(service.duration_minutes, 'minutes').format('HH:mm');

    // Generate confirmation number and cancellation token
    const confirmationNumber = 'APT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const cancellationToken = uuidv4();

    // Calculate deposit
    const depositAmount = (service.price * service.deposit_percentage / 100);

    // Process payment/deposit if required
    if (depositAmount > 0 && data.card_details) {
      const paymentResult = paymentService.processPayment(depositAmount, data.card_details, 'Deposit for appointment ' + confirmationNumber);
      if (!paymentResult.success) {
        return res.status(402).json({ error: 'Payment failed', details: paymentResult });
      }
    }

    // Insert appointment
    const result = await pool.query(
      `INSERT INTO appointments (confirmation_number, provider_id, service_type_id, customer_name, customer_email, customer_phone, 
       appointment_date, start_time, end_time, notes, cancellation_token, payment_status, payment_amount, deposit_amount, timezone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [confirmationNumber, data.provider_id, data.service_type_id, data.customer_name, data.customer_email, 
       data.customer_phone || null, data.appointment_date, data.start_time, endTime, data.notes || null,
       cancellationToken, depositAmount > 0 ? 'deposit_paid' : 'pending', service.price, depositAmount, data.timezone || 'UTC']
    );

    // Log to audit
    await pool.query(
      'INSERT INTO audit_log (appointment_id, action, details, performed_by) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, 'BOOKED', 'Appointment booked', req.user.username]
    );

    // Schedule reminder (24 hours before)
    const reminderTime = moment(data.appointment_date + ' ' + data.start_time, 'YYYY-MM-DD HH:mm').subtract(24, 'hours');
    await pool.query(
      'INSERT INTO reminders (appointment_id, type, scheduled_at) VALUES ($1, $2, $3)',
      [result.rows[0].id, 'email', reminderTime.toISOString()]
    );
    if (data.customer_phone) {
      await pool.query(
        'INSERT INTO reminders (appointment_id, type, scheduled_at) VALUES ($1, $2, $3)',
        [result.rows[0].id, 'sms', reminderTime.toISOString()]
      );
    }

    // Send confirmation email
    const provider = await pool.query('SELECT * FROM providers WHERE id = $1', [data.provider_id]);
    emailService.sendConfirmationEmail(data.customer_email, {
      confirmationNumber,
      providerName: provider.rows[0]?.name,
      date: data.appointment_date,
      startTime: data.start_time,
      endTime,
      serviceName: service.name,
      cancellationToken
    });

    res.status(201).json({
      ...result.rows[0],
      service_name: service.name,
      provider_name: provider.rows[0]?.name
    });
  } catch (err) {
    console.error('Error booking appointment:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// GET appointment by confirmation number (public with token)
router.get('/confirm/:confirmationNumber', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name as service_name, s.duration_minutes, s.price, p.name as provider_name, p.email as provider_email, p.phone as provider_phone
       FROM appointments a 
       JOIN service_types s ON a.service_type_id = s.id 
       JOIN providers p ON a.provider_id = p.id
       WHERE a.confirmation_number = $1`,
      [req.params.confirmationNumber]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// GET iCal for appointment
router.get('/:id/ical', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name as service_name, p.name as provider_name, p.email as provider_email
       FROM appointments a 
       JOIN service_types s ON a.service_type_id = s.id 
       JOIN providers p ON a.provider_id = p.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const apt = result.rows[0];
    apt.appointment_date = moment(apt.appointment_date).format('YYYY-MM-DD');
    const icalData = generateICalForAppointment(apt);
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=appointment.ics');
    res.send(icalData);
  } catch (err) {
    console.error('Error generating iCal:', err);
    res.status(500).json({ error: 'Failed to generate iCal' });
  }
});

// POST cancel appointment by cancellation token
router.post('/cancel/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name as service_name, s.price, p.name as provider_name, p.email as provider_email
       FROM appointments a 
       JOIN service_types s ON a.service_type_id = s.id 
       JOIN providers p ON a.provider_id = p.id
       WHERE a.cancellation_token = $1`,
      [req.params.token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const apt = result.rows[0];
    if (apt.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    const reason = req.body.reason || 'Cancelled by customer';

    // Check if within 24 hours
    const appointmentTime = moment(apt.appointment_date + ' ' + apt.start_time, 'YYYY-MM-DD HH:mm');
    const hoursUntil = appointmentTime.diff(moment(), 'hours');
    let refundAmount = apt.deposit_amount || 0;
    if (hoursUntil < 24) {
      // Within 24 hours - may not get full refund
      refundAmount = 0;
      console.log('Cancellation within 24 hours - no refund');
    }

    // Process refund if applicable
    if (refundAmount > 0) {
      const refundResult = require('../stubs/paymentService').processRefund('original-txn', refundAmount, reason);
      console.log('Refund result:', refundResult);
    }

    // Update appointment
    await pool.query(
      "UPDATE appointments SET status = 'cancelled', cancellation_reason = $1, refund_amount = $2, updated_at = NOW() WHERE id = $3",
      [reason, refundAmount, apt.id]
    );

    // Cancel pending reminders
    await pool.query(
      "UPDATE reminders SET status = 'cancelled' WHERE appointment_id = $1 AND status = 'pending'",
      [apt.id]
    );

    // Audit log
    await pool.query(
      'INSERT INTO audit_log (appointment_id, action, details, performed_by) VALUES ($1, $2, $3, $4)',
      [apt.id, 'CANCELLED', 'Cancelled by customer: ' + reason, 'customer']
    );

    // Send emails
    emailService.sendCancellationEmail(apt.customer_email, {
      confirmationNumber: apt.confirmation_number,
      date: moment(apt.appointment_date).format('YYYY-MM-DD'),
      startTime: apt.start_time,
      reason
    });
    emailService.sendProviderNotification(apt.provider_email, 'cancellation', {
      customerName: apt.customer_name,
      date: moment(apt.appointment_date).format('YYYY-MM-DD'),
      startTime: apt.start_time,
      reason
    });

    res.json({ message: 'Appointment cancelled', refund_amount: refundAmount });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// GET appointment by cancellation token (for cancel/reschedule page)
router.get('/cancel/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name as service_name, s.duration_minutes, s.price, p.name as provider_name, p.email as provider_email
       FROM appointments a 
       JOIN service_types s ON a.service_type_id = s.id 
       JOIN providers p ON a.provider_id = p.id
       WHERE a.cancellation_token = $1`,
      [req.params.token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// PUT reschedule appointment
router.put('/reschedule/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.duration_minutes, s.buffer_minutes FROM appointments a 
       JOIN service_types s ON a.service_type_id = s.id
       WHERE a.cancellation_token = $1`,
      [req.params.token]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const apt = result.rows[0];
    if (apt.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot reschedule a cancelled appointment' });
    }

    const { appointment_date, start_time } = req.body;
    if (!appointment_date || !start_time) {
      return res.status(400).json({ error: 'New date and time are required' });
    }

    // Check new slot is available
    const existing = await pool.query(
      "SELECT * FROM appointments WHERE provider_id = $1 AND appointment_date = $2 AND start_time = $3 AND status != 'cancelled' AND id != $4",
      [apt.provider_id, appointment_date, start_time, apt.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'New time slot is not available' });
    }

    // Calculate new end time
    const startMoment = moment(start_time, 'HH:mm');
    const endTime = startMoment.add(apt.duration_minutes, 'minutes').format('HH:mm');

    // Update appointment
    await pool.query(
      'UPDATE appointments SET appointment_date = $1, start_time = $2, end_time = $3, updated_at = NOW() WHERE id = $4',
      [appointment_date, start_time, endTime, apt.id]
    );

    // Update reminders
    const reminderTime = moment(appointment_date + ' ' + start_time, 'YYYY-MM-DD HH:mm').subtract(24, 'hours');
    await pool.query(
      "UPDATE reminders SET scheduled_at = $1, status = 'pending', sent_at = NULL WHERE appointment_id = $2",
      [reminderTime.toISOString(), apt.id]
    );

    // Audit log
    await pool.query(
      'INSERT INTO audit_log (appointment_id, action, details, performed_by) VALUES ($1, $2, $3, $4)',
      [apt.id, 'RESCHEDULED', 'Rescheduled from ' + moment(apt.appointment_date).format('YYYY-MM-DD') + ' ' + apt.start_time + ' to ' + appointment_date + ' ' + start_time, 'customer']
    );

    res.json({ message: 'Appointment rescheduled', new_date: appointment_date, new_time: start_time, new_end_time: endTime });
  } catch (err) {
    console.error('Error rescheduling appointment:', err);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// CUSTOMER ROUTES

// GET customer's own bookings
router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { status, time } = req.query;

    let query = `SELECT a.*, s.name as service_name, s.duration_minutes, s.price,
                 p.name as provider_name, p.specialty as provider_specialty
                 FROM appointments a
                 JOIN service_types s ON a.service_type_id = s.id
                 JOIN providers p ON a.provider_id = p.id
                 WHERE a.customer_email = $1`;
    const params = [userEmail];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (time === 'upcoming') {
      query += ` AND (a.appointment_date > CURRENT_DATE OR (a.appointment_date = CURRENT_DATE AND a.start_time > CURRENT_TIME))`;
    } else if (time === 'past') {
      query += ` AND (a.appointment_date < CURRENT_DATE OR (a.appointment_date = CURRENT_DATE AND a.end_time <= CURRENT_TIME))`;
    }

    query += ' ORDER BY a.appointment_date DESC, a.start_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customer bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PROVIDER ROUTES

// GET provider's appointments
router.get('/provider/list', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const { date_from, date_to, status, search } = req.query;
    
    let query = `SELECT a.*, s.name as service_name, s.duration_minutes, s.price 
                 FROM appointments a JOIN service_types s ON a.service_type_id = s.id 
                 WHERE a.provider_id = $1`;
    const params = [providerId];
    let paramCount = 1;

    if (date_from) {
      paramCount++;
      query += ` AND a.appointment_date >= $${paramCount}`;
      params.push(date_from);
    }
    if (date_to) {
      paramCount++;
      query += ` AND a.appointment_date <= $${paramCount}`;
      params.push(date_to);
    }
    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }
    if (search) {
      paramCount++;
      query += ` AND (a.customer_name ILIKE $${paramCount} OR a.customer_email ILIKE $${paramCount})`;
      params.push('%' + search + '%');
    }

    query += ' ORDER BY a.appointment_date, a.start_time';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// PUT mark appointment as completed
router.put('/provider/:id/complete', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE appointments SET status = 'completed', updated_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    await pool.query(
      'INSERT INTO audit_log (appointment_id, action, details, performed_by) VALUES ($1, $2, $3, $4)',
      [req.params.id, 'COMPLETED', 'Marked as completed by provider', req.user.username]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error completing appointment:', err);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

// PUT provider cancel appointment
router.put('/provider/:id/cancel', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await pool.query(
      "UPDATE appointments SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [reason || 'Cancelled by provider', req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    const apt = result.rows[0];

    // Refund deposit if paid
    if (apt.deposit_amount > 0 && apt.payment_status !== 'refunded') {
      const { processRefund } = require('../stubs/paymentService');
      processRefund('original', apt.deposit_amount, 'Provider cancelled');
      await pool.query("UPDATE appointments SET payment_status = 'refunded', refund_amount = $1 WHERE id = $2", [apt.deposit_amount, apt.id]);
    }

    // Cancel reminders
    await pool.query("UPDATE reminders SET status = 'cancelled' WHERE appointment_id = $1 AND status = 'pending'", [apt.id]);

    // Audit
    await pool.query(
      'INSERT INTO audit_log (appointment_id, action, details, performed_by) VALUES ($1, $2, $3, $4)',
      [req.params.id, 'CANCELLED', 'Cancelled by provider: ' + (reason || ''), req.user.username]
    );

    // Notify customer
    emailService.sendCancellationEmail(apt.customer_email, {
      confirmationNumber: apt.confirmation_number,
      date: moment(apt.appointment_date).format('YYYY-MM-DD'),
      startTime: apt.start_time,
      reason: reason || 'Cancelled by provider'
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// POST provider send message to customer
router.post('/provider/:id/message', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const { subject, message } = req.body;
    const apt = await pool.query('SELECT * FROM appointments WHERE id = $1', [req.params.id]);
    if (apt.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

    emailService.sendCustomMessage(apt.rows[0].customer_email, subject || 'Message from your provider', message);

    await pool.query(
      'INSERT INTO audit_log (appointment_id, action, details, performed_by) VALUES ($1, $2, $3, $4)',
      [req.params.id, 'MESSAGE_SENT', 'Provider sent message: ' + (subject || ''), req.user.username]
    );

    res.json({ message: 'Message sent' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET provider stats
router.get('/provider/stats', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const total = await pool.query('SELECT COUNT(*) FROM appointments WHERE provider_id = $1', [providerId]);
    const cancelled = await pool.query("SELECT COUNT(*) FROM appointments WHERE provider_id = $1 AND status = 'cancelled'", [providerId]);
    const noshow = await pool.query("SELECT COUNT(*) FROM appointments WHERE provider_id = $1 AND status = 'no-show'", [providerId]);
    const completed = await pool.query("SELECT COUNT(*) FROM appointments WHERE provider_id = $1 AND status = 'completed'", [providerId]);
    const upcoming = await pool.query("SELECT COUNT(*) FROM appointments WHERE provider_id = $1 AND status = 'booked' AND appointment_date >= CURRENT_DATE", [providerId]);

    const totalCount = parseInt(total.rows[0].count);
    res.json({
      total: totalCount,
      cancelled: parseInt(cancelled.rows[0].count),
      no_show: parseInt(noshow.rows[0].count),
      completed: parseInt(completed.rows[0].count),
      upcoming: parseInt(upcoming.rows[0].count),
      cancellation_rate: totalCount > 0 ? (parseInt(cancelled.rows[0].count) / totalCount * 100).toFixed(1) : 0,
      no_show_rate: totalCount > 0 ? (parseInt(noshow.rows[0].count) / totalCount * 100).toFixed(1) : 0,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET export appointments as iCal (all upcoming for provider)
router.get('/provider/export', requireAuth, requireRole('provider'), async (req, res) => {
  try {
    const provider = await pool.query('SELECT * FROM providers WHERE keycloak_id = $1', [req.user.username]);
    if (provider.rows.length === 0) return res.status(404).json({ error: 'Provider not found' });
    const providerId = provider.rows[0].id;

    const appointments = await pool.query(
      `SELECT a.*, s.name as service_name, p.name as provider_name, p.email as provider_email
       FROM appointments a JOIN service_types s ON a.service_type_id = s.id JOIN providers p ON a.provider_id = p.id
       WHERE a.provider_id = $1 AND a.status = 'booked' AND a.appointment_date >= CURRENT_DATE
       ORDER BY a.appointment_date, a.start_time`,
      [providerId]
    );

    const ical = require('ical-generator');
    const calendar = ical.default({ name: 'My Appointments' });

    for (const apt of appointments.rows) {
      const startDate = moment(moment(apt.appointment_date).format('YYYY-MM-DD') + ' ' + apt.start_time, 'YYYY-MM-DD HH:mm').toDate();
      const endDate = moment(moment(apt.appointment_date).format('YYYY-MM-DD') + ' ' + apt.end_time, 'YYYY-MM-DD HH:mm').toDate();

      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: apt.service_name + ' - ' + apt.customer_name,
        description: 'Customer: ' + apt.customer_name + '\nEmail: ' + apt.customer_email + '\nPhone: ' + (apt.customer_phone || 'N/A'),
      });
    }

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=appointments.ics');
    res.send(calendar.toString());
  } catch (err) {
    console.error('Error exporting appointments:', err);
    res.status(500).json({ error: 'Failed to export appointments' });
  }
});

module.exports = router;
