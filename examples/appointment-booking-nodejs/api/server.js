const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const moment = require('moment-timezone');
const pool = require('./db');
const emailService = require('./stubs/emailService');
const smsService = require('./stubs/smsService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
const appointmentsRouter = require('./routes/appointments');
const availabilityRouter = require('./routes/availability');
const servicesRouter = require('./routes/services');
const paymentsRouter = require('./routes/payments');

app.use('/api/appointments', appointmentsRouter);
app.use('/api/provider/availability', availabilityRouter);
app.use('/api/services', servicesRouter);
app.use('/api/payments', paymentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Timezone list endpoint
app.get('/api/timezones', (req, res) => {
  res.json(moment.tz.names());
});

// Reminder cron job - runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('=== CRON: Checking for appointments needing reminders ===');
  try {
    const now = moment();
    const in24Hours = moment().add(25, 'hours');

    // Find pending reminders that should be sent
    const reminders = await pool.query(
      `SELECT r.*, a.customer_name, a.customer_email, a.customer_phone, a.appointment_date, a.start_time, 
              a.end_time, a.cancellation_token, a.status as apt_status,
              p.name as provider_name, s.name as service_name
       FROM reminders r 
       JOIN appointments a ON r.appointment_id = a.id
       JOIN providers p ON a.provider_id = p.id
       JOIN service_types s ON a.service_type_id = s.id
       WHERE r.status = 'pending' AND r.scheduled_at <= $1 AND a.status = 'booked'`,
      [in24Hours.toISOString()]
    );

    console.log(`Found ${reminders.rows.length} reminders to process`);

    for (const reminder of reminders.rows) {
      try {
        if (reminder.apt_status !== 'booked') {
          await pool.query("UPDATE reminders SET status = 'cancelled' WHERE id = $1", [reminder.id]);
          continue;
        }

        const appointmentDetails = {
          providerName: reminder.provider_name,
          serviceName: reminder.service_name,
          date: moment(reminder.appointment_date).format('YYYY-MM-DD'),
          startTime: reminder.start_time,
          cancellationToken: reminder.cancellation_token
        };

        if (reminder.type === 'email') {
          const result = emailService.sendReminderEmail(reminder.customer_email, appointmentDetails);
          await pool.query("UPDATE reminders SET status = 'sent', sent_at = NOW() WHERE id = $1", [reminder.id]);
        } else if (reminder.type === 'sms' && reminder.customer_phone) {
          const message = `Reminder: Appointment with ${reminder.provider_name} tomorrow at ${reminder.start_time}`;
          const result = smsService.sendReminderSMS(reminder.customer_phone, message);
          await pool.query("UPDATE reminders SET status = 'sent', sent_at = NOW() WHERE id = $1", [reminder.id]);
        }
      } catch (reminderErr) {
        console.error('Error sending reminder:', reminderErr);
        await pool.query("UPDATE reminders SET status = 'failed', error_message = $1 WHERE id = $2", 
          [reminderErr.message, reminder.id]);
      }
    }
  } catch (err) {
    console.error('Cron job error:', err);
  }
});

// Start server
async function startServer() {
  try {
    // Test DB connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Appointment Booking API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    // retry after 5 seconds
    console.log('Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
  }
}

startServer();
