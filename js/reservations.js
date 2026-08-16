// js/reservations.js

const STORAGE_KEY_RESERVATIONS = "hrs_reservations";
const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_GUESTS = "hrs_guests";

/**
 * Initializes the Reservations module on page load.
 */
function initReservations() {
  renderReservationList();
  setupReservationEventListeners();
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

      // Action buttons depending on status
      let actionButtons = "";
      if (res.status === "confirmed") {
        actionButtons = `
          <button type="button" class="btn btn-primary res-btn-action res-btn-checkin" title="Check-in Guest">
            🔑 Check In
          </button>
          <button type="button" class="btn btn-secondary res-btn-action res-btn-edit" title="Edit Reservation">
            ✏️ Edit
          </button>
          <button type="button" class="btn btn-danger res-btn-action res-btn-cancel-action" title="Cancel Reservation">
            🚫 Cancel
          </button>
        `;
      } else if (res.status === "checked-in") {
        actionButtons = `
          <button type="button" class="btn btn-danger res-btn-action res-btn-cancel-action" title="Cancel Reservation">
            🚫 Cancel
          </button>
        `;
      }

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
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

/**
 * Searches for rooms that are available between the chosen check-in and check-out dates.
 * @param {string} [excludeReservationId] - Optional reservation ID to exclude from conflict checks.
 */
function searchAvailableRooms(excludeReservationId) {
  const checkInInput = document.getElementById("res-input-checkin");
  const checkOutInput = document.getElementById("res-input-checkout");
  const container = document.getElementById("res-available-rooms");
  const stepDetails = document.getElementById("res-step-details");
  const submitBtn = document.getElementById("res-btn-submit");
  const hiddenRoomId = document.getElementById("res-input-room-id");

  if (!checkInInput || !checkOutInput || !container) return;

  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;

  if (!checkIn || !checkOut) {
    showNotification("Please select both check-in and check-out dates.", "error");
    return;
  }

  if (checkOut <= checkIn) {
    showNotification("Check-out date must be after check-in date.", "error");
    return;
  }

  const excludeId =
    excludeReservationId !== undefined
      ? excludeReservationId
      : document.getElementById("res-input-id")
      ? document.getElementById("res-input-id").value
      : null;

  const rooms = Storage.getAll(STORAGE_KEY_ROOMS);
  const reservations = Storage.getAll(STORAGE_KEY_RESERVATIONS);

  if (rooms.length === 0) {
    container.innerHTML = `
      <div class="res-no-rooms">
        <p>No rooms found in the catalog. Please add rooms first.</p>
      </div>
    `;
    return;
  }

  const availableRooms = rooms.filter((room) =>
    isRoomAvailable(room.id, checkIn, checkOut, reservations, excludeId)
  );

  if (availableRooms.length === 0) {
    container.innerHTML = `
      <div class="res-no-rooms">
        <p>❌ No rooms available for these dates.</p>
      </div>
    `;
    if (stepDetails) stepDetails.style.display = "none";
    if (submitBtn) submitBtn.style.display = "none";
    if (hiddenRoomId) hiddenRoomId.value = "";
    return;
  }

  const currentSelectedRoomId = hiddenRoomId ? hiddenRoomId.value : null;

  container.innerHTML = `
    <div class="res-rooms-grid">
      ${availableRooms
        .map((room) => {
          const isSelected = room.id === currentSelectedRoomId;
          const amenitiesHtml =
            Array.isArray(room.amenities) && room.amenities.length > 0
              ? room.amenities
                  .map(
                    (a) =>
                      `<span class="res-amenity-tag">${a.toUpperCase()}</span>`
                  )
                  .join("")
              : "";

          return `
            <div class="res-room-card ${
              isSelected ? "selected" : ""
            }" data-room-id="${room.id}">
              <div class="res-room-card-header">
                <span class="res-room-card-number">Room ${room.roomNumber}</span>
                <span class="res-room-card-type">${room.type}</span>
              </div>
              <div class="res-room-card-body">
                <p class="res-room-card-price"><strong>$${room.pricePerNight}</strong> / night</p>
                <p class="res-room-card-capacity">👥 Capacity: ${room.capacity} guest${room.capacity > 1 ? "s" : ""}</p>
                ${
                  amenitiesHtml
                    ? `<div class="res-room-amenities">${amenitiesHtml}</div>`
                    : ""
                }
              </div>
              <div class="res-room-card-footer">
                <button type="button" class="btn btn-sm ${
                  isSelected ? "btn-primary" : "btn-secondary"
                } res-btn-select-room" data-room-id="${room.id}">
                  ${isSelected ? "Selected ✓" : "Select Room"}
                </button>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

