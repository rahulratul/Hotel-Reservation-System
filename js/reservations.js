// js/reservations.js

const STORAGE_KEY_RESERVATIONS = "hrs_reservations";
const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_GUESTS = "hrs_guests";

/**
 * Initializes the Reservations module on page load.
 */
function initReservations() {
  renderReservationList();
}

/**
 * Renders the reservations table based on optional filters.
 * @param {Object} [filters={}] - Filter criteria such as status.
 */
function renderReservationList(filters = {}) {
  const tableBody = document.getElementById("res-table-body");
  const emptyState = document.getElementById("res-empty");
  const table = document.getElementById("res-table");
  const countBadge = document.getElementById("res-count");

  if (!tableBody) return;

  const allReservations = Storage.getAll(STORAGE_KEY_RESERVATIONS);
  const rooms = Storage.getAll(STORAGE_KEY_ROOMS);
  const guests = Storage.getAll(STORAGE_KEY_GUESTS);

  let filteredReservations = [...allReservations];

  if (filters.status && filters.status !== "all") {
    filteredReservations = filteredReservations.filter(
      (r) => r.status === filters.status
    );
  }

  // Update count badge
  if (countBadge) {
    countBadge.textContent = `Showing ${filteredReservations.length} of ${allReservations.length} reservations`;
  }

  // Handle empty state
  if (filteredReservations.length === 0) {
    tableBody.innerHTML = "";
    if (table) table.style.display = "none";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (table) table.style.display = "table";
  if (emptyState) emptyState.style.display = "none";

  // Build rows
  tableBody.innerHTML = filteredReservations
    .map((res) => {
      const guest = guests.find((g) => g.id === res.guestId);
      const room = rooms.find((r) => r.id === res.roomId);

      const guestName = guest ? guest.name : "Unknown Guest";
      const roomNumber = room ? `Room ${room.roomNumber}` : "Unknown Room";
      const roomType = room
        ? room.type.charAt(0).toUpperCase() + room.type.slice(1)
        : "N/A";
      const checkInFormatted = formatDate(res.checkIn);
      const checkOutFormatted = formatDate(res.checkOut);
      const formattedTotal = `$${res.totalPrice}`;

      const statusBadgeClass = `res-badge res-badge-${res.status}`;
      const statusLabel =
        res.status === "checked-in"
          ? "Checked In"
          : res.status === "checked-out"
          ? "Checked Out"
          : res.status.charAt(0).toUpperCase() + res.status.slice(1);

      return `
        <tr data-res-id="${res.id}" class="res-row ${
        res.status === "cancelled" ? "res-row-cancelled" : ""
      }">
          <td>
            <div class="res-guest-cell">
              <span class="res-guest-name">${guestName}</span>
            </div>
          </td>
          <td>
            <span class="res-room-number">${roomNumber}</span>
          </td>
          <td>
            <span class="res-room-type">${roomType}</span>
          </td>
          <td>${checkInFormatted}</td>
          <td>${checkOutFormatted}</td>
          <td>${res.nights}</td>
          <td><strong class="res-total-price">${formattedTotal}</strong></td>
          <td>
            <span class="${statusBadgeClass}">${statusLabel}</span>
          </td>
          <td>
            <div class="res-actions-cell">
              <!-- Action buttons will be added in upcoming commits -->
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}
