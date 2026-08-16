// js/rooms.js

const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";

// Capacity mapping based on room type
const CAPACITY_MAP = {
  single: 1,
  double: 2,
  suite: 3,
  deluxe: 4
};

/**
 * Initializes the Room Catalog page by setting up listeners and rendering.
 */
function initRooms() {
  const filterTypeSelect = document.getElementById("room-filter-type");
  const btnAddRoom = document.getElementById("room-btn-add");
  const btnCancelRoom = document.getElementById("room-btn-cancel");
  const btnCloseModal = document.getElementById("room-btn-close-modal");
  const roomForm = document.getElementById("room-form");
  const inputType = document.getElementById("room-input-type");
  const roomListContainer = document.getElementById("room-list");

  // Filter listener
  if (filterTypeSelect) {
    filterTypeSelect.addEventListener("change", () => {
      renderRoomCatalog(getCurrentFilters());
    });
  }

  // Open modal listener
  if (btnAddRoom) {
    btnAddRoom.addEventListener("click", () => {
      showRoomModal();
    });
  }

  // Cancel/Close modal listeners
  if (btnCancelRoom) {
    btnCancelRoom.addEventListener("click", () => {
      hideRoomModal();
    });
  }
  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", () => {
      hideRoomModal();
    });
  }

  // Auto capacity listener when type changes
  if (inputType) {
    inputType.addEventListener("change", (e) => {
      const type = e.target.value;
      const capacityInput = document.getElementById("room-input-capacity");
      if (capacityInput && CAPACITY_MAP[type]) {
        capacityInput.value = CAPACITY_MAP[type];
      }
    });
  }

  // Form submission listener
  if (roomForm) {
    roomForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleRoomFormSubmit();
    });
  }

  // Click handler delegation for cards (Edit & Delete actions)
  if (roomListContainer) {
    roomListContainer.addEventListener("click", (e) => {
      const btnEdit = e.target.closest(".room-btn-edit");
      const btnDelete = e.target.closest(".room-btn-delete");

      if (btnEdit) {
        const card = btnEdit.closest(".room-card");
        if (card) {
          const roomId = card.getAttribute("data-room-id");
          handleEditRoom(roomId);
        }
      } else if (btnDelete) {
        const card = btnDelete.closest(".room-card");
        if (card) {
          const roomId = card.getAttribute("data-room-id");
          handleDeleteRoom(roomId);
        }
      }
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
 * Populates and opens the form modal in edit mode.
 * @param {string} roomId
 */
function handleEditRoom(roomId) {
  const room = Storage.getById(STORAGE_KEY_ROOMS, roomId);
  if (!room) {
    showNotification("Room not found.", "error");
    return;
  }

  // Pre-fill form fields
  document.getElementById("room-input-id").value = room.id;
  document.getElementById("room-input-number").value = room.roomNumber;
  document.getElementById("room-input-type").value = room.type;
  document.getElementById("room-input-capacity").value = CAPACITY_MAP[room.type] || "";
  document.getElementById("room-input-price").value = room.pricePerNight;
  document.getElementById("room-input-floor").value = room.floor;
  document.getElementById("room-input-description").value = room.description || "";

  // Check matching amenities checkboxes
  const checkboxes = document.querySelectorAll(".room-amenity-checkbox");
  checkboxes.forEach(cb => {
    cb.checked = room.amenities && room.amenities.includes(cb.value);
  });

  // Change modal header title
  const modalTitle = document.getElementById("room-form-title");
  if (modalTitle) {
    modalTitle.textContent = "Edit Room";
  }

  showRoomModal();
}

/**
 * Placeholder for deleting a room.
 * @param {string} roomId
 */
function handleDeleteRoom(roomId) {
  // TODO: Member A implements in Commit 4
}

/**
 * Handles adding/saving a room from the form modal.
 */
function handleRoomFormSubmit() {
  const inputId = document.getElementById("room-input-id").value;
  const inputNumber = document.getElementById("room-input-number").value.trim();
  const inputType = document.getElementById("room-input-type").value;
  const inputPrice = parseFloat(document.getElementById("room-input-price").value);
  const inputFloor = parseInt(document.getElementById("room-input-floor").value, 10);
  const inputDescription = document.getElementById("room-input-description").value.trim();
  
  // Collect checked amenities
  const checkedAmenities = Array.from(document.querySelectorAll(".room-amenity-checkbox:checked"))
    .map(cb => cb.value);

  // Validate required fields
  const validation = validateRequired([
    { value: inputNumber, name: "Room Number" },
    { value: inputType, name: "Room Type" },
    { value: inputPrice, name: "Price Per Night" },
    { value: inputFloor, name: "Floor" }
  ]);

  if (!validation.valid) {
    showNotification(validation.message, "error");
    return;
  }

  // Validate number constraints
  if (isNaN(inputPrice) || inputPrice <= 0) {
    showNotification("Price per night must be a positive number.", "error");
    return;
  }
  if (isNaN(inputFloor) || inputFloor <= 0) {
    showNotification("Floor must be a positive integer.", "error");
    return;
  }

  // Check unique room number
  const rooms = Storage.getAll(STORAGE_KEY_ROOMS);
  const isDuplicate = rooms.some(r => r.roomNumber.toLowerCase() === inputNumber.toLowerCase() && r.id !== inputId);

  if (isDuplicate) {
    showNotification(`Room number "${inputNumber}" already exists in catalog.`, "error");
    return;
  }

  const capacity = CAPACITY_MAP[inputType];

  if (inputId) {
    // Edit mode
    const existingRoom = Storage.getById(STORAGE_KEY_ROOMS, inputId);
    if (existingRoom) {
      const updatedRoom = {
        ...existingRoom,
        roomNumber: inputNumber,
        type: inputType,
        pricePerNight: inputPrice,
        capacity: capacity,
        floor: inputFloor,
        amenities: checkedAmenities,
        description: inputDescription
      };
      Storage.save(STORAGE_KEY_ROOMS, updatedRoom);
      showNotification(`Room ${inputNumber} updated successfully.`, "success");
    }
  } else {
    // Add mode
    const newRoom = {
      id: generateId("room"),
      roomNumber: inputNumber,
      type: inputType,
      pricePerNight: inputPrice,
      capacity: capacity,
      floor: inputFloor,
      amenities: checkedAmenities,
      description: inputDescription,
      createdAt: new Date().toISOString()
    };
    Storage.save(STORAGE_KEY_ROOMS, newRoom);
    showNotification(`Room ${inputNumber} added successfully.`, "success");
  }

  // Refresh, close, and reset
  renderRoomCatalog(getCurrentFilters());
  hideRoomModal();
}

/**
 * Opens and shows the room modal form.
 */
function showRoomModal() {
  const modal = document.getElementById("room-form-modal");
  if (modal) {
    modal.classList.add("active");
  }
}

/**
 * Hides and resets the room modal form.
 */
function hideRoomModal() {
  const modal = document.getElementById("room-form-modal");
  if (modal) {
    modal.classList.remove("active");
    resetRoomForm();
  }
}

/**
 * Resets the add/edit room form inputs.
 */
function resetRoomForm() {
  const form = document.getElementById("room-form");
  if (form) {
    form.reset();
  }
  
  const inputId = document.getElementById("room-input-id");
  if (inputId) {
    inputId.value = "";
  }

  const modalTitle = document.getElementById("room-form-title");
  if (modalTitle) {
    modalTitle.textContent = "Add Room";
  }

  // Clear checkboxes
  const checkboxes = document.querySelectorAll(".room-amenity-checkbox");
  checkboxes.forEach(cb => cb.checked = false);
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
