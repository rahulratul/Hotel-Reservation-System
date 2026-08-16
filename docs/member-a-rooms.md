# Member A -- Room Catalog (Task Document)

You are Member A and the team leader. You own the Room Catalog module. Your work happens on the **feature/room-catalog** branch. You are responsible for setting up and displaying the hotel's room inventory: adding rooms, editing details, deleting rooms, filtering by type, and showing each room's current availability status.

This module is a catalog, not a management panel. Rooms are set up once and then browsed by users to see what the hotel offers. The focus is on clean visual display and browsing, not heavy operational workflows. The reservation module (Member B) is where rooms actually get booked.

Before starting your own feature work, you must complete Stage 1 (Leader Setup) as described in hotel-reservation-system.md. Only after Stage 1 is pushed to main and all members have cloned the repository should you begin the work described in this document.

---

## Your Files

You may only modify these files:

| File | Purpose |
|---|---|
| js/rooms.js | All room catalog logic |
| css/rooms.css | All room-specific styles |
| pages/rooms.html | Room catalog HTML partial |

Do not modify index.html, global.css, storage.js, utils.js, app.js, or any file belonging to another member. If you need a shared utility added, add it yourself to utils.js on the main branch before branching, or coordinate with the team.

---

## Shared Resources Available to You

These are already set up in the main branch from Stage 1. You will use them in your code.

### Storage API (storage.js)

```javascript
Storage.getAll("hrs_rooms")          // returns array of all rooms
Storage.getById("hrs_rooms", id)     // returns one room or null
Storage.save("hrs_rooms", roomObj)   // creates or updates a room
Storage.remove("hrs_rooms", id)      // deletes a room by id
```

You also need to read reservations to check availability and deletion safety:

```javascript
Storage.getAll("hrs_reservations")   // returns array of all reservations
```

### Utility Functions (utils.js)

```javascript
generateId("room")                           // returns "room-lxyz12abc"
formatDate("2026-08-15T14:00:00.000Z")       // returns "Aug 15, 2026"
getTodayString()                             // returns "2026-08-15" (today's date)
showNotification("Room added", "success")    // shows toast (success/error/info)
validateRequired([{ value: val, name: "Room Number" }])  // returns { valid, message }

// Check if a room is available for a date range
isRoomAvailable(roomId, checkIn, checkOut, reservations, excludeReservationId)
// returns true if no overlapping active reservation exists
```

### Storage Keys

```javascript
const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";
```

### Room Data Model

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

Field rules:
- type: one of "single", "double", "suite", "deluxe"
- capacity: 1 for single, 2 for double, 3 for suite, 4 for deluxe
- amenities: array of strings from ["wifi", "tv", "ac", "minibar", "balcony", "safe"]
- roomNumber: string, must be unique across all rooms
- pricePerNight: positive number
- floor: positive integer
- description: short text, optional but recommended

Important: Rooms do NOT have a "status" field. Availability is determined dynamically by checking active reservations for overlapping dates using isRoomAvailable() from utils.js.

---

## Branch Setup

Before writing any code, set up your branch:

```bash
git clone <repo-url>
cd hotel-management
git checkout feature/room-catalog
```

Verify the project works by opening index.html in a browser (use Live Server or python3 -m http.server 8000). You should see the navigation shell with placeholder content.

---

## Setting Up Test Data

To test the availability display feature (Commit 5), you need some reservation data in the browser. Open the console and run this before working on that commit:

```javascript
// Seed test reservations
const testReservations = [
  { id: "res-t1", guestId: "guest-t1", roomId: "room-001", checkIn: getTodayString(), checkOut: "2026-08-20", nights: 5, totalPrice: 400, status: "checked-in", createdAt: new Date().toISOString() },
  { id: "res-t2", guestId: "guest-t2", roomId: "room-003", checkIn: "2026-08-18", checkOut: "2026-08-22", nights: 4, totalPrice: 1000, status: "confirmed", createdAt: new Date().toISOString() },
  { id: "res-t3", guestId: "guest-t1", roomId: "room-002", checkIn: "2026-08-10", checkOut: "2026-08-12", nights: 2, totalPrice: 240, status: "checked-out", createdAt: new Date().toISOString() }
];
localStorage.setItem("hrs_reservations", JSON.stringify(testReservations));
```

