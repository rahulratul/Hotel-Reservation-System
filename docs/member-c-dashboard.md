# Member C -- Guest and Dashboard (Task Document)

You are Member C. You own the Guest Management module and the Dashboard module. Your work happens on the **feature/guest-dashboard** branch. You are responsible for guest registration, editing, deletion, search, and the dashboard that shows reservation statistics, room availability overview, and upcoming arrivals.

---

## Your Files

You may only modify these files:

| File | Purpose |
|---|---|
| js/guests.js | All guest management logic |
| js/dashboard.js | Dashboard statistics and display logic |
| css/guests.css | Styles for both guest pages and dashboard |
| pages/guests.html | Guest page HTML partial |
| pages/dashboard.html | Dashboard page HTML partial |

Do not modify index.html, global.css, storage.js, utils.js, app.js, or any file belonging to another member.

---

## Shared Resources Available to You

These are already set up in the main branch from Stage 1.

### Storage API (storage.js)

```javascript
// Guest operations
Storage.getAll("hrs_guests")             // returns array of all guests
Storage.getById("hrs_guests", id)        // returns one guest or null
Storage.save("hrs_guests", guestObj)     // creates or updates a guest
Storage.remove("hrs_guests", id)         // deletes a guest by id

// Reading other modules (for dashboard and delete validation)
Storage.getAll("hrs_rooms")              // returns array of all rooms
Storage.getAll("hrs_reservations")       // returns array of all reservations
```

### Utility Functions (utils.js)

```javascript
generateId("guest")                             // returns "guest-lxyz12abc"
formatDate("2026-08-15T14:00:00.000Z")          // returns "Aug 15, 2026"
getTodayString()                                // returns "2026-08-15"
calculateNights("2026-08-20", "2026-08-23")     // returns 3
showNotification("Guest added", "success")      // shows toast
validateRequired([{ value: val, name: "Name" }])

// Check room availability for a date range
isRoomAvailable(roomId, checkIn, checkOut, reservations, excludeReservationId)
```

### Storage Keys

```javascript
const STORAGE_KEY_GUESTS = "hrs_guests";
const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";
```

### Guest Data Model

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

Field rules:
- name: string, required, minimum 2 characters
- email: string, must contain "@" and ".", required
- phone: string, required, minimum 8 characters
- nid: string, national ID or passport number, required
- address: string, optional
- id: generated with generateId("guest")
- createdAt: ISO 8601 string

### Room Data Model (for dashboard reference)

```json
{
  "id": "room-001",
  "roomNumber": "101",
  "type": "single",
  "pricePerNight": 80,
  "capacity": 1,
  "amenities": ["wifi", "tv", "ac"],
  "floor": 1,
  "description": "A comfortable single room",
  "createdAt": "2026-08-15T14:00:00.000Z"
}
```

Important: Rooms do NOT have a status field. Availability is date-based.

### Reservation Data Model (for dashboard reference)

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

status values: "confirmed", "checked-in", "checked-out", "cancelled"

---

## Setting Up Test Data

For guest management (Commits 1-5), you do not need seeded data since you are building the guest CRUD yourself. For the dashboard (Commits 6-8), you need rooms and reservations. Open the browser console and run this before working on dashboard commits:

```javascript
// Seed test rooms
const testRooms = [
  { id: "room-t1", roomNumber: "101", type: "single", pricePerNight: 80, capacity: 1, amenities: ["wifi", "tv"], floor: 1, description: "Cozy single", createdAt: new Date().toISOString() },
  { id: "room-t2", roomNumber: "201", type: "double", pricePerNight: 120, capacity: 2, amenities: ["wifi", "tv", "ac"], floor: 2, description: "Spacious double", createdAt: new Date().toISOString() },
  { id: "room-t3", roomNumber: "301", type: "suite", pricePerNight: 250, capacity: 3, amenities: ["wifi", "tv", "ac", "minibar"], floor: 3, description: "Premium suite", createdAt: new Date().toISOString() },
  { id: "room-t4", roomNumber: "102", type: "single", pricePerNight: 80, capacity: 1, amenities: ["wifi"], floor: 1, description: "Economy single", createdAt: new Date().toISOString() },
  { id: "room-t5", roomNumber: "202", type: "deluxe", pricePerNight: 300, capacity: 4, amenities: ["wifi", "tv", "ac", "minibar", "balcony", "safe"], floor: 2, description: "Luxury deluxe", createdAt: new Date().toISOString() }
];
localStorage.setItem("hrs_rooms", JSON.stringify(testRooms));

// Seed test reservations (use dates relative to when you test)
const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
const in5Days = new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0];
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0];

const testReservations = [
  { id: "res-t1", guestId: "guest-t1", roomId: "room-t2", checkIn: threeDaysAgo, checkOut: in3Days, nights: 6, totalPrice: 720, status: "checked-in", createdAt: new Date().toISOString() },
  { id: "res-t2", guestId: "guest-t2", roomId: "room-t1", checkIn: tomorrow, checkOut: in5Days, nights: 4, totalPrice: 320, status: "confirmed", createdAt: new Date().toISOString() },
  { id: "res-t3", guestId: "guest-t1", roomId: "room-t3", checkIn: lastWeek, checkOut: threeDaysAgo, nights: 4, totalPrice: 1000, status: "checked-out", createdAt: new Date().toISOString() },
  { id: "res-t4", guestId: "guest-t3", roomId: "room-t5", checkIn: in3Days, checkOut: nextWeek, nights: 4, totalPrice: 1200, status: "confirmed", createdAt: new Date().toISOString() },
  { id: "res-t5", guestId: "guest-t2", roomId: "room-t1", checkIn: lastWeek, checkOut: threeDaysAgo, nights: 4, totalPrice: 320, status: "cancelled", createdAt: new Date().toISOString() }
];
localStorage.setItem("hrs_reservations", JSON.stringify(testReservations));

// Seed test guests (so dashboard can resolve names)
const testGuests = [
  { id: "guest-t1", name: "John Doe", email: "john@example.com", phone: "01711111111", nid: "1234567890", address: "Dhaka", createdAt: new Date().toISOString() },
  { id: "guest-t2", name: "Jane Smith", email: "jane@example.com", phone: "01722222222", nid: "0987654321", address: "Chittagong", createdAt: new Date().toISOString() },
  { id: "guest-t3", name: "Bob Wilson", email: "bob@example.com", phone: "01733333333", nid: "1122334455", address: "Sylhet", createdAt: new Date().toISOString() }
];
localStorage.setItem("hrs_guests", JSON.stringify(testGuests));
```

---

## Branch Setup

```bash
git clone <repo-url>
cd hotel-management
git checkout feature/guest-dashboard
```

Verify the project works by opening index.html in a browser (use Live Server or python3 -m http.server 8000).

---

## Feature Breakdown and Commit Plan

Your work is divided into 8 commits. The first 5 focus on guest management. The last 3 focus on the dashboard. Follow this order exactly.

---

### Commit 1: Guest list page with table layout

**What to build:**
- The guests.html partial with a header, search bar, and guest table.
- The initGuests function that reads all guests and renders them.
- Each row shows: name, email, phone, NID, address, registration date, and action buttons.

**Acceptance criteria:**
- "No guests registered" shows if storage is empty.
- Guests in localStorage render in the table.
- Registration date is formatted with formatDate.
- Each row has Edit and Delete buttons.

**Commit message:**
```
[guests] feat: add guest list page with table layout
```

**AI Prompt:**

```
CONTEXT: This is a Hotel Reservation System built with HTML, CSS, and vanilla
JavaScript. Data is stored in browser localStorage. There is no backend.

The project has shared utilities already set up:
- Storage object (storage.js): getAll(key), getById(key, id), save(key, item),
  remove(key, id)
- utils.js: generateId(prefix), formatDate(dateString), getTodayString(),
  isRoomAvailable(roomId, checkIn, checkOut, reservations, excludeResId),
  showNotification(message, type), validateRequired(fields)
- app.js loads HTML partials from pages/ into a div with id="content-area"

Storage key for guests: "hrs_guests"

Guest data model:
{
  "id": "guest-001",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01700000000",
  "nid": "1234567890",
  "address": "Dhaka, Bangladesh",
  "createdAt": "2026-08-15T14:00:00.000Z"
}

TASK: Create the guest list page. I need three files:

1. pages/guests.html -- an HTML partial (no html/head/body tags):
   - Page header with title "Guest Management" and "Add Guest" button
     (id="guest-btn-add", type="button")
   - Search bar (id="guest-search", type="text",
     placeholder="Search by name or email...")
   - Guest count display (id="guest-count")
   - Table (id="guest-table") with thead: Name, Email, Phone, NID,
     Address, Registered, Actions
   - Tbody (id="guest-table-body")
   - Empty state div (id="guest-empty")

2. js/guests.js -- containing:
   - const STORAGE_KEY_GUESTS = "hrs_guests"
   - const STORAGE_KEY_RESERVATIONS = "hrs_reservations"
   - function initGuests() called on page load
   - function renderGuestList(searchTerm) that:
     - Reads all guests, filters by search if provided
     - Case-insensitive partial match on name and email
     - Renders rows with data-guest-id attribute
     - Edit and Delete buttons (guest-btn-edit, guest-btn-delete)
     - Formats createdAt with formatDate
     - Updates count: "Showing X of Y guests"
     - Empty state if no results

3. css/guests.css -- containing:
   - Table styles with global.css variables
   - Page header layout
   - Search bar styling
   - Empty state styling
   - Responsive horizontal scroll

Conventions: camelCase JS, kebab-case CSS with "guest-" prefix, const by
default, template literals, arrow functions. Use CSS variables from global.css.
```