/**
 * Selects a room from the available search results and reveals Step 2.
 * @param {string} roomId - ID of the selected room.
 */
function selectRoom(roomId) {
  const hiddenRoomId = document.getElementById("res-input-room-id");
  const selectedRoomBanner = document.getElementById("res-selected-room");
  const priceSummary = document.getElementById("res-price-summary");
  const stepDetails = document.getElementById("res-step-details");
  const submitBtn = document.getElementById("res-btn-submit");
  const checkInInput = document.getElementById("res-input-checkin");
  const checkOutInput = document.getElementById("res-input-checkout");

  if (!roomId || !hiddenRoomId || !checkInInput || !checkOutInput) return;

  const room = Storage.getById(STORAGE_KEY_ROOMS, roomId);
  if (!room) return;

  hiddenRoomId.value = roomId;

  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;
  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = nights * room.pricePerNight;

  // Render selected room banner
  if (selectedRoomBanner) {
    selectedRoomBanner.innerHTML = `
      <div class="res-selected-room-info">
        <span class="res-selected-title">Selected: <strong>Room ${room.roomNumber}</strong> (${room.type.toUpperCase()})</span>
        <span class="res-selected-rate">$${room.pricePerNight} per night &bull; Capacity: ${room.capacity}</span>
      </div>
    `;
  }

  // Render price breakdown summary
  if (priceSummary) {
    priceSummary.innerHTML = `
      <div class="res-price-breakdown">
        <div class="res-price-row">
          <span>Rate per night:</span>
          <span>$${room.pricePerNight}</span>
        </div>
        <div class="res-price-row">
          <span>Duration:</span>
          <span>${nights} night${nights > 1 ? "s" : ""} (${formatDate(checkIn)} to ${formatDate(checkOut)})</span>
        </div>
        <div class="res-price-row res-price-total">
          <span>Total Price:</span>
          <span class="res-price-highlight">$${totalPrice}</span>
        </div>
      </div>
    `;
  }

  // Populate guest dropdown (preserve existing selected value if any)
  const currentGuestId = document.getElementById("res-input-guest")
    ? document.getElementById("res-input-guest").value
    : "";
  populateGuestDropdown(currentGuestId);

  // Show Step 2 and submit button
  if (stepDetails) stepDetails.style.display = "block";
  if (submitBtn) submitBtn.style.display = "inline-flex";

  // Update card selected visual states
  const cards = document.querySelectorAll(".res-room-card");
  cards.forEach((card) => {
    const cardRoomId = card.getAttribute("data-room-id");
    const btn = card.querySelector(".res-btn-select-room");
    if (cardRoomId === roomId) {
      card.classList.add("selected");
      if (btn) {
        btn.textContent = "Selected ✓";
        btn.classList.remove("btn-secondary");
        btn.classList.add("btn-primary");
      }
    } else {
      card.classList.remove("selected");
      if (btn) {
        btn.textContent = "Select Room";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
      }
    }
  });
}

/**
 * Populates the guest selection dropdown with registered guests.
 * @param {string} [selectedGuestId] - Optional guest ID to pre-select.
 */
function populateGuestDropdown(selectedGuestId) {
  const guestSelect = document.getElementById("res-input-guest");
  if (!guestSelect) return;

  const guests = Storage.getAll(STORAGE_KEY_GUESTS);

  guestSelect.innerHTML = `<option value="">-- Select a Guest --</option>`;

  if (guests.length === 0) {
    guestSelect.innerHTML = `<option value="">No guests registered yet</option>`;
    return;
  }

  guests.forEach((guest) => {
    const option = document.createElement("option");
    option.value = guest.id;
    option.textContent = `${guest.name} (${guest.phone || guest.email || "No contact"})`;
    if (selectedGuestId && guest.id === selectedGuestId) {
      option.selected = true;
    }
    guestSelect.appendChild(option);
  });
}

/**
 * Opens the Reservation modal and prepares it for new entry.
 */
function openReservationModal() {
  const modal = document.getElementById("res-form-modal");
  const checkInInput = document.getElementById("res-input-checkin");
  const checkOutInput = document.getElementById("res-input-checkout");
  const formTitle = document.getElementById("res-form-title");

  resetReservationForm();

  if (formTitle) formTitle.textContent = "New Reservation";

  // Set min dates to today
  const today = getTodayString();
  if (checkInInput) {
    checkInInput.min = today;
  }
  if (checkOutInput) {
    checkOutInput.min = today;
  }

  if (modal) {
    modal.classList.add("active");
  }
}

/**
 * Opens the Reservation modal in edit mode for a specific reservation.
 * @param {string} reservationId - ID of the reservation to edit.
 */
