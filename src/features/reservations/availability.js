// src/features/reservations/availability.js

/**
 * Checks if a room is available for a given check-in and check-out date range.
 * Overlaps occur if: existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn.
 * Cancelled or Checked-out reservations do not block availability.
 * 
 * @param {string} roomId 
 * @param {string} checkIn YYYY-MM-DD
 * @param {string} checkOut YYYY-MM-DD
 * @param {Array} reservations 
 * @param {string} [excludeReservationId] 
 * @returns {boolean}
 */
export function isRoomAvailable(roomId, checkIn, checkOut, reservations = [], excludeReservationId) {
  const resArray = reservations || [];
  return !resArray.some(r => {
    if (r.roomId !== roomId) return false;
    if (r.status === "cancelled" || r.status === "checked-out") return false;
    if (excludeReservationId && r.id === excludeReservationId) return false;
    return r.checkIn < checkOut && r.checkOut > checkIn;
  });
}