---

### Commit 2: Add guest form with validation

**What to build:**
- A modal form for registering a new guest.
- Fields: name, email, phone, NID, address (textarea).
- Validation: name min 2 chars, email must contain "@" and ".", phone min 8 chars, NID required.
- Email uniqueness check.

**Acceptance criteria:**
- Form validates all required fields.
- Duplicate email is rejected.
- Successful submission saves and re-renders.

**Commit message:**
```
[guests] feat: add guest registration form with validation
```

**AI Prompt:**

```
CONTEXT: [paste the same context block from Commit 1]

CURRENT STATE: guests.html has page layout with header, search, and table.
guests.js has initGuests and renderGuestList.

TASK: Add guest registration form. Modify all three files:

1. pages/guests.html -- Add modal form (id="guest-form-modal"):
   - Name: text input (id="guest-input-name", required)
   - Email: email input (id="guest-input-email", required)
   - Phone: tel input (id="guest-input-phone", required)
   - NID: text input (id="guest-input-nid", required,
     placeholder="National ID or Passport")
   - Address: textarea (id="guest-input-address")
   - Submit (id="guest-btn-submit", type="submit")
   - Cancel (id="guest-btn-cancel", type="button")
   - Hidden id input (id="guest-input-id")
   - Form id="guest-form"
   - Title element (id="guest-form-title") defaulting to "Add Guest"

2. js/guests.js -- Add:
   - Event listeners for add button, cancel button, form submit
   - On submit: validate required fields, validate name >= 2 chars,
     email contains "@" and ".", phone >= 8 chars
   - Check email uniqueness against existing guests
   - Create guest with generateId("guest"), save, re-render, notify
   - resetGuestForm() to clear all inputs
   - validateEmail(email) helper

3. css/guests.css -- Add modal, form, textarea styles, show/hide class
```

---

### Commit 3: Edit guest functionality

**What to build:**
- Edit button opens form pre-filled with guest data.
- Email uniqueness excludes the guest being edited.
- Submitting updates the guest.

**Acceptance criteria:**
- All fields pre-fill correctly.
- Email uniqueness allows the guest's own email.
- id and createdAt are preserved.

**Commit message:**
```
[guests] feat: implement edit guest with pre-filled form
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: guests.js has form creation with validation and resetGuestForm.
Hidden input guest-input-id exists.

TASK: Add edit functionality to js/guests.js:

1. Event delegation on guest-table-body for ".guest-btn-edit" clicks.
2. Pre-fill all fields, set guest-input-id, change title to "Edit Guest".
3. Modify submit handler to update if guest-input-id has a value.
4. Email uniqueness check excludes the current guest's id.
5. resetGuestForm clears id and resets title.
```

---

### Commit 4: Delete guest with reservation check

**What to build:**
- Delete button with confirmation.
- Block deletion if guest has active reservations (status "confirmed" or "checked-in").
- Allow deletion if guest has only checked-out or cancelled reservations.

**Acceptance criteria:**
- Active reservations block deletion with count in error message.
- No active reservations allows deletion after confirmation.
- Guest list re-renders with search preserved.

