# Hotel Reservation System -- Project Documentation (Leader Guide)

This document serves as the master reference for the Hotel Reservation System group project. It defines the project scope, technology choices, file organization, Git workflow, coding conventions, and the four-stage development plan. Each team member will receive a separate task document derived from this guide.

---

## 1. Project Overview

A browser-based Hotel Reservation System that allows users to browse available rooms, make reservations for specific dates, manage guest information, and view reservation statistics through a dashboard. The application runs entirely in the browser using local storage for data persistence. No backend server is required.

The system is centered around the reservation workflow: a guest selects their desired dates, sees which rooms are available for that period, and makes a reservation. The room catalog exists to support this flow. The dashboard exists to show reservation activity and availability at a glance.

### Core Modules

| Module | Owner | Branch | Role |
|---|---|---|---|
| Room Catalog | Member A | feature/room-catalog | Set up and display rooms for browsing |
| Reservation System | Member B | feature/reservation-system | Core module: search availability, make and manage reservations |
| Guest and Dashboard | Member C | feature/guest-dashboard | Guest registration, reservation stats, and availability overview |

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (vanilla, no frameworks) |
| Logic | Vanilla JavaScript (ES6+) |
| Data Storage | Browser localStorage |
| Version Control | Git and GitHub |

### Why This Stack

- Zero build tools or package managers needed.
- Any team member can open index.html in a browser to test.
- No environment setup beyond a code editor and Git.

---

## 3. File Organization

The repository must follow this exact structure from the start. The leader is responsible for creating this skeleton before any member begins work.

```
hotel-management/
|
|-- index.html                  (entry point, navigation shell)
|-- css/
|   |-- global.css              (shared variables, resets, typography)
|   |-- rooms.css               (styles for room catalog pages)
|   |-- reservations.css        (styles for reservation pages)
|   |-- guests.css              (styles for guest and dashboard pages)
|
|-- js/
|   |-- app.js                  (router, navigation handler, app init)
|   |-- storage.js              (localStorage wrapper: get, set, delete, getAll)
|   |-- rooms.js                (room catalog logic)
|   |-- reservations.js         (reservation system logic)
|   |-- guests.js               (guest management logic)
|   |-- dashboard.js            (dashboard and statistics logic)
|   |-- utils.js                (shared helpers: ID generator, date formatter, validators)
|
|-- pages/
|   |-- rooms.html              (room catalog view partial)
|   |-- reservations.html       (reservation list and form partial)
|   |-- guests.html             (guest list and form partial)
|   |-- dashboard.html          (dashboard view partial)
|
|-- docs/
|   |-- hotel-reservation-system.md    (this file)
|   |-- member-a-rooms.md       (task doc for Member A)
|   |-- member-b-reservations.md (task doc for Member B)
|   |-- member-c-dashboard.md   (task doc for Member C)
|
|-- README.md
```

### Rules for File Organization

- No member creates new top-level directories without leader approval.
- Each member works only within their assigned files.
- Shared files (global.css, storage.js, utils.js, app.js, index.html) are set up by the leader in Stage 1 and should not be modified by members without prior discussion.
- If a shared utility is needed, request it through the group chat. The leader adds it to utils.js or storage.js.

---

## 4. Data Models

All data is stored in localStorage as JSON strings. Each entity type has its own key.

### 4.1 Rooms (key: "hrs_rooms")

```json
{
  "id": "room-001",
  "roomNumber": "101",
  "type": "single",
  "pricePerNight": 80,
  "capacity": 1,
  "amenities": ["wifi", "tv", "ac"],
  "floor": 1,
  "description": "A comfortable single room with city view",
  "createdAt": "2026-08-15T14:00:00.000Z"
}
```

Field constraints:
- id: string, generated with generateId("room") from utils.js
- roomNumber: string, unique, required
- type: one of "single", "double", "suite", "deluxe"
- pricePerNight: number, positive
- capacity: number, 1 for single, 2 for double, 3 for suite, 4 for deluxe
- amenities: array of strings
- floor: number, positive integer
- description: string, short text describing the room
- createdAt: ISO 8601 string

