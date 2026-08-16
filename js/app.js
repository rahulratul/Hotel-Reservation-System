// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const navLinks = document.querySelectorAll("[data-page]");
  const pageTitleElement = document.getElementById("page-title");

  const pageTitles = {
    dashboard: "Dashboard Overview",
    rooms: "Room Catalog",
    reservations: "Reservation Management",
    guests: "Guest Directory"
  };

  async function loadPage(page) {
    try {
      const response = await fetch("pages/" + page + ".html");
      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${page}`);
      }
      const html = await response.text();
      contentArea.innerHTML = html;

      // Update page title in the header
      if (pageTitleElement && pageTitles[page]) {
        pageTitleElement.textContent = pageTitles[page];
      }

      // Initialize the corresponding module
      if (page === "rooms" && typeof initRooms === "function") initRooms();
      if (page === "reservations" && typeof initReservations === "function") initReservations();
      if (page === "guests" && typeof initGuests === "function") initGuests();
      if (page === "dashboard" && typeof initDashboard === "function") initDashboard();

      // Update active nav state
      navLinks.forEach(link => link.classList.remove("active"));
      const activeLink = document.querySelector(`[data-page="${page}"]`);
      if (activeLink) activeLink.classList.add("active");
    } catch (err) {
      console.error(err);
      contentArea.innerHTML = `<div class="error-page"><p>Failed to load the requested page.</p></div>`;
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      loadPage(page);
    });
  });

  // Load default page
  loadPage("dashboard");
});
