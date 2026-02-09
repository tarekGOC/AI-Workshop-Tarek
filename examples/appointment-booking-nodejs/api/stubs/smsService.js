// Stub SMS service - logs to console

function sendReminderSMS(phoneNumber, message) {
  console.log('=== SMS STUB: Reminder ===');
  console.log('To:', phoneNumber);
  console.log('Message:', message);
  console.log('==========================');
  return { success: true, smsId: 'sms-stub-' + Date.now() };
}

function sendSMS(phoneNumber, message) {
  console.log('=== SMS STUB ===');
  console.log('To:', phoneNumber);
  console.log('Message:', message);
  console.log('================');
  return { success: true, smsId: 'sms-stub-' + Date.now() };
}

module.exports = { sendReminderSMS, sendSMS };