For Commits 1-4, you do not need seeded data since you are building the room CRUD yourself.

---

## Feature Breakdown and Commit Plan

Your work is divided into 6 commits. Follow this order exactly. Each commit builds on the previous one.

---

### Commit 1: Room catalog page with card layout

**What to build:**
- The rooms.html partial with the page structure: a header area with title and an "Add Room" button, a filter bar, and a container where room cards will render.
- The initRooms function in rooms.js that reads all rooms from storage and renders them as visual cards.
- Each card shows: room number, type badge, price per night, capacity, floor, amenity tags, and description.
- Basic CSS for the room cards, type badges, and page layout in rooms.css.

**Acceptance criteria:**
- When you navigate to the Rooms page, it shows "No rooms in catalog" if storage is empty.
- If you manually add a room to localStorage (via browser console), it renders as a card on page load.
- Type badges have different colors: one color per type (single, double, suite, deluxe).
- Cards display the room as a browsable catalog item, not an operational record.

**Commit message:**
```
[rooms] feat: add room catalog page with card layout and type badges
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

Storage key for rooms: "hrs_rooms"

Room data model:
{
  "id": "room-001",
  "roomNumber": "101",
  "type": "single",         // single, double, suite, deluxe
  "pricePerNight": 80,
  "capacity": 1,            // 1, 2, 3, or 4
  "amenities": ["wifi", "tv", "ac"],
  "floor": 1,
  "description": "A comfortable single room with city view",
  "createdAt": "2026-08-15T14:00:00.000Z"
}

Important: Rooms do NOT have a status field. Availability is date-based.

TASK: Create the room catalog page. I need three files:

1. pages/rooms.html -- an HTML partial (no html/head/body tags) containing:
   - A page header with the title "Room Catalog" and an "Add Room" button
     (id="room-btn-add", type="button")
   - A filter bar with a dropdown for type filtering
     (id="room-filter-type") with options: All, Single, Double, Suite, Deluxe
   - A room count display (id="room-count")
   - A container div (id="room-list") where room cards will be rendered by JS
   - An empty state div (id="room-empty") shown when no rooms exist

2. js/rooms.js -- containing:
   - const STORAGE_KEY_ROOMS = "hrs_rooms" at the top
   - const STORAGE_KEY_RESERVATIONS = "hrs_reservations"
   - function initRooms() that is called when the page loads
   - initRooms sets up event listeners and calls renderRoomCatalog()
   - function renderRoomCatalog(filters) that:
     - Reads all rooms from Storage.getAll(STORAGE_KEY_ROOMS)
     - If filters.type is set and not "all", filters by type
     - Renders each room as a visually rich card inside room-list
     - Each card shows: room number (prominent), type badge, price per night
       with "/night" label, capacity as "X guests", floor number, amenity
       pills, and description text
     - If no rooms, show empty state
     - Updates room count display
     - Each card has data-room-id attribute with the room's id
     - Each card has Edit and Delete buttons (classes: room-btn-edit, room-btn-delete)

3. css/rooms.css -- containing:
   - Card grid layout using CSS grid (responsive: 3 columns on desktop,
     2 on tablet, 1 on mobile)
   - Card styles with shadow, border-radius, padding using global.css variables
   - Room image placeholder area at top of card (solid color background
     based on room type, showing room number in large text)
   - Type badge styles: different background colors per type
     (use variations of primary, secondary, success, warning colors)
   - Price styling (large, bold, with "/night" in smaller text)
   - Amenity pill styles (small rounded labels, inline)
   - Capacity and floor displayed as icon-text pairs or small labels
   - Page header layout with title and button aligned
   - Filter bar layout
   - Empty state styling

Conventions: camelCase JS, kebab-case CSS with "room-" prefix, const by default,
template literals, arrow functions. Use CSS variables from global.css for all
colors, spacing, shadows, and border-radius. Do not hardcode any color values.
```

