const STORAGE_KEY_GUESTS = "hrs_guests";
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";

function initGuests() {
  renderGuestList();
}

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
