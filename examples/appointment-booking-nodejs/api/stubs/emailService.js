// Stub email service - logs to console instead of actually sending emails

function sendConfirmationEmail(to, appointmentDetails) {
  console.log('=== EMAIL STUB: Confirmation Email ===');
  console.log('To:', to);
  console.log('Subject: Appointment Confirmed - ' + appointmentDetails.confirmationNumber);
  console.log('Body: Your appointment with ' + appointmentDetails.providerName + ' on ' + appointmentDetails.date + ' at ' + appointmentDetails.startTime + ' has been confirmed.');
  console.log('Confirmation Number:', appointmentDetails.confirmationNumber);
  console.log('Cancellation Link: http://localhost:4200/cancel/' + appointmentDetails.cancellationToken);
  console.log('======================================');
  return { success: true, messageId: 'stub-' + Date.now() };
}

function sendCancellationEmail(to, appointmentDetails) {
  console.log('=== EMAIL STUB: Cancellation Email ===');
  console.log('To:', to);
  console.log('Subject: Appointment Cancelled - ' + appointmentDetails.confirmationNumber);
  console.log('Body: Your appointment on ' + appointmentDetails.date + ' at ' + appointmentDetails.startTime + ' has been cancelled.');
  if (appointmentDetails.reason) {
    console.log('Reason:', appointmentDetails.reason);
  }
  console.log('======================================');
  return { success: true, messageId: 'stub-' + Date.now() };
}

function sendReminderEmail(to, appointmentDetails) {
  console.log('=== EMAIL STUB: Reminder Email ===');
  console.log('To:', to);
  console.log('Subject: Appointment Reminder - Tomorrow');
  console.log('Body: Reminder: You have an appointment with ' + appointmentDetails.providerName + ' tomorrow at ' + appointmentDetails.startTime);
  console.log('Confirm/Reschedule: http://localhost:4200/cancel/' + appointmentDetails.cancellationToken);
  console.log('==================================');
  return { success: true, messageId: 'stub-' + Date.now() };
}

function sendProviderNotification(to, type, details) {
  console.log('=== EMAIL STUB: Provider Notification ===');
  console.log('To:', to);
  console.log('Type:', type);
  console.log('Details:', JSON.stringify(details));
  console.log('=========================================');
  return { success: true, messageId: 'stub-' + Date.now() };
}

function sendCustomMessage(to, subject, body) {
  console.log('=== EMAIL STUB: Custom Message ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:', body);
  console.log('==================================');
  return { success: true, messageId: 'stub-' + Date.now() };
}

module.exports = { sendConfirmationEmail, sendCancellationEmail, sendReminderEmail, sendProviderNotification, sendCustomMessage };