---

### Commit 2: Add room form with validation

**What to build:**
- A modal form for adding a new room to the catalog.
- Form fields: room number (text), type (dropdown), price per night (number), floor (number), amenities (checkboxes), description (textarea).
- Capacity is set automatically based on the selected type (single=1, double=2, suite=3, deluxe=4).
- Validation: room number required and unique, price must be positive, floor must be positive integer, type must be selected.

**Acceptance criteria:**
- Clicking "Add Room" shows the form.
- Submitting with empty required fields shows an error notification.
- Submitting with a duplicate room number shows an error.
- Selecting a type auto-sets the capacity value.
- Successful submission adds the room to localStorage and it appears in the catalog.

**Commit message:**
```
[rooms] feat: add room creation form with validation and auto-capacity
```

**AI Prompt:**

```
CONTEXT: [paste the same context block from Commit 1]

CURRENT STATE: rooms.html has a page layout with header, filter bar, and room-list
container. rooms.js has initRooms and renderRoomCatalog. rooms.css has card grid
and badge styles.

TASK: Add a room creation form. Modify the three files:

1. pages/rooms.html -- Add a modal form section (id="room-form-modal"):
   - Room Number: text input (id="room-input-number", required)
   - Type: select dropdown (id="room-input-type") with options: single, double,
     suite, deluxe
   - Capacity: read-only display (id="room-input-capacity") that auto-updates
     when type changes (single=1, double=2, suite=3, deluxe=4)
   - Price Per Night: number input (id="room-input-price", min=1)
   - Floor: number input (id="room-input-floor", min=1)
   - Amenities: checkboxes for wifi, tv, ac, minibar, balcony, safe
     (class="room-amenity-checkbox")
   - Description: textarea (id="room-input-description",
     placeholder="Brief description of the room")
   - Submit button (id="room-btn-submit", type="submit")
   - Cancel button (id="room-btn-cancel", type="button")
   - Hidden input for room id (id="room-input-id") for edit mode later
   - Form has id="room-form"
   - Modal title element (id="room-form-title") defaulting to "Add Room"

2. js/rooms.js -- Add:
   - A capacity map: const CAPACITY_MAP = { single: 1, double: 2, suite: 3, deluxe: 4 }
   - Event listener on room-input-type change to auto-set capacity display
   - Event listener on "room-btn-add" to show the form modal
   - Event listener on "room-btn-cancel" to hide and reset the form
   - Event listener on "room-form" submit event:
     - Collect all values
     - Validate with validateRequired for room number, type, price, floor
     - Check room number uniqueness
     - Collect checked amenities
     - Set capacity from CAPACITY_MAP based on selected type
     - Create room object with generateId("room"), createdAt
     - Save with Storage.save, re-render catalog, show notification, hide form
   - function resetRoomForm() to clear all inputs
   - function getCurrentFilters() to read the active filter

3. css/rooms.css -- Add:
   - Modal overlay styles (fixed position, semi-transparent background, centered)
   - Form layout (labels above inputs, consistent spacing)
   - Checkbox group layout for amenities (inline, wrapped)
   - Textarea styling
   - Capacity display (read-only, slightly muted style)
   - Show/hide class (.room-form-modal.active)

Use showNotification for all feedback. Use validateRequired for validation.
```

---

### Commit 3: Edit room functionality

**What to build:**
- Clicking the Edit button on a room card opens the form pre-filled with that room's data.
- The form switches to "edit mode" (the hidden room-input-id field stores the existing room id).
- On submission in edit mode, the existing room is updated in storage.
- The modal title changes to "Edit Room".