function openEditReservationModal(reservationId) {
  const reservation = Storage.getById(STORAGE_KEY_RESERVATIONS, reservationId);
  if (!reservation) {
    showNotification("Reservation not found.", "error");
    return;
  }

  if (reservation.status !== "confirmed") {
    showNotification("Only confirmed reservations can be edited.", "error");
    return;
  }

  const modal = document.getElementById("res-form-modal");
  const formTitle = document.getElementById("res-form-title");
  const hiddenId = document.getElementById("res-input-id");
  const checkInInput = document.getElementById("res-input-checkin");
  const checkOutInput = document.getElementById("res-input-checkout");

  resetReservationForm();

  if (formTitle) formTitle.textContent = "Edit Reservation";
  if (hiddenId) hiddenId.value = reservation.id;
  if (checkInInput) checkInInput.value = reservation.checkIn;
  if (checkOutInput) checkOutInput.value = reservation.checkOut;

  // Run availability search excluding the current reservation
  searchAvailableRooms(reservation.id);

  // Auto-select current room
  selectRoom(reservation.roomId);

  // Populate guest dropdown and pre-select current guest
  populateGuestDropdown(reservation.guestId);

  if (modal) {
    modal.classList.add("active");
  }
}

/**
 * Handles checking in a guest for a confirmed reservation.
 * @param {string} reservationId - ID of the reservation to check in.
 */
function checkInReservation(reservationId) {
  const reservation = Storage.getById(STORAGE_KEY_RESERVATIONS, reservationId);
  if (!reservation) {
    showNotification("Reservation not found.", "error");
    return;
  }

  if (reservation.status !== "confirmed") {
    showNotification("Only confirmed reservations can be checked in.", "error");
    return;
  }

  const room = Storage.getById(STORAGE_KEY_ROOMS, reservation.roomId);
  const roomDisplay = room ? room.roomNumber : "Unknown";

  reservation.status = "checked-in";
  Storage.save(STORAGE_KEY_RESERVATIONS, reservation);
  showNotification(`Guest checked in to Room ${roomDisplay}`, "success");
  renderReservationList();
}

/**
 * Cancels an active reservation after user confirmation.
 * @param {string} reservationId - ID of the reservation to cancel.
 */
function cancelReservation(reservationId) {
  const reservation = Storage.getById(STORAGE_KEY_RESERVATIONS, reservationId);
  if (!reservation) {
    showNotification("Reservation not found.", "error");
    return;
  }

  if (reservation.status === "checked-out" || reservation.status === "cancelled") {
    showNotification("Cannot cancel a completed or already cancelled reservation.", "error");
    return;
  }

  const confirmed = window.confirm("Are you sure you want to cancel this reservation?");
  if (confirmed) {
    reservation.status = "cancelled";
    Storage.save(STORAGE_KEY_RESERVATIONS, reservation);
    showNotification("Reservation cancelled successfully!", "success");
    renderReservationList();
  }
}

/**
 * Closes the Reservation modal and resets state.
 */
function closeReservationModal() {
  const modal = document.getElementById("res-form-modal");
  if (modal) {
    modal.classList.remove("active");
  }
  resetReservationForm();
}

/**
 * Resets the Reservation form and temporary selection UI.
 */
function resetReservationForm() {
  const form = document.getElementById("res-form");
  const hiddenId = document.getElementById("res-input-id");
  const hiddenRoomId = document.getElementById("res-input-room-id");
  const container = document.getElementById("res-available-rooms");
  const stepDetails = document.getElementById("res-step-details");
  const submitBtn = document.getElementById("res-btn-submit");
  const selectedRoomBanner = document.getElementById("res-selected-room");
  const formTitle = document.getElementById("res-form-title");

  if (form) form.reset();
  if (hiddenId) hiddenId.value = "";
  if (hiddenRoomId) hiddenRoomId.value = "";
  if (formTitle) formTitle.textContent = "New Reservation";

  if (container) {
    container.innerHTML = `<p class="res-search-placeholder">Select check-in and check-out dates and click "Search Available Rooms".</p>`;
  }
  if (selectedRoomBanner) selectedRoomBanner.innerHTML = "";
  if (stepDetails) stepDetails.style.display = "none";
  if (submitBtn) submitBtn.style.display = "none";
}

/**
 * Attaches event listeners for the Reservation module.
 */