Note: Rooms do not have a "status" field. Availability is determined dynamically by checking whether the room has an active reservation for the requested dates. This is the key architectural decision for a reservation system.

### 4.2 Reservations (key: "hrs_reservations")

```json
{
  "id": "res-001",
  "guestId": "guest-001",
  "roomId": "room-001",
  "checkIn": "2026-08-20",
  "checkOut": "2026-08-23",
  "nights": 3,
  "totalPrice": 240,
  "status": "confirmed",
  "createdAt": "2026-08-15T14:00:00.000Z"
}
```

Field constraints:
- id: string, generated with generateId("res") from utils.js
- guestId: string, must reference an existing guest
- roomId: string, must reference an existing room
- checkIn: string, YYYY-MM-DD format
- checkOut: string, YYYY-MM-DD format, must be after checkIn
- nights: number, calculated with calculateNights(checkIn, checkOut)
- totalPrice: number, calculated as (nights * room.pricePerNight)
- status: one of "confirmed", "checked-in", "checked-out", "cancelled"
- createdAt: ISO 8601 string

### 4.3 Guests (key: "hrs_guests")

```json
{
  "id": "guest-001",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01700000000",
  "nid": "1234567890",
  "address": "Dhaka, Bangladesh",
  "createdAt": "2026-08-15T14:00:00.000Z"
}
```

Field constraints:
- id: string, generated with generateId("guest") from utils.js
- name: string, required
- email: string, valid email format
- phone: string, required
- nid: string, national ID or passport number
- address: string
- createdAt: ISO 8601 string

### 4.4 Room Availability Logic

This is the most important concept in the system. A room is "available" for a date range if it has no active reservation (status "confirmed" or "checked-in") that overlaps with the requested dates.

Two date ranges overlap if: existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn.

This logic is used by:
- Member B: to show only available rooms when creating a reservation
- Member C: to calculate occupancy on the dashboard
- Member A: to display current availability status on room cards

The availability check function will be placed in utils.js by the leader:

```javascript
function isRoomAvailable(roomId, checkIn, checkOut, reservations, excludeReservationId) {
  return !reservations.some(r => {
    if (r.roomId !== roomId) return false;
    if (r.status === "cancelled" || r.status === "checked-out") return false;
    if (excludeReservationId && r.id === excludeReservationId) return false;
    return r.checkIn < checkOut && r.checkOut > checkIn;
  });
}
```

Parameters:
- roomId: the room to check
- checkIn, checkOut: the requested date range (YYYY-MM-DD strings)
- reservations: the full array from Storage.getAll("hrs_reservations")
- excludeReservationId: optional, used when editing an existing reservation to exclude itself from the overlap check

---

## 5. Shared Utilities (Leader Sets Up in Stage 1)

### 5.1 storage.js

This module wraps localStorage so that all members use the same interface.

```javascript
const Storage = {
  getAll(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  getById(key, id) {
    const items = this.getAll(key);
    return items.find(item => item.id === id) || null;
  },

  save(key, item) {
    const items = this.getAll(key);
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(key, JSON.stringify(items));
  },

  remove(key, id) {
    const items = this.getAll(key).filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
  },

  clear(key) {
    localStorage.removeItem(key);
  }
};
```

### 5.2 utils.js