**Commit message:**
```
[guests] feat: add delete guest with active reservation protection
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: guests.js has create and edit with event delegation.

TASK: Add delete to js/guests.js:

1. Event delegation on guest-table-body for ".guest-btn-delete" clicks.
2. Check for active reservations:
   - Read Storage.getAll(STORAGE_KEY_RESERVATIONS)
   - Filter where guestId matches AND status is "confirmed" or "checked-in"
   - If any, show error: "Cannot delete [name]. They have [count] active
     reservation(s)."
3. If no active reservations, confirm and delete.
4. Re-render with current search term.
```

---

### Commit 5: Search guests by name or email

**What to build:**
- Real-time search filtering as user types.
- Case-insensitive partial match on name and email.
- Search persists after add, edit, delete.

**Acceptance criteria:**
- Typing filters in real time.
- Count updates: "Showing X of Y guests".
- Clearing search restores full list.

**Commit message:**
```
[guests] feat: implement real-time guest search by name and email
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: guests.js has renderGuestList(searchTerm) that filters if
searchTerm is provided. Search input exists with id="guest-search".

TASK: Wire up search in js/guests.js:

1. Event listener on "guest-search" input event (every keystroke):
   call renderGuestList with current search value.
2. Verify renderGuestList uses toLowerCase and includes for matching.
3. Empty state shows "No guests match your search" when filtered to 0.
4. Add getCurrentSearchTerm() helper.
5. All calls to renderGuestList after add/edit/delete pass current search.
```

---

### Commit 6: Dashboard with room availability overview

**What to build:**
- The dashboard.html partial with statistics layout.
- The initDashboard function that computes stats from all storage keys.
- Room availability overview for today: total rooms, available today, reserved today.
- Use isRoomAvailable() to check each room against today's date.

**Acceptance criteria:**
- Room stats are correct based on current data.
- Available/reserved counts are computed using isRoomAvailable with today's date.
- If no rooms exist, all stats show 0.

**Commit message:**
```
[dashboard] feat: add dashboard with room availability overview
```

**AI Prompt:**

```
CONTEXT: This is a Hotel Reservation System built with HTML, CSS, and vanilla
JavaScript. Data is stored in browser localStorage. There is no backend.

Shared utilities:
- Storage, generateId, formatDate, getTodayString, isRoomAvailable,
  showNotification, validateRequired

Storage keys: "hrs_rooms", "hrs_reservations", "hrs_guests"

Key concept: Rooms do NOT have a status field. To determine if a room is
available today, use isRoomAvailable(room.id, today, tomorrow, reservations)
where today = getTodayString() and tomorrow is one day after today.

TASK: Create the dashboard. I need two files (CSS in guests.css):

1. pages/dashboard.html -- an HTML partial:
   - Page header with title "Dashboard"
   - Section "Room Availability" (id="dashboard-room-stats"):
     - Stat cards: Total Rooms (id="dashboard-stat-total-rooms"),
       Available Today (id="dashboard-stat-available"),
       Reserved Today (id="dashboard-stat-reserved")
   - Section placeholder for reservation stats (id="dashboard-res-stats")
   - Section placeholder for upcoming arrivals (id="dashboard-upcoming")

2. js/dashboard.js -- containing:
   - const STORAGE_KEY_ROOMS = "hrs_rooms"
   - const STORAGE_KEY_RESERVATIONS = "hrs_reservations"
   - const STORAGE_KEY_GUESTS = "hrs_guests"
   - function initDashboard() calls renderDashboard()
   - function renderDashboard():
     - Read all rooms, all reservations
     - const today = getTodayString()
     - Calculate tomorrow string
     - For each room, check isRoomAvailable(room.id, today, tomorrow,
       reservations) to determine if available today
     - Count available and reserved rooms
     - Update stat card elements

3. css/guests.css -- Add dashboard styles:
   - Stat cards grid (3 per row desktop, 1 mobile)
   - Card: white bg, shadow, rounded, padding, large number, label
   - Color accents: primary for total, success for available,
     danger for reserved
   - Section headings
   - Use CSS variables from global.css

CSS prefix "dashboard-" for dashboard elements. Organize guests.css with
clear section comments separating guest styles from dashboard styles.
```

---

### Commit 7: Reservation statistics and revenue

**What to build:**
- Reservation stats: total, confirmed, checked-in, checked-out, cancelled.
- Guest count.
- Total revenue from completed (checked-out) reservations.

**Acceptance criteria:**
- All counts are correct.
- Revenue is the sum of totalPrice where status is "checked-out".
- All stat cards match the visual style of room stats.

**Commit message:**
```
[dashboard] feat: add reservation stats, guest count, and revenue
```

