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
}