**Acceptance criteria:**
- Clicking Edit opens the form with all fields pre-filled including description.
- The type dropdown shows the correct type, and capacity updates accordingly.
- The correct amenity checkboxes are checked.
- Submitting updates the room in storage (id and createdAt unchanged).
- Canceling resets back to "Add Room" mode.

**Commit message:**
```
[rooms] feat: implement edit room with pre-filled form
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: rooms.js has initRooms, renderRoomCatalog, form creation logic,
resetRoomForm, getCurrentFilters, and CAPACITY_MAP. The form has a hidden input
"room-input-id".

TASK: Add edit functionality to js/rooms.js:

1. Add event delegation on the room-list container for clicks on ".room-btn-edit".

2. When Edit is clicked:
   - Get the room id from the card's data-room-id attribute
   - Fetch the room from Storage.getById(STORAGE_KEY_ROOMS, id)
   - Set room-input-id value to the room's id
   - Pre-fill: room number, type, price, floor, description
   - Set capacity display based on type
   - Check the correct amenity checkboxes
   - Change room-form-title text to "Edit Room"
   - Show the form modal

3. Modify the form submit handler:
   - If room-input-id has a value, update instead of create
   - Keep original id and createdAt
   - After save, show "Room updated successfully"

4. Modify resetRoomForm():
   - Clear room-input-id
   - Reset room-form-title to "Add Room"

Use event delegation for the edit button (listen on parent, check e.target).
```

---

### Commit 4: Delete room with reservation check

**What to build:**
- Clicking the Delete button shows a confirmation dialog.
- Before deleting, check if the room has any active reservations (status "confirmed" or "checked-in") in hrs_reservations.
- If active reservations exist, block deletion with an error message.
- If no active reservations, confirm and delete.

**Acceptance criteria:**
- Clicking Delete shows a confirmation prompt.
- If the room has active reservations, deletion is blocked with an error listing the count.
- If no active reservations, the room is removed from localStorage.
- The catalog re-renders after deletion with the current filter still applied.

**Commit message:**
```
[rooms] feat: add delete room with active reservation protection
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: rooms.js has full create and edit functionality with event
delegation on room-list.

TASK: Add delete functionality to js/rooms.js:

1. Add event delegation on room-list for clicks on ".room-btn-delete".

2. When Delete is clicked:
   - Get room id from the card's data-room-id attribute
   - Fetch the room (for the room number in messages)
   - Check for active reservations:
     - Read all reservations from Storage.getAll(STORAGE_KEY_RESERVATIONS)
     - Filter where reservation.roomId matches AND reservation.status is
       "confirmed" or "checked-in"
     - If any active reservations exist, show error notification:
       "Cannot delete Room [number]. It has [count] active reservation(s)."
       and return
   - If no active reservations, show window.confirm("Are you sure you want
     to remove Room [number] from the catalog?")
   - If confirmed:
     - Storage.remove(STORAGE_KEY_ROOMS, id)
     - Re-render catalog with current filters
     - Show "Room removed from catalog"
```

---

### Commit 5: Display current availability on room cards

**What to build:**
- Each room card shows whether the room is currently available or reserved.
- "Currently available" means no active reservation covers today's date.
- Use isRoomAvailable() from utils.js with today's date as both checkIn and a date one day later as checkOut to check single-day availability.
- Show a green "Available Now" badge or a red "Reserved" badge on each card.

**Acceptance criteria:**
- Rooms with no active reservation for today show a green "Available Now" badge.
- Rooms with an active reservation covering today show a red "Reserved" badge.
- If no reservations exist in storage at all, all rooms show "Available Now".
- Badge updates if you add or remove reservations from the console and refresh.