**AI Prompt:**

```
CONTEXT: [paste the same context block from Commit 6]

CURRENT STATE: dashboard.html has room availability section and placeholders.
dashboard.js has renderDashboard computing room availability.

TASK: Add reservation and guest statistics:

1. pages/dashboard.html -- Fill dashboard-res-stats section:
   - "Reservation Overview" heading
   - Stat cards: Total Reservations (id="dashboard-stat-total-res"),
     Confirmed (id="dashboard-stat-confirmed"),
     Checked In (id="dashboard-stat-checkedin"),
     Checked Out (id="dashboard-stat-checkedout"),
     Cancelled (id="dashboard-stat-cancelled")
   - Separate row: Total Guests (id="dashboard-stat-total-guests"),
     Total Revenue (id="dashboard-stat-revenue")

2. js/dashboard.js -- Extend renderDashboard():
   - Count reservations by status
   - Sum totalPrice where status is "checked-out" for revenue
   - Read all guests and count
   - Format revenue with currency (e.g., "$1,240")
   - Update all elements

3. css/guests.css -- Stat card grid for reservation section,
   revenue card with distinct styling
```

---

### Commit 8: Upcoming arrivals and final polish

**What to build:**
- "Upcoming Arrivals" section showing reservations with check-in within the next 7 days, status "confirmed".
- Each entry shows guest name, room number, check-in date, check-out date, nights.
- Guest names and room numbers looked up from storage.
- Final cleanup for both guests.js and dashboard.js.

**Acceptance criteria:**
- Upcoming arrivals shows only "confirmed" reservations with check-in between today and 7 days from now.
- Guest names and room numbers resolve (or show "Unknown").
- If no upcoming arrivals, show "No upcoming arrivals".
- All functions have comments. No console errors.

**Commit message:**
```
[dashboard] feat: add upcoming arrivals and final code polish
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: dashboard.js computes room availability, reservation stats,
guest count, and revenue. dashboard-upcoming section is a placeholder.

TASK: Add upcoming arrivals and polish:

1. pages/dashboard.html -- Fill dashboard-upcoming section:
   - "Upcoming Arrivals (Next 7 Days)" heading
   - Table or card list (id="dashboard-upcoming-list")
   - Columns: Guest, Room, Check-in, Check-out, Nights
   - Empty state for no upcoming arrivals

2. js/dashboard.js -- Add to renderDashboard():
   - Get today string and calculate 7-days-from-now string
   - Filter reservations: status "confirmed" AND checkIn >= today
     AND checkIn <= sevenDaysFromNow
   - Sort by checkIn ascending (earliest first)
   - For each, look up guest name and room number
   - Use "Unknown Guest" / "Unknown Room" for missing refs
   - Format dates with formatDate
   - Render into dashboard-upcoming-list
   - Show empty state if none

3. Final polish for both guests.js and dashboard.js:
   - Comment above every function
   - No global variable leaks
   - All IDs use "guest-" or "dashboard-" prefix
   - Empty states work for 0 data
   - Guest search still works

4. css/guests.css -- Upcoming arrivals table styles, consistent spacing,
   responsive layout, hover/focus states on all interactive elements
```

---

## Git Commands for Each Commit

```bash
# Guest commits (1-5):
git add js/guests.js css/guests.css pages/guests.html

# Dashboard commits (6-8), also add dashboard files:
git add js/guests.js js/dashboard.js css/guests.css pages/guests.html pages/dashboard.html

git commit -m "<commit message>"
```

After all 8 commits, push once:

```bash
git push origin feature/guest-dashboard
```

---

## Testing Checklist (Stage 3)

### Guest Management Functional Tests

- [ ] Guest list renders correctly with 0, 1, and 10+ guests
- [ ] Registration date displays formatted
- [ ] Add Guest form validates name >= 2 characters
- [ ] Form validates email contains "@" and "."
- [ ] Form validates phone >= 8 characters
- [ ] Form validates NID is not empty
- [ ] Form rejects duplicate email
- [ ] Successful submission saves to localStorage
- [ ] Edit opens form pre-filled correctly
- [ ] Edit preserves id and createdAt
- [ ] Email uniqueness allows the guest's own email when editing
- [ ] Delete blocked if guest has active reservations (confirmed/checked-in)
- [ ] Delete succeeds if only checked-out/cancelled reservations
- [ ] Delete succeeds if no reservations at all
- [ ] Search filters by name (case-insensitive partial)
- [ ] Search filters by email (case-insensitive partial)
- [ ] Clearing search restores full list
- [ ] Count updates: "Showing X of Y guests"
- [ ] Search persists after add/edit/delete

