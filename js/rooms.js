// js/rooms.js

const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";

/**
 * Initializes the Room Catalog page by setting up listeners and rendering.
 */
function initRooms() {
  const filterTypeSelect = document.getElementById("room-filter-type");

  if (filterTypeSelect) {
    filterTypeSelect.addEventListener("change", () => {
      renderRoomCatalog(getCurrentFilters());
    });
  }

  // Initial render
  renderRoomCatalog(getCurrentFilters());
}

/**
 * Renders the room catalog grid.
 * @param {Object} filters - Filtering options.
 */
function renderRoomCatalog(filters = { type: "all" }) {
  const roomListContainer = document.getElementById("room-list");
  const roomEmptyState = document.getElementById("room-empty");
  const roomCountDisplay = document.getElementById("room-count");

  if (!roomListContainer) return;

  // Get all rooms from Storage
  let rooms = Storage.getAll(STORAGE_KEY_ROOMS);

  // Apply filters
  if (filters.type && filters.type !== "all") {
    rooms = rooms.filter(room => room.type === filters.type);
  }

  // Update room count display
  if (roomCountDisplay) {
    roomCountDisplay.textContent = rooms.length;
  }

  // Check if catalog is empty
  if (rooms.length === 0) {
    roomListContainer.innerHTML = "";
    if (roomEmptyState) roomEmptyState.style.display = "flex";
    return;
  }

  if (roomEmptyState) roomEmptyState.style.display = "none";

  // Build card HTML for each room
  let html = "";
  rooms.forEach(room => {
    // Amenity tags markup
    const amenitiesMarkup = room.amenities && room.amenities.length > 0
      ? room.amenities.map(amenity => `<span class="room-amenity-tag">${amenity}</span>`).join("")
      : '<span class="room-amenity-tag room-no-amenities">No amenities</span>';

    // Room type-based background colors class
    const cardBgClass = `room-card-header-${room.type}`;

    html += `
      <article class="card-custom room-card" data-room-id="${room.id}">
        <div class="room-card-header ${cardBgClass}">
          <span class="room-card-number">${room.roomNumber}</span>
          <span class="room-type-badge badge-${room.type}">${room.type}</span>
        </div>
        <div class="room-card-body">
          <div class="room-price-info">
            <span class="room-price">$${room.pricePerNight}</span>
            <span class="room-price-label">/ night</span>
          </div>
          
          <div class="room-specs">
            <div class="room-spec-item">
              <span class="spec-icon">👥</span>
              <span>${room.capacity} ${room.capacity === 1 ? "Guest" : "Guests"}</span>
            </div>
            <div class="room-spec-item">
              <span class="spec-icon">🏢</span>
              <span>Floor ${room.floor}</span>
            </div>
          </div>

          <p class="room-description">${room.description || "No description provided."}</p>

          <div class="room-amenities">
            ${amenitiesMarkup}
          </div>
        </div>
        <div class="room-card-footer">
          <button type="button" class="btn btn-secondary btn-sm room-btn-edit">
            ✏️ Edit
          </button>
          <button type="button" class="btn btn-danger btn-sm room-btn-delete">
            🗑️ Delete
          </button>
        </div>
      </article>
    `;
  });

  roomListContainer.innerHTML = html;
}

/**
 * Gets the current active filters from the UI elements.
 * @returns {Object}
 */
function getCurrentFilters() {
  const filterTypeSelect = document.getElementById("room-filter-type");
  return {
    type: filterTypeSelect ? filterTypeSelect.value : "all"
  };
}