```javascript
function generateId(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function isRoomAvailable(roomId, checkIn, checkOut, reservations, excludeReservationId) {
  return !reservations.some(r => {
    if (r.roomId !== roomId) return false;
    if (r.status === "cancelled" || r.status === "checked-out") return false;
    if (excludeReservationId && r.id === excludeReservationId) return false;
    return r.checkIn < checkOut && r.checkOut > checkIn;
  });
}

function showNotification(message, type) {
  // type: "success", "error", "info"
  const container = document.getElementById("notification-area");
  const div = document.createElement("div");
  div.className = "notification notification-" + type;
  div.textContent = message;
  container.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

function validateRequired(fields) {
  // fields: array of { value, name }
  const missing = fields.filter(f => !f.value || f.value.toString().trim() === "");
  if (missing.length > 0) {
    return { valid: false, message: "Missing required fields: " + missing.map(f => f.name).join(", ") };
  }
  return { valid: true };
}
```

### 5.3 app.js (Router)

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("content-area");
  const navLinks = document.querySelectorAll("[data-page]");

  async function loadPage(page) {
    try {
      const response = await fetch("pages/" + page + ".html");
      const html = await response.text();
      contentArea.innerHTML = html;

      // Initialize the corresponding module
      if (page === "rooms" && typeof initRooms === "function") initRooms();
      if (page === "reservations" && typeof initReservations === "function") initReservations();
      if (page === "guests" && typeof initGuests === "function") initGuests();
      if (page === "dashboard" && typeof initDashboard === "function") initDashboard();

      // Update active nav state
      navLinks.forEach(link => link.classList.remove("active"));
      const activeLink = document.querySelector('[data-page="' + page + '"]');
      if (activeLink) activeLink.classList.add("active");
    } catch (err) {
      contentArea.innerHTML = "<p>Failed to load page.</p>";
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
```

---

## 6. Coding Conventions

Every member and every AI assistant must follow these rules. Non-compliance will cause merge conflicts and broken features.

### 6.1 Naming

- Variables and functions: camelCase (e.g., getRoomById, totalPrice)
- CSS classes: kebab-case with module prefix (e.g., room-card, res-form, guest-table)
- IDs in HTML: kebab-case with module prefix (e.g., room-list, res-form-checkin)
- Constants: UPPER_SNAKE_CASE (e.g., STORAGE_KEY_ROOMS)
- File names: lowercase with hyphens if needed

### 6.2 JavaScript Rules

- Use const by default. Use let only when reassignment is needed. Never use var.
- Use template literals for string concatenation.
- Use arrow functions for callbacks.
- Each module file exposes one init function (e.g., initRooms, initReservations, initGuests, initDashboard).
- No global variables except the init functions and shared utilities.
- All data access goes through Storage (from storage.js). Never call localStorage directly.
- All ID generation goes through generateId (from utils.js).
- All availability checks go through isRoomAvailable (from utils.js).
- Storage keys are defined as constants at the top of each module file:
  ```javascript
  const STORAGE_KEY_ROOMS = "hrs_rooms";
  ```

### 6.3 CSS Rules

- All shared variables (colors, fonts, spacing, border-radius) are defined in global.css using CSS custom properties.
- Each module CSS file uses the variables from global.css. Do not hardcode color values.
- Minimum font size: 14px for body text.
- Use flexbox or CSS grid for layout. No floats.
- Every interactive element must have a visible hover and focus state.

### 6.4 HTML Rules

- All pages are HTML partials (no html, head, or body tags). They are loaded into the content-area div of index.html.
- Use semantic elements: section, article, table, form, button, label, input.
- Every input must have a corresponding label with a for attribute.
- Every button must have a type attribute (type="button" or type="submit").
- Tables must have thead and tbody.

### 6.5 CSS Custom Properties (defined in global.css)

```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-secondary: #64748b;
  --color-success: #16a34a;
  --color-danger: #dc2626;
  --color-warning: #d97706;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #1e293b;
  --color-text-light: #64748b;
  --color-border: #e2e8f0;

  --font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;

  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

---

## 7. Git Workflow

### 7.1 Branch Structure

```
main                         (production-ready, protected)
  |
  |-- feature/room-catalog       (Member A)
  |-- feature/reservation-system (Member B)
  |-- feature/guest-dashboard    (Member C)
```

### 7.2 Rules

- The main branch is protected. No one pushes directly to main.
- Each member works exclusively on their assigned branch.
- Members pull from main before starting work to stay in sync.
- Merging to main happens only in Stage 4, one branch at a time, in this order:
  1. feature/room-catalog (rooms have no dependencies)
  2. feature/guest-dashboard (guests have no dependencies on reservations)
  3. feature/reservation-system (reservations depend on rooms and guests)
- If there are merge conflicts, the member who owns the branch resolves them.
- After all three branches are merged, Stage 4 work happens directly on main.

### 7.3 Commit Message Format

Every commit message must follow this pattern:

```
[module] action: short description
```

Examples:
```
[rooms] feat: add room catalog with card layout
[rooms] fix: correct capacity display for suite type
[reservations] feat: implement date-based availability search
[guests] style: add responsive table layout for guest list
[dashboard] feat: show occupancy rate and upcoming arrivals
[shared] fix: update isRoomAvailable overlap logic
```

Allowed action tags: feat, fix, style, refactor, docs, test

---

## 8. Stage 1 -- Leader Setup (Before Members Start)

This stage is completed by the leader only. The goal is to create the repository, set up the file skeleton, write shared code, and push it to the main branch so all members can clone and branch from a working base.

### Step-by-Step Instructions

1. Initialize the Git repository and connect to GitHub.

```bash
cd hotel-management
git init
git remote add origin <your-github-repo-url>
```

2. Create the directory structure.

```bash
mkdir -p css js pages docs
```

3. Create index.html with the navigation shell and all script/css imports.

index.html must include:
- Link to Google Fonts (Inter)
- Links to all four CSS files (global.css, rooms.css, reservations.css, guests.css)
- A sidebar or top navigation with four links: Dashboard, Rooms, Reservations, Guests
- Each nav link has a data-page attribute (dashboard, rooms, reservations, guests)
- A div with id="content-area" where page partials load
- A div with id="notification-area" for toast messages
- Script tags for: utils.js, storage.js, app.js, rooms.js, reservations.js, guests.js, dashboard.js

4. Create global.css with CSS custom properties (from Section 6.5), a CSS reset, base typography using Inter, layout styles for the navigation shell, and shared component styles (buttons, forms, tables, cards, notifications).

5. Create storage.js with the code from Section 5.1.

6. Create utils.js with the code from Section 5.2 (includes isRoomAvailable).

7. Create app.js with the router code from Section 5.3.

8. Create empty placeholder files for member-owned files:
   - css/rooms.css, css/reservations.css, css/guests.css
   - js/rooms.js, js/reservations.js, js/guests.js, js/dashboard.js
   - pages/rooms.html, pages/reservations.html, pages/guests.html, pages/dashboard.html

   Each placeholder JS file should contain only its init function stub:
   ```javascript
   function initRooms() {
     // TODO: Member A implements this
   }
   ```

   Each placeholder HTML file should contain only a section with a heading:
   ```html
   <section class="page-section">
     <h2>Rooms</h2>
     <p>This section is under development.</p>
   </section>
   ```

9. Create README.md with project name, team members, tech stack, and how to run (open index.html in browser).

10. Commit and push.

```bash
git add .
git commit -m "[shared] feat: initial project setup with file skeleton and shared utilities"
git push -u origin main
```

11. Create the three feature branches.

```bash
git branch feature/room-catalog
git branch feature/reservation-system
git branch feature/guest-dashboard
git push origin feature/room-catalog
git push origin feature/reservation-system
git push origin feature/guest-dashboard
```

12. Distribute task documents (member-a-rooms.md, member-b-reservations.md, member-c-dashboard.md) to each member.

### Prompt for AI (Stage 1 Setup)

Use this prompt with your AI assistant to generate the Stage 1 code:

```
I am setting up a Hotel Reservation System project. It is a browser-based application
using HTML, CSS, and vanilla JavaScript with localStorage for data persistence.
No backend, no frameworks, no build tools.

Create the following files with full working code:

1. index.html -- the main shell with:
   - Google Fonts import for Inter
   - Links to css/global.css, css/rooms.css, css/reservations.css, css/guests.css
   - A sidebar navigation with links for Dashboard, Rooms, Reservations, Guests
   - Each nav link has a data-page attribute (dashboard, rooms, reservations, guests)
   - A main content area with id="content-area"
   - A notification area with id="notification-area"
   - Script tags for js/utils.js, js/storage.js, js/app.js, js/rooms.js,
     js/reservations.js, js/guests.js, js/dashboard.js

2. css/global.css -- with these CSS custom properties:
   [paste the custom properties from Section 6.5]
   Also include: a full CSS reset, base typography using Inter, layout for
   a sidebar + main content layout, and reusable component styles for buttons
   (primary, secondary, danger), form inputs, tables, cards, and notification
   toasts. All components must use the custom properties. Make the design clean
   and professional.

3. js/storage.js -- localStorage wrapper with getAll, getById, save, remove, clear
4. js/utils.js -- with generateId, formatDate, calculateNights, getTodayString,
   isRoomAvailable, showNotification, validateRequired
   (isRoomAvailable checks if a room has no overlapping active reservations
   for a given date range)
5. js/app.js -- simple page router using fetch to load HTML partials from pages/
   directory into content-area

6. Placeholder files for members:
   - js/rooms.js with empty initRooms function
   - js/reservations.js with empty initReservations function
   - js/guests.js with empty initGuests function
   - js/dashboard.js with empty initDashboard function
   - pages/rooms.html with placeholder section
   - pages/reservations.html with placeholder section
   - pages/guests.html with placeholder section
   - pages/dashboard.html with placeholder section
   - css/rooms.css (empty)
   - css/reservations.css (empty)
   - css/guests.css (empty)

7. README.md with project title "Hotel Reservation System", list of team members
   (placeholder names), tech stack, and instructions to run (open index.html in browser).

Follow these conventions:
- camelCase for JS variables and functions
- kebab-case for CSS classes with module prefixes
- const by default, let only when needed, no var
- Template literals for strings
- Arrow functions for callbacks
- Semantic HTML
- All colors via CSS custom properties, no hardcoded values
```

---

## 9. Stage 2 -- Member Development (Parallel Work)

In this stage, all three members work simultaneously on their own branches. Each member follows their individual task document. The minimum requirement is 5 commits per branch.

### Member A: Room Catalog (feature/room-catalog)

Files owned: js/rooms.js, css/rooms.css, pages/rooms.html

This module is a catalog, not a management panel. Rooms are set up once and browsed by users to see what the hotel offers. The focus is on display and browsing, not heavy CRUD operations.

Features to implement:
1. Room catalog page displaying all rooms as visual cards
2. Add new room form with validation (room number, type, price, capacity, floor, amenities, description)
3. Edit room details
4. Delete room (only if no active reservations reference it)
5. Filter rooms by type (single, double, suite, deluxe)
6. Display current availability status on each card (available today or reserved) by checking against active reservations

### Member B: Reservation System (feature/reservation-system)

Files owned: js/reservations.js, css/reservations.css, pages/reservations.html

This is the core module of the entire project. The reservation workflow is: select dates, see available rooms, pick a room, select a guest, and confirm the reservation.

Features to implement:
1. Reservation list page showing all reservations with guest name and room number
2. Date-based availability search: pick check-in and check-out dates, see which rooms are available using isRoomAvailable from utils.js
3. Create reservation form with available room and guest selection, automatic price calculation
4. Edit reservation (change dates or room, with re-validation of availability)
5. Cancel reservation (set status to cancelled)
6. Check-in action (change status to checked-in)
7. Check-out action (change status to checked-out)
8. Filter reservations by status

### Member C: Guest and Dashboard (feature/guest-dashboard)

Files owned: js/guests.js, js/dashboard.js, css/guests.css, pages/guests.html, pages/dashboard.html

Features to implement:
1. Guest list page showing all registered guests
2. Add new guest form with validation (name, email, phone, NID, address)
3. Edit guest information
4. Delete guest (only if no active reservations)
5. Search guests by name or email
6. Dashboard: room availability overview (total rooms, rooms available today, rooms reserved today)
7. Dashboard: reservation statistics (total, confirmed, checked-in, checked-out, cancelled)
8. Dashboard: upcoming arrivals (reservations with check-in in the next 7 days)
9. Dashboard: total revenue from completed reservations

---

## 10. Stage 3 -- Testing and Polish (On Feature Branches)

Before merging, each member must test their features and ensure code quality on their own branch.

### Checklist for Each Member

- All features work without JavaScript errors in the console.
- All form validations show appropriate error messages.
- The notification system works for success and error cases.
- CSS follows the global.css variables (no hardcoded colors).
- All interactive elements have hover and focus states.
- Tables and lists look correct with 0 items, 1 item, and 10+ items.
- Commit history has at least 5 meaningful commits with proper message format.
- Code has comments explaining non-obvious logic.

### Cross-Validation

After completing their own features, each member should review one other member's branch:
- Member A reviews Member C
- Member B reviews Member A
- Member C reviews Member B

Review checklist:
- Does the code follow the naming conventions from Section 6?
- Are the data models used correctly (correct field names, correct storage keys)?
- Does the feature work when tested in the browser?
- Are there any global variable leaks or naming collisions?

---

## 11. Stage 4 -- Merge and Finalize (Leader Coordinates)

This stage happens on the main branch after all feature branches are merged. A separate document (stage-4-merge-and-polish.md) provides detailed instructions.

### 11.1 Merge Order

Execute merges in this exact order to minimize conflicts:

```bash
# Step 1: Merge room catalog (no dependencies)
git checkout main
git pull origin main
git merge feature/room-catalog
git push origin main

# Step 2: Merge guest-dashboard (no dependency on reservations)
git pull origin main
git merge feature/guest-dashboard
git push origin main

# Step 3: Merge reservation-system (depends on rooms and guests)
git pull origin main
git merge feature/reservation-system
git push origin main
```

### 11.2 Post-Merge Tasks

After all branches are merged, the following tasks are done on main:

1. Integration testing: verify that all modules work together
   - Register a guest, add a room, make a reservation for specific dates
   - Verify the room shows as reserved for those dates
   - Check-in and check-out the reservation
   - Verify dashboard updates with accurate statistics
2. Fix any integration bugs
3. Add seed data: a function that populates sample rooms, guests, and reservations for demonstration
4. Final CSS polish: consistent spacing and alignment across all pages
5. Update README.md with final feature list

### Prompt for AI (Stage 4 -- Post Merge)

```
The Hotel Reservation System has three modules now merged into the main branch:
room catalog (js/rooms.js), reservations (js/reservations.js), guests and
dashboard (js/guests.js, js/dashboard.js).

Please do the following integration and polish work:

1. Review all modules and fix any integration issues. The reservation form
   must use isRoomAvailable() from utils.js to check date-based availability.
   It must load rooms from storage (key: hrs_rooms) and guests from storage
   (key: hrs_guests) as dropdown options.

2. The availability search in the reservation form must show only rooms that
   have no overlapping active reservations for the selected dates.

3. The room catalog must show each room's current availability by checking
   today's date against active reservations using isRoomAvailable().

4. The dashboard must read from all three storage keys (hrs_rooms,
   hrs_reservations, hrs_guests) and display: room availability for today,
   reservation counts by status, upcoming arrivals (next 7 days), and total
   revenue from checked-out reservations.

5. Add a seedData() function that populates 8 sample rooms, 5 sample guests,
   and 6 sample reservations (mix of confirmed, checked-in, checked-out, and
   cancelled) for demonstration. Add a "Load Sample Data" button on the dashboard.

6. Do a final CSS review: ensure consistent spacing, card styles, table styles,
   and button styles across all pages.

7. Ensure no JavaScript console errors exist.

Follow the coding conventions: camelCase for JS, kebab-case for CSS, const by
default, template literals, arrow functions, all data through Storage object,
all availability through isRoomAvailable.
```

---

## 12. Quick Reference for AI Prompts

When any member gives their task document to an AI, they should also include the following context block at the top of their prompt:

```
CONTEXT: This is a Hotel Reservation System built with HTML, CSS, and vanilla
JavaScript. Data is stored in browser localStorage. There is no backend.

The project has shared utilities already set up:
- Storage object (storage.js): getAll(key), getById(key, id), save(key, item),
  remove(key, id)
- utils.js: generateId(prefix), formatDate(dateString), calculateNights(checkIn,
  checkOut), getTodayString(), isRoomAvailable(roomId, checkIn, checkOut,
  reservations, excludeReservationId), showNotification(message, type),
  validateRequired(fields)

Storage keys:
- Rooms: "hrs_rooms"
- Reservations: "hrs_reservations"
- Guests: "hrs_guests"

Key concept: Rooms do NOT have a status field. Availability is determined
dynamically using isRoomAvailable() which checks if a room has any overlapping
active reservation (status "confirmed" or "checked-in") for the requested dates.

Coding conventions:
- camelCase for JS variables and functions
- kebab-case for CSS classes with module prefix (e.g., room-card, res-form)
- const by default, let when reassignment needed, never var
- Template literals for strings
- Arrow functions for callbacks
- All data access through Storage object, never raw localStorage
- All IDs through generateId(prefix) from utils.js
- All availability checks through isRoomAvailable() from utils.js
- Colors only through CSS custom properties defined in global.css
- HTML partials only (no html/head/body tags in page files)
- Semantic HTML with proper label-input pairing
```

---

## 13. Timeline Suggestion

| Stage | Duration | Who |
|---|---|---|
| Stage 1: Leader Setup | Day 1 | Leader only |
| Stage 2: Feature Development | Day 2 - Day 5 | All members (parallel) |
| Stage 3: Testing and Review | Day 6 | All members (cross-review) |
| Stage 4: Merge and Finalize | Day 7 | Leader + all members |

Adjust the timeline based on your actual deadline. The key constraint is that Stage 2 cannot begin until Stage 1 is pushed to main, and Stage 4 cannot begin until all members complete Stage 3.

---

## 14. Troubleshooting Common Issues

### Pages not loading
- Check that the file is being served through a local server or that the browser allows fetch on file:// protocol. Use VS Code Live Server extension or Python's http.server.
- Run: python3 -m http.server 8000 from the project root, then open http://localhost:8000

### Availability check returning wrong results
- Verify the date comparison uses string comparison (YYYY-MM-DD strings compare correctly as strings).
- Verify the overlap logic: r.checkIn < checkOut AND r.checkOut > checkIn.
- Verify that cancelled and checked-out reservations are excluded.
- Open browser console and manually test: isRoomAvailable("room-001", "2026-08-20", "2026-08-23", Storage.getAll("hrs_reservations"))

### Merge conflicts in index.html
- This usually happens if a member accidentally modified index.html. Only the leader should edit this file. If conflicts occur, keep the leader's version and re-apply the member's changes carefully.

### Data not showing after merge
- Check that storage keys match exactly: "hrs_rooms", "hrs_reservations", "hrs_guests". A typo in any module will cause silent failures.
- Open browser dev tools, go to Application tab, check localStorage entries.

### CSS not applying
- Verify the CSS file is linked in index.html.
- Check for class name mismatches (module prefix missing).
- Use browser dev tools to inspect computed styles.

---

End of Leader Guide. Proceed to create the three member task documents next.
