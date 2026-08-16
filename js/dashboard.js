const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";
const STORAGE_KEY_GUESTS = "hrs_guests";

function initDashboard() {
  renderDashboard();
}

function renderDashboard() {
  const rooms = Storage.getAll(STORAGE_KEY_ROOMS);
  const reservations = Storage.getAll(STORAGE_KEY_RESERVATIONS);
  
  const today = getTodayString();
  const todayDate = new Date(today);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  let availableCount = 0;
  
  rooms.forEach(room => {
    if (isRoomAvailable(room.id, today, tomorrow, reservations)) {
      availableCount++;
    }
  });

  const totalRooms = rooms.length;
  const reservedCount = totalRooms - availableCount;

  const totalRoomsEl = document.getElementById("dashboard-stat-total-rooms");
  const availableEl = document.getElementById("dashboard-stat-available");
  const reservedEl = document.getElementById("dashboard-stat-reserved");

  if (totalRoomsEl) totalRoomsEl.textContent = totalRooms;
  if (availableEl) availableEl.textContent = availableCount;
  if (reservedEl) reservedEl.textContent = reservedCount;

  // Reservation statistics
  let confirmedCount = 0;
  let checkedInCount = 0;
  let checkedOutCount = 0;
  let cancelledCount = 0;
  let totalRevenue = 0;

  reservations.forEach(res => {
    if (res.status === "confirmed") confirmedCount++;
    else if (res.status === "checked-in") checkedInCount++;
    else if (res.status === "checked-out") {
      checkedOutCount++;
      totalRevenue += (res.totalPrice || 0);
    }
    else if (res.status === "cancelled") cancelledCount++;
  });

  const totalResEl = document.getElementById("dashboard-stat-total-res");
  const confirmedEl = document.getElementById("dashboard-stat-confirmed");
  const checkedInEl = document.getElementById("dashboard-stat-checkedin");
  const checkedOutEl = document.getElementById("dashboard-stat-checkedout");
  const cancelledEl = document.getElementById("dashboard-stat-cancelled");

  if (totalResEl) totalResEl.textContent = reservations.length;
  if (confirmedEl) confirmedEl.textContent = confirmedCount;
  if (checkedInEl) checkedInEl.textContent = checkedInCount;
  if (checkedOutEl) checkedOutEl.textContent = checkedOutCount;
  if (cancelledEl) cancelledEl.textContent = cancelledCount;

  // Guest and revenue stats
  const guests = Storage.getAll(STORAGE_KEY_GUESTS);
  const totalGuestsEl = document.getElementById("dashboard-stat-total-guests");
  const revenueEl = document.getElementById("dashboard-stat-revenue");

  if (totalGuestsEl) totalGuestsEl.textContent = guests.length;
  if (revenueEl) {
    revenueEl.textContent = "$" + totalRevenue.toLocaleString("en-US");
  }
}
