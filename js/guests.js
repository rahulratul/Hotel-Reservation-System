// js/guests.js

/**
 * Initializes the guest management page by rendering the guest list
 * and setting up form event listeners.
 */
function initGuests() {
  renderGuestList();
  setupGuestFormListeners();
}

/**
 * Sets up event listeners for the guest form modal.
 */
function setupGuestFormListeners() {
  const addBtn = document.getElementById("guest-btn-add");
  const cancelBtn = document.getElementById("guest-btn-cancel");
  const form = document.getElementById("guest-form");
  const modal = document.getElementById("guest-form-modal");
  const searchInput = document.getElementById("guest-search");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderGuestList(e.target.value);
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      resetGuestForm();
      modal.classList.add("active");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      modal.classList.remove("active");
      resetGuestForm();
    });
  }

  if (form) {
    form.addEventListener("submit", handleGuestSubmit);
  }

  const tableBody = document.getElementById("guest-table-body");
  if (tableBody) {
    tableBody.addEventListener("click", handleTableClick);
  }
}

/**
 * Handles clicks on the guest table (Edit and Delete buttons).
 * @param {Event} e - The click event
 */
function handleTableClick(e) {
  const editBtn = e.target.closest(".guest-btn-edit");
  const deleteBtn = e.target.closest(".guest-btn-delete");
  
  if (editBtn) {
    const id = editBtn.getAttribute("data-id");
    openEditModal(id);
    return;
  }
  
  if (deleteBtn) {
    const id = deleteBtn.getAttribute("data-id");
    handleDeleteGuest(id);
    return;
  }
}

/**
 * Handles deleting a guest after verifying they have no active reservations.
 * @param {string} id - The ID of the guest to delete
 */
function handleDeleteGuest(id) {
  const guest = Storage.getById(STORAGE_KEY_GUESTS, id);
  if (!guest) return;

  const reservations = Storage.getAll(STORAGE_KEY_RESERVATIONS);
  const activeReservations = reservations.filter(r => 
    r.guestId === id && (r.status === "confirmed" || r.status === "checked-in")
  );

  if (activeReservations.length > 0) {
    showNotification(`Cannot delete ${guest.name}. They have ${activeReservations.length} active reservation(s).`, "error");
    return;
  }

  if (confirm(`Are you sure you want to delete ${guest.name}?`)) {
    Storage.remove(STORAGE_KEY_GUESTS, id);
    showNotification("Guest deleted successfully", "success");
    
    renderGuestList(getCurrentSearchTerm());
  }
}

/**
 * Opens the edit modal and pre-fills it with the guest's data.
 * @param {string} id - The ID of the guest to edit
 */
function openEditModal(id) {
  const guest = Storage.getById(STORAGE_KEY_GUESTS, id);
  if (!guest) return;
  
  document.getElementById("guest-form-title").textContent = "Edit Guest";
  document.getElementById("guest-input-id").value = guest.id;
  document.getElementById("guest-input-name").value = guest.name;
  document.getElementById("guest-input-email").value = guest.email;
  document.getElementById("guest-input-phone").value = guest.phone;
  document.getElementById("guest-input-nid").value = guest.nid;
  document.getElementById("guest-input-address").value = guest.address || "";
  
  document.getElementById("guest-form-modal").classList.add("active");
}

/**
 * Handles the submission of the guest form (Add or Edit).
 * Validates fields and saves the guest.
 * @param {Event} e - The submit event
 */