**Commit message:**
```
[rooms] feat: display real-time availability status on room cards
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: rooms.js has full CRUD (create, edit, delete with reservation check).
renderRoomCatalog renders each room as a card. The isRoomAvailable function is
available from utils.js.

TASK: Add availability display to room cards:

1. Modify renderRoomCatalog in js/rooms.js:
   - At the start, read all reservations:
     const reservations = Storage.getAll(STORAGE_KEY_RESERVATIONS)
   - Get today's date: const today = getTodayString()
   - Calculate tomorrow: compute a date string for one day after today
   - For each room, check availability:
     const available = isRoomAvailable(room.id, today, tomorrow, reservations)
   - Add an availability badge to each card:
     - If available: a badge with class "room-badge-available" showing
       "Available Now"
     - If not available: a badge with class "room-badge-reserved" showing
       "Reserved"
   - Position the badge prominently on the card (top-right corner or
     below the room number)

2. Also add an availability summary to the page header area:
   - Show "X of Y rooms available today" (id="room-availability-summary")

3. css/rooms.css -- Add:
   - .room-badge-available: green background (--color-success), white text,
     rounded, small padding
   - .room-badge-reserved: red background (--color-danger), white text,
     rounded, small padding
   - Position the badge in the top-right corner of the card (absolute
     positioning within the card)
   - Availability summary styling in the header area
```

---

### Commit 6: Filter by type and final polish

**What to build:**
- The type filter dropdown filters the catalog.
- Selecting "Single" shows only single rooms, "All" shows all rooms.
- Final cleanup: comments on all functions, consistent formatting, edge case handling.

**Acceptance criteria:**
- Type filter works correctly for all four types.
- "All" shows the full catalog.
- Room count and availability summary update when filter changes.
- After adding, editing, or deleting a room, the current filter persists.
- All functions have brief comments.
- No console errors.

**Commit message:**
```
[rooms] feat: add type filter and final code polish
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: rooms.js has full CRUD, availability badges on cards, and
availability summary. rooms.html has a type filter dropdown (room-filter-type).
getCurrentFilters() exists but may not be fully wired up.

TASK: Add filtering and final polish:

1. Verify renderRoomCatalog(filters) correctly filters by type:
   - If filters.type is set and not "all", show only matching rooms
   - Update room count display
   - Update availability summary (count available among filtered rooms)

2. Add event listener on "room-filter-type" change event to call
   renderRoomCatalog(getCurrentFilters()).

3. Update all calls to renderRoomCatalog (after add, edit, delete) to
   pass getCurrentFilters() so the filter persists.

4. Code cleanup:
   - Add a brief comment above every function
   - Verify no global variable leaks
   - Verify all DOM queries use "room-" prefix
   - Ensure empty state shows when all rooms are filtered out
   - Handle edge case: if isRoomAvailable is called but no reservations
     exist, it should return true (room is available)

5. css/rooms.css -- Final pass:
   - All hover/focus states on buttons and cards
   - Card hover effect (subtle shadow increase or slight lift)
   - Consistent spacing with global.css variables
   - Responsive check: cards reflow correctly on small screens
```

---

## Git Commands for Each Commit

After completing the work for each commit, run:

```bash
git add js/rooms.js css/rooms.css pages/rooms.html
git commit -m "<commit message from above>"
```

After all 6 commits are done, push your branch:

```bash
git push origin feature/room-catalog
```

Do not push after every commit. Push once when all 6 commits are complete and tested.

---

## Testing Checklist (Stage 3)

Run through this checklist before declaring your branch complete.

### Functional Tests

