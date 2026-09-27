/**
 * Utility functions for Indian Standard Time (IST - Asia/Kolkata) date and time checks.
 */

/**
 * Returns current Date object converted explicitly to Indian Standard Time (Asia/Kolkata)
 */
export function getIndianDateTime() {
  const now = new Date();
  const istDateString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  return new Date(istDateString);
}

/**
 * Checks if an event is currently LIVE based on Indian Standard Time (IST).
 * Uses 24-hour time_start and time_end strings for the live time comparison.
 */
export function isEventLiveInIST(event, istNow = getIndianDateTime()) {
  if (!event || !event.time_start || !event.time_end) return false;

  // Format current IST date into YYYY-MM-DD
  const year = istNow.getFullYear();
  const month = String(istNow.getMonth() + 1).padStart(2, '0');
  const day = String(istNow.getDate()).padStart(2, '0');
  const currentIstDateStr = `${year}-${month}-${day}`;

  // Check event_date if specified
  if (event.event_date) {
    let eventDateStr = event.event_date;
    if (typeof eventDateStr === 'string' && eventDateStr.includes('T')) {
      eventDateStr = eventDateStr.split('T')[0];
    }
    if (currentIstDateStr !== eventDateStr) {
      return false;
    }
  }

  // Time comparison using 24-hour time_start and time_end
  const parseTimeToMinutes = (tStr) => {
    if (!tStr) return 0;
    const parts = String(tStr).trim().split(':').map((v) => parseInt(v, 10) || 0);
    return parts[0] * 60 + (parts[1] || 0);
  };

  const currentMinutes = istNow.getHours() * 60 + istNow.getMinutes();
  const startMinutes = parseTimeToMinutes(event.time_start);
  const endMinutes = parseTimeToMinutes(event.time_end);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
