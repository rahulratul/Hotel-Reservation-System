// js/utils.js

function generateId(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function isRoomAvailable(roomId, checkIn, checkOut, reservations, excludeReservationId) {
  return !reservations.some(r => {
    if (r.roomId !== roomId) return false;
    if (r.status === "cancelled" || r.status === "checked-out") return false;
    if (excludeReservationId && r.id === excludeReservationId) return false;
    return r.checkIn < checkOut && r.checkOut > checkIn;
  });
}

function showNotification(message, type = "info") {
  // type: "success", "error", "info"
  const container = document.getElementById("notification-area");
  if (!container) return;
  
  const div = document.createElement("div");
  div.className = "notification notification-" + type;
  
  // Icon based on notification type
  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  
  div.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(div);
  
  // Slide out and remove
  setTimeout(() => {
    div.style.animation = "slideIn var(--transition-normal) reverse forwards";
    setTimeout(() => div.remove(), 250);
  }, 3000);
}

function validateRequired(fields) {
  // fields: array of { value, name }
  const missing = fields.filter(f => !f.value || f.value.toString().trim() === "");
  if (missing.length > 0) {
    return { valid: false, message: "Missing required fields: " + missing.map(f => f.name).join(", ") };
  }
  return { valid: true };
}