function setupReservationEventListeners() {
  // New Reservation Button
  const btnAdd = document.getElementById("res-btn-add");
  if (btnAdd) {
    btnAdd.addEventListener("click", openReservationModal);
  }

  // Modal Close and Cancel Buttons
  const btnClose = document.getElementById("res-btn-modal-close");
  if (btnClose) {
    btnClose.addEventListener("click", closeReservationModal);
  }

  const btnCancel = document.getElementById("res-btn-cancel");
  if (btnCancel) {
    btnCancel.addEventListener("click", closeReservationModal);
  }

  // Search Available Rooms Button
  const btnSearch = document.getElementById("res-btn-search");
  if (btnSearch) {
    btnSearch.addEventListener("click", () => {
      const hiddenId = document.getElementById("res-input-id");
      const excludeId = hiddenId && hiddenId.value ? hiddenId.value : null;
      searchAvailableRooms(excludeId);
    });
  }

  // Room Card / Select Button delegation
  const availableRoomsContainer = document.getElementById("res-available-rooms");
  if (availableRoomsContainer) {
    availableRoomsContainer.addEventListener("click", (e) => {
      const selectBtn = e.target.closest(".res-btn-select-room");
      const card = e.target.closest(".res-room-card");

      if (selectBtn) {
        const roomId = selectBtn.getAttribute("data-room-id");
        selectRoom(roomId);
      } else if (card) {
        const roomId = card.getAttribute("data-room-id");
        selectRoom(roomId);
      }
    });
  }

  // Table Body Action Delegation
  const tableBody = document.getElementById("res-table-body");
  if (tableBody) {
    tableBody.addEventListener("click", (e) => {
      const checkInBtn = e.target.closest(".res-btn-checkin");
      const editBtn = e.target.closest(".res-btn-edit");
      const cancelBtn = e.target.closest(".res-btn-cancel-action");

      if (checkInBtn) {
        const row = checkInBtn.closest("tr");
        if (row) {
          const resId = row.getAttribute("data-res-id");
          checkInReservation(resId);
        }
      } else if (editBtn) {
        const row = editBtn.closest("tr");
        if (row) {
          const resId = row.getAttribute("data-res-id");
          openEditReservationModal(resId);
        }
      } else if (cancelBtn) {
        const row = cancelBtn.closest("tr");
        if (row) {
          const resId = row.getAttribute("data-res-id");
          cancelReservation(resId);
        }
      }
    });
  }

  // Reservation Form Submission
  const form = document.getElementById("res-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const checkInInput = document.getElementById("res-input-checkin");
      const checkOutInput = document.getElementById("res-input-checkout");
      const hiddenRoomId = document.getElementById("res-input-room-id");
      const guestSelect = document.getElementById("res-input-guest");
      const hiddenId = document.getElementById("res-input-id");

      const checkIn = checkInInput ? checkInInput.value : "";
      const checkOut = checkOutInput ? checkOutInput.value : "";
      const roomId = hiddenRoomId ? hiddenRoomId.value : "";
      const guestId = guestSelect ? guestSelect.value : "";
      const resId = hiddenId ? hiddenId.value : "";

      const validation = validateRequired([
        { value: checkIn, name: "Check-in Date" },
        { value: checkOut, name: "Check-out Date" },
        { value: roomId, name: "Room Selection" },
        { value: guestId, name: "Guest" }
      ]);

      if (!validation.valid) {
        showNotification(validation.message, "error");
        return;
      }

      if (checkOut <= checkIn) {
        showNotification("Check-out date must be after check-in date.", "error");
        return;
      }

      const room = Storage.getById(STORAGE_KEY_ROOMS, roomId);
      if (!room) {
        showNotification("Selected room not found.", "error");
        return;
      }

      const nights = calculateNights(checkIn, checkOut);
      const totalPrice = nights * room.pricePerNight;

      if (resId) {
        // Edit mode: Update existing reservation preserving id and createdAt
        const existing = Storage.getById(STORAGE_KEY_RESERVATIONS, resId);
        if (!existing) {
          showNotification("Reservation record not found.", "error");
          return;
        }

        const updatedReservation = {
          ...existing,
          guestId: guestId,
          roomId: roomId,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: nights,
          totalPrice: totalPrice
        };

        Storage.save(STORAGE_KEY_RESERVATIONS, updatedReservation);
        showNotification("Reservation updated successfully!", "success");
      } else {
        // Create mode
        const newReservation = {
          id: generateId("res"),
          guestId: guestId,
          roomId: roomId,
          checkIn: checkIn,
          checkOut: checkOut,
          nights: nights,
          totalPrice: totalPrice,
          status: "confirmed",
          createdAt: new Date().toISOString()
        };

        Storage.save(STORAGE_KEY_RESERVATIONS, newReservation);
        showNotification("Reservation created successfully!", "success");
      }

      closeReservationModal();
      renderReservationList();
    });
  }
}