function handleGuestSubmit(e) {
  e.preventDefault();
  
  const idInput = document.getElementById("guest-input-id").value;
  const name = document.getElementById("guest-input-name").value.trim();
  const email = document.getElementById("guest-input-email").value.trim();
  const phone = document.getElementById("guest-input-phone").value.trim();
  const nid = document.getElementById("guest-input-nid").value.trim();
  const address = document.getElementById("guest-input-address").value.trim();
  
  // Validation
  const reqCheck = validateRequired([
    { value: name, name: "Name" },
    { value: email, name: "Email" },
    { value: phone, name: "Phone" },
    { value: nid, name: "NID/Passport" }
  ]);
  
  if (!reqCheck.valid) {
    showNotification(reqCheck.message, "error");
    return;
  }
  
  if (name.length < 2) {
    showNotification("Name must be at least 2 characters long", "error");
    return;
  }
  
  if (!validateEmail(email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }
  
  if (phone.length < 8) {
    showNotification("Phone number must be at least 8 characters long", "error");
    return;
  }
  
  // Check email uniqueness
  const guests = Storage.getAll(STORAGE_KEY_GUESTS);
  const isDuplicateEmail = guests.some(g => g.email.toLowerCase() === email.toLowerCase() && g.id !== idInput);
  
  if (isDuplicateEmail) {
    showNotification("This email is already registered to another guest", "error");
    return;
  }
  
  // Create or update guest
  let newGuest;
  
  if (idInput) {
    const existingGuest = Storage.getById(STORAGE_KEY_GUESTS, idInput);
    newGuest = {
      ...existingGuest,
      name,
      email,
      phone,
      nid,
      address
    };
    showNotification("Guest updated successfully", "success");
  } else {
    newGuest = {
      id: generateId("guest"),
      name,
      email,
      phone,
      nid,
      address,
      createdAt: new Date().toISOString()
    };
    showNotification("Guest added successfully", "success");
  }
  
  Storage.save(STORAGE_KEY_GUESTS, newGuest);
  
  document.getElementById("guest-form-modal").classList.remove("active");
  resetGuestForm();
  
  renderGuestList(getCurrentSearchTerm());
}

/**
 * Resets the guest form and modal title.
 */
function resetGuestForm() {
  const form = document.getElementById("guest-form");
  if (form) form.reset();
  
  const idInput = document.getElementById("guest-input-id");
  if (idInput) idInput.value = "";
  
  const title = document.getElementById("guest-form-title");
  if (title) title.textContent = "Add Guest";
}

/**
 * Gets the current search term from the search input.
 * @returns {string} The current search term
 */
function getCurrentSearchTerm() {
  const searchInput = document.getElementById("guest-search");
  return searchInput ? searchInput.value : "";
}

/**
 * Validates an email address.
 * @param {string} email - The email to validate
 * @returns {boolean} True if the email is valid
 */
function validateEmail(email) {
  return email.includes("@") && email.includes(".");
}

/**
 * Renders the guest list table, filtering by search term if provided.
 * @param {string} searchTerm - The search term to filter by
 */
function renderGuestList(searchTerm = "") {
  const tableBody = document.getElementById("guest-table-body");
  const emptyState = document.getElementById("guest-empty");
  const countDisplay = document.getElementById("guest-count");
  const table = document.getElementById("guest-table");
  
  if (!tableBody || !emptyState || !countDisplay || !table) return;

  const guests = Storage.getAll(STORAGE_KEY_GUESTS);
  let filteredGuests = guests;
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredGuests = guests.filter(g => 
      g.name.toLowerCase().includes(term) || 
      g.email.toLowerCase().includes(term)
    );
  }

  countDisplay.textContent = `Showing ${filteredGuests.length} of ${guests.length} guests`;

  if (filteredGuests.length === 0) {
    table.style.display = "none";
    emptyState.style.display = "block";
    emptyState.innerHTML = `<p>${guests.length === 0 ? "No guests registered" : "No guests match your search"}</p>`;
  } else {
    table.style.display = "table";
    emptyState.style.display = "none";
    
    tableBody.innerHTML = filteredGuests.map(guest => `
      <tr data-guest-id="${guest.id}">
        <td>${guest.name}</td>
        <td>${guest.email}</td>
        <td>${guest.phone}</td>
        <td>${guest.nid}</td>
        <td>${guest.address || ""}</td>
        <td>${formatDate(guest.createdAt)}</td>
        <td>
          <button type="button" class="btn btn-secondary guest-btn-edit" data-id="${guest.id}">Edit</button>
          <button type="button" class="btn btn-danger guest-btn-delete" data-id="${guest.id}">Delete</button>
        </td>
      </tr>
    `).join("");
  }
}
