const ical = require('ical-generator');
const moment = require('moment-timezone');

function generateICalForAppointment(appointment) {
  const calendar = ical.default({ name: 'Appointment Booking' });
  
  const startDate = moment.tz(
    appointment.appointment_date + ' ' + appointment.start_time,
    'YYYY-MM-DD HH:mm',
    appointment.timezone || 'UTC'
  ).toDate();
  
  const endDate = moment.tz(
    appointment.appointment_date + ' ' + appointment.end_time,
    'YYYY-MM-DD HH:mm',
    appointment.timezone || 'UTC'
  ).toDate();

  calendar.createEvent({
    start: startDate,
    end: endDate,
    summary: 'Appointment - ' + appointment.service_name,
    description: 'Confirmation: ' + appointment.confirmation_number + '\nProvider: ' + appointment.provider_name + '\nNotes: ' + (appointment.notes || 'N/A'),
    organizer: { name: appointment.provider_name, email: appointment.provider_email },
    url: 'http://localhost:4200/appointments/' + appointment.confirmation_number,
  });

  return calendar.toString();
}

module.exports = { generateICalForAppointment };
