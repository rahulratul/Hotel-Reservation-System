const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";
const STORAGE_KEY_GUESTS = "hrs_guests";

/**
 * Initializes the dashboard by rendering all statistics and tables.
 */
function initDashboard() {
  renderDashboard();
}

/**
 * Computes and renders room availability, reservation stats, and upcoming arrivals.
 */
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

  // Upcoming Arrivals
  const sevenDaysDate = new Date(todayDate);
  sevenDaysDate.setDate(sevenDaysDate.getDate() + 7);
  const sevenDaysFromNow = sevenDaysDate.toISOString().split("T")[0];

  const upcomingReservations = reservations.filter(res => 
    res.status === "confirmed" && 
    res.checkIn >= today && 
    res.checkIn <= sevenDaysFromNow
  );

  upcomingReservations.sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const upcomingListEl = document.getElementById("dashboard-upcoming-list");
  const upcomingEmptyEl = document.getElementById("dashboard-empty-upcoming");

  if (upcomingListEl && upcomingEmptyEl) {
    if (upcomingReservations.length === 0) {
      upcomingListEl.parentElement.style.display = "none";
      upcomingEmptyEl.style.display = "block";
    } else {
      upcomingListEl.parentElement.style.display = "table";
      upcomingEmptyEl.style.display = "none";
      
      upcomingListEl.innerHTML = upcomingReservations.map(res => {
        const guest = guests.find(g => g.id === res.guestId);
        const room = rooms.find(r => r.id === res.roomId);
        
        const guestName = guest ? guest.name : "Unknown Guest";
        const roomNumber = room ? room.roomNumber : "Unknown Room";
        
        return `
          <tr>
            <td>${guestName}</td>
            <td>${roomNumber}</td>
            <td>${formatDate(res.checkIn)}</td>
            <td>${formatDate(res.checkOut)}</td>
            <td>${res.nights}</td>
          </tr>
        `;
      }).join("");
    }
  }
}