- [ ] Room catalog renders correctly with 0 rooms (empty state message visible)
- [ ] Room catalog renders correctly with 1 room
- [ ] Room catalog renders correctly with 10+ rooms (grid layout, no overflow)
- [ ] Add Room form opens when button is clicked
- [ ] Add Room form validates required fields (room number, type, price, floor)
- [ ] Add Room form rejects duplicate room numbers
- [ ] Selecting type auto-sets the capacity display
- [ ] Successful submission saves to localStorage (verify in dev tools)
- [ ] Success notification appears after adding
- [ ] Edit button opens form pre-filled with correct data including description
- [ ] Amenity checkboxes are correctly checked in edit mode
- [ ] Editing preserves id and createdAt
- [ ] Success notification appears after editing
- [ ] Delete shows confirmation dialog
- [ ] Deleting a room with active reservations is blocked with error
- [ ] Deleting a room with no active reservations succeeds
- [ ] Catalog re-renders after deletion
- [ ] Availability badge shows "Available Now" for rooms with no active reservation today
- [ ] Availability badge shows "Reserved" for rooms with an active reservation covering today
- [ ] Availability summary shows correct "X of Y rooms available today"
- [ ] Type filter shows only matching rooms
- [ ] "All" filter shows all rooms
- [ ] Room count updates with filter
- [ ] Availability summary updates with filter
- [ ] Filter persists after add, edit, or delete

### Code Quality

- [ ] No JavaScript errors in browser console
- [ ] No var declarations (only const and let)
- [ ] All strings use template literals
- [ ] All data access through Storage object
- [ ] All IDs through generateId
- [ ] All availability checks through isRoomAvailable from utils.js
- [ ] All CSS colors use custom properties from global.css
- [ ] All CSS classes use "room-" prefix
- [ ] All HTML IDs use "room-" prefix
- [ ] Every input has a label with for attribute
- [ ] Every button has a type attribute
- [ ] All functions have comments
- [ ] Commit history has exactly 6 commits with correct message format

---

## Cross-Review Assignment

After completing your own work, you review **Member C's branch** (feature/guest-dashboard).

### How to Review

```bash
git fetch origin
git checkout feature/guest-dashboard
```

Open index.html in the browser and test the guest and dashboard features.

### What to Check

- Does the code follow naming conventions? (camelCase JS, kebab-case CSS with "guest-" or "dashboard-" prefix)
- Are the correct storage keys used? ("hrs_guests" for guests, "hrs_rooms" and "hrs_reservations" and "hrs_guests" for dashboard)
- Does the guest data model match the spec? (id, name, email, phone, nid, address, createdAt)
- Do all form validations work?
- Does the dashboard calculate room availability using isRoomAvailable?
- Does the dashboard show upcoming arrivals for the next 7 days?
- Are there any console errors?
- Are there any hardcoded color values in CSS?
- Are there any global variable leaks?

Report issues to Member C through the group chat. Do not fix their code yourself.

After reviewing, switch back to your branch:

```bash
git checkout feature/room-catalog
```

---

## Leader Responsibilities During Stage 2

While working on your own features, you also need to:

1. Be available to answer questions from Member B and Member C about shared utilities (especially isRoomAvailable).
2. If a member needs a new utility function, add it to utils.js on main and have all members pull the update:
   ```bash
   git checkout main
   # add the utility
   git add js/utils.js
   git commit -m "[shared] feat: add [function name] to utils.js"
   git push origin main
   git checkout feature/room-catalog
   git merge main
   ```
3. Monitor that members are committing with the correct message format.
4. Remind members to not modify shared files or files owned by other members.

---

## Leader Responsibilities During Stage 4

You coordinate the merge process. Follow the merge order in hotel-reservation-system.md Section 11:

1. Merge your branch (feature/room-catalog) to main first.
2. Then merge feature/guest-dashboard.
3. Then merge feature/reservation-system.

After all merges, lead the integration testing and final polish work. Use the Stage 4 document (stage-4-merge-and-polish.md) for detailed instructions.

---

## Quick Reference

| Item | Value |
|---|---|
| Your branch | feature/room-catalog |
| Your files | js/rooms.js, css/rooms.css, pages/rooms.html |
| Storage key | "hrs_rooms" |
| Also reads | "hrs_reservations" (for availability checks and delete protection) |
| ID prefix | "room" |
| CSS class prefix | "room-" |
| HTML ID prefix | "room-" |
| Minimum commits | 5 |
| Target commits | 6 |
| Review target | Member C (feature/guest-dashboard) |

---

End of Member A Task Document.
