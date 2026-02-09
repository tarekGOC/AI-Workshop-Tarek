function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  // very loose validation
  const re = /^[\+]?[\d\s\-\(\)]{7,20}$/;
  return re.test(phone);
}

function sanitizeString(str) {
  if (!str) return str;
  return str.replace(/[<>]/g, '');
}

function validateBookingInput(data) {
  const errors = [];
  if (!data.customer_name || data.customer_name.trim().length < 2) {
    errors.push('Name is required (min 2 characters)');
  }
  if (!data.customer_email || !validateEmail(data.customer_email)) {
    errors.push('Valid email is required');
  }
  if (data.customer_phone && !validatePhone(data.customer_phone)) {
    errors.push('Invalid phone number format');
  }
  if (!data.provider_id) {
    errors.push('Provider is required');
  }
  if (!data.service_type_id) {
    errors.push('Service type is required');
  }
  if (!data.appointment_date) {
    errors.push('Appointment date is required');
  }
  if (!data.start_time) {
    errors.push('Start time is required');
  }
  return errors;
}

module.exports = { validateEmail, validatePhone, sanitizeString, validateBookingInput };
