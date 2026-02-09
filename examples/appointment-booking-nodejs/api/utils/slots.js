const moment = require('moment-timezone');

// Calculate available time slots for a provider on a given date
function calculateAvailableSlots(date, availability, breaks, blockedDates, existingAppointments, serviceDuration, bufferMinutes, timezone) {
  timezone = timezone || 'UTC';
  const dateStr = moment(date).format('YYYY-MM-DD');
  const dayOfWeek = moment(date).day(); // 0=Sunday, 6=Saturday

  // Check if date is blocked
  const isBlocked = blockedDates.some(b => {
    const blockedStr = moment(b.blocked_date).format('YYYY-MM-DD');
    return blockedStr === dateStr;
  });
  if (isBlocked) return [];

  // Find availability for this day of week
  const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek && a.is_active);
  if (dayAvailability.length === 0) return [];

  const slots = [];
  const totalSlotMinutes = serviceDuration + (bufferMinutes || 0);

  for (const avail of dayAvailability) {
    let currentTime = moment.tz(dateStr + ' ' + avail.start_time, 'YYYY-MM-DD HH:mm:ss', timezone);
    const endTime = moment.tz(dateStr + ' ' + avail.end_time, 'YYYY-MM-DD HH:mm:ss', timezone);

    while (currentTime.clone().add(serviceDuration, 'minutes').isSameOrBefore(endTime)) {
      const slotStart = currentTime.clone();
      const slotEnd = currentTime.clone().add(serviceDuration, 'minutes');

      // Check if slot overlaps with any break
      const overlapsBreak = breaks.some(b => {
        if (b.day_of_week !== dayOfWeek) return false;
        const breakStart = moment.tz(dateStr + ' ' + b.start_time, 'YYYY-MM-DD HH:mm:ss', timezone);
        const breakEnd = moment.tz(dateStr + ' ' + b.end_time, 'YYYY-MM-DD HH:mm:ss', timezone);
        return slotStart.isBefore(breakEnd) && slotEnd.isAfter(breakStart);
      });

      // Check if slot overlaps with existing appointments
      const overlapsAppointment = existingAppointments.some(apt => {
        if (apt.status === 'cancelled') return false;
        const aptStart = moment.tz(dateStr + ' ' + apt.start_time, 'YYYY-MM-DD HH:mm:ss', timezone);
        const aptEnd = moment.tz(dateStr + ' ' + apt.end_time, 'YYYY-MM-DD HH:mm:ss', timezone);
        return slotStart.isBefore(aptEnd) && slotEnd.isAfter(aptStart);
      });

      if (!overlapsBreak && !overlapsAppointment) {
        slots.push({
          date: dateStr,
          start_time: slotStart.format('HH:mm'),
          end_time: slotEnd.format('HH:mm'),
          available: true
        });
      }

      currentTime.add(totalSlotMinutes, 'minutes');
    }
  }

  return slots;
}

module.exports = { calculateAvailableSlots };