### Dashboard Functional Tests

- [ ] Total rooms count is correct
- [ ] Available today uses isRoomAvailable with today's date
- [ ] Reserved today = total rooms - available today
- [ ] Total reservation count is correct
- [ ] Count per status (confirmed, checked-in, checked-out, cancelled) is correct
- [ ] Total guests count is correct
- [ ] Revenue = sum of totalPrice for checked-out reservations only
- [ ] Upcoming arrivals shows confirmed reservations with check-in in next 7 days
- [ ] Upcoming arrivals sorted by check-in date ascending
- [ ] Guest names resolve in upcoming arrivals
- [ ] Room numbers resolve in upcoming arrivals
- [ ] "Unknown" shows for missing guest/room references
- [ ] All stats show 0 when storage is empty (no errors)
- [ ] "No upcoming arrivals" shows when none match

### Code Quality

- [ ] No JavaScript errors in console
- [ ] No var declarations
- [ ] Template literals for strings
- [ ] All data through Storage object
- [ ] All IDs through generateId
- [ ] Availability via isRoomAvailable (dashboard)
- [ ] CSS colors use custom properties
- [ ] CSS classes use "guest-" or "dashboard-" prefix
- [ ] HTML IDs use "guest-" or "dashboard-" prefix
- [ ] Labels with for attributes on all inputs
- [ ] Buttons have type attributes
- [ ] Tables have thead and tbody
- [ ] All functions have comments
- [ ] 8 commits with correct message format

---

## Cross-Review Assignment

After completing your work, you review **Member B's branch** (feature/reservation-system).

### How to Review

```bash
git fetch origin
git checkout feature/reservation-system
```

Seed test rooms and guests using the console script from Member B's doc, then test.

### What to Check

- Naming conventions followed? (camelCase JS, "res-" prefix CSS)
- Correct storage keys? ("hrs_reservations", reads "hrs_rooms" and "hrs_guests")
- Reservation data model matches spec?
- Availability search uses isRoomAvailable correctly?
- Available rooms shown only for selected date range?
- Price calculation correct (nights * pricePerNight)?
- Check-in and check-out do NOT modify room data? (rooms have no status)
- Cancel frees up the date range?
- Action buttons match status rules?
- Console errors?
- Hardcoded colors?

Report issues to Member B. Do not fix their code.

```bash
git checkout feature/guest-dashboard
```

---

## Important Notes for Your Module

1. **Two modules, one branch.** Guest management and dashboard are separate features sharing one CSS file and one branch. Keep CSS organized with section comments:
   ```css
   /* =====================
      GUEST MANAGEMENT STYLES
      ===================== */

   /* ... */

   /* =====================
      DASHBOARD STYLES
      ===================== */

   /* ... */
   ```

2. **Dashboard uses date-based availability.** To count available rooms today, loop through all rooms and call isRoomAvailable(room.id, today, tomorrow, reservations) for each. Do NOT look for a room.status field -- it does not exist.

3. **Guest deletion checks reservations.** Read hrs_reservations and check for active ones referencing the guest. This is a cross-module read.

4. **Your branch merges second.** After rooms but before reservations. Room stats on the dashboard will work immediately. Reservation stats will show 0 until the reservation branch merges. This is expected.

5. **Revenue counts only checked-out reservations.** Do not include confirmed, checked-in, or cancelled reservations in revenue totals.

6. **Upcoming arrivals = confirmed + check-in within 7 days.** Do not include checked-in (already arrived), checked-out, or cancelled reservations.

---

## Quick Reference

| Item | Value |
|---|---|
| Your branch | feature/guest-dashboard |
| Your files | js/guests.js, js/dashboard.js, css/guests.css, pages/guests.html, pages/dashboard.html |
| Storage key (guests) | "hrs_guests" |
| Also reads | "hrs_rooms", "hrs_reservations" |
| ID prefix | "guest" |
| CSS class prefix | "guest-" and "dashboard-" |
| HTML ID prefix | "guest-" and "dashboard-" |
| Minimum commits | 5 |
| Target commits | 8 |
| Review target | Member B (feature/reservation-system) |
| Merge order | Second |

---

End of Member C Task Document.
