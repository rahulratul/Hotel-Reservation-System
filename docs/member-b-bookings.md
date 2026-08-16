# Member B -- Reservation System (Task Document)

You are Member B. You own the Reservation System module. Your work happens on the **feature/reservation-system** branch. You are responsible for the core feature of the entire project: allowing users to search for available rooms by date, make reservations, manage existing reservations, and handle check-in and check-out.

This is the most important module. The reservation workflow is: select desired dates, see which rooms are available for that period, pick a room, select a guest, and confirm the reservation.

Your module reads data from both the Rooms module (Member A) and the Guests module (Member C). Since they are working on their own branches, you will use seeded test data during development.

---

## Your Files

You may only modify these files:

| File | Purpose |
|---|---|
| js/reservations.js | All reservation system logic |
| css/reservations.css | All reservation-specific styles |
| pages/reservations.html | Reservation page HTML partial |

Do not modify index.html, global.css, storage.js, utils.js, app.js, or any file belonging to another member.

---

## Shared Resources Available to You

These are already set up in the main branch from Stage 1.

### Storage API (storage.js)

```javascript
// Reservation operations
Storage.getAll("hrs_reservations")             // returns array of all reservations
Storage.getById("hrs_reservations", id)        // returns one reservation or null
Storage.save("hrs_reservations", resObj)       // creates or updates a reservation
Storage.remove("hrs_reservations", id)         // deletes a reservation by id

// Reading room data (created by Member A)
Storage.getAll("hrs_rooms")                    // returns array of all rooms
Storage.getById("hrs_rooms", roomId)           // returns one room or null

// Reading guest data (created by Member C)
Storage.getAll("hrs_guests")                   // returns array of all guests
Storage.getById("hrs_guests", guestId)         // returns one guest or null
```

### Utility Functions (utils.js)

```javascript
generateId("res")                              // returns "res-lxyz12abc"
formatDate("2026-08-20")                       // returns "Aug 20, 2026"
calculateNights("2026-08-20", "2026-08-23")    // returns 3
getTodayString()                               // returns "2026-08-15"
showNotification("Reservation created", "success")
validateRequired([{ value: val, name: "Check-in" }])

// THE KEY FUNCTION -- checks date-based availability
isRoomAvailable(roomId, checkIn, checkOut, reservations, excludeReservationId)
// Returns true if room has no overlapping active reservation for the date range
// Active means status is "confirmed" or "checked-in"
// excludeReservationId: pass current reservation id when editing to exclude itself
```

### Storage Keys

```javascript
const STORAGE_KEY_RESERVATIONS = "hrs_reservations";
const STORAGE_KEY_ROOMS = "hrs_rooms";
const STORAGE_KEY_GUESTS = "hrs_guests";
```

### Reservation Data Model

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

Field rules:
- id: generated with generateId("res")
- guestId: must reference an existing guest
- roomId: must reference an existing room
- checkIn: YYYY-MM-DD format
- checkOut: YYYY-MM-DD format, must be after checkIn
- nights: calculated with calculateNights(checkIn, checkOut)
- totalPrice: calculated as nights * room.pricePerNight
- status: one of "confirmed", "checked-in", "checked-out", "cancelled"
- createdAt: ISO 8601 string

### Room Data Model (for reference, owned by Member A)

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

Important: Rooms do NOT have a status field. You determine availability using isRoomAvailable(). Do NOT try to set room.status anywhere in your code.

### Guest Data Model (for reference, owned by Member C)

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

---

## Setting Up Test Data

You need rooms and guests in the browser to develop your features. Open the browser console and run this before starting:

```javascript
// Seed test rooms
const testRooms = [
  { id: "room-t1", roomNumber: "101", type: "single", pricePerNight: 80, capacity: 1, amenities: ["wifi", "tv"], floor: 1, description: "Cozy single room", createdAt: new Date().toISOString() },
  { id: "room-t2", roomNumber: "201", type: "double", pricePerNight: 120, capacity: 2, amenities: ["wifi", "tv", "ac"], floor: 2, description: "Spacious double room", createdAt: new Date().toISOString() },
  { id: "room-t3", roomNumber: "301", type: "suite", pricePerNight: 250, capacity: 3, amenities: ["wifi", "tv", "ac", "minibar", "balcony"], floor: 3, description: "Premium suite with balcony", createdAt: new Date().toISOString() },
  { id: "room-t4", roomNumber: "102", type: "single", pricePerNight: 80, capacity: 1, amenities: ["wifi"], floor: 1, description: "Economy single room", createdAt: new Date().toISOString() },
  { id: "room-t5", roomNumber: "202", type: "deluxe", pricePerNight: 300, capacity: 4, amenities: ["wifi", "tv", "ac", "minibar", "balcony", "safe"], floor: 2, description: "Luxury deluxe room", createdAt: new Date().toISOString() }
];
localStorage.setItem("hrs_rooms", JSON.stringify(testRooms));

// Seed test guests
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
git checkout feature/reservation-system
```

Verify the project works by opening index.html in a browser (use Live Server or python3 -m http.server 8000).

---

## Feature Breakdown and Commit Plan

Your work is divided into 7 commits. Follow this order exactly.

---

### Commit 1: Reservation list page with table layout

**What to build:**
- The reservations.html partial with the page structure: a header with title and "New Reservation" button, a filter bar, and a table to display reservations.
- The initReservations function that reads all reservations and renders them in a table.
- Each row shows: guest name (looked up), room number and type (looked up), check-in date, check-out date, nights, total price, status badge, and action buttons.
- Status badges: blue for confirmed, green for checked-in, gray for checked-out, red for cancelled.

**Acceptance criteria:**
- Navigating to Reservations page shows "No reservations found" if storage is empty.
- Reservations in localStorage render with guest names and room numbers resolved.
- "Unknown Guest" or "Unknown Room" displays if a referenced record is missing.

**Commit message:**
```
[reservations] feat: add reservation list page with table layout and status badges
```

**AI Prompt:**

```
CONTEXT: This is a Hotel Reservation System built with HTML, CSS, and vanilla
JavaScript. Data is stored in browser localStorage. There is no backend.

The project has shared utilities already set up:
- Storage object (storage.js): getAll(key), getById(key, id), save(key, item),
  remove(key, id)
- utils.js: generateId(prefix), formatDate(dateString), calculateNights(checkIn,
  checkOut), getTodayString(), isRoomAvailable(roomId, checkIn, checkOut,
  reservations, excludeResId), showNotification(message, type),
  validateRequired(fields)
- app.js loads HTML partials from pages/ into a div with id="content-area"

Storage keys:
- Reservations: "hrs_reservations"
- Rooms: "hrs_rooms" (for looking up room details)
- Guests: "hrs_guests" (for looking up guest name)

Key concept: Rooms do NOT have a status field. Availability is determined
dynamically using isRoomAvailable() which checks overlapping active reservations.

Reservation data model:
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
status values: "confirmed", "checked-in", "checked-out", "cancelled"

TASK: Create the reservation list page. I need three files:

1. pages/reservations.html -- an HTML partial (no html/head/body tags):
   - Page header with title "Reservations" and "New Reservation" button
     (id="res-btn-add", type="button")
   - Filter bar with status dropdown (id="res-filter-status") with options:
     All, Confirmed, Checked In, Checked Out, Cancelled
   - Reservation count display (id="res-count")
   - Table (id="res-table") with thead: Guest, Room, Type, Check-in,
     Check-out, Nights, Total, Status, Actions
   - Tbody (id="res-table-body")
   - Empty state div (id="res-empty")

2. js/reservations.js -- containing:
   - const STORAGE_KEY_RESERVATIONS = "hrs_reservations"
   - const STORAGE_KEY_ROOMS = "hrs_rooms"
   - const STORAGE_KEY_GUESTS = "hrs_guests"
   - function initReservations() called on page load
   - function renderReservationList(filters) that:
     - Reads all reservations, filters by status if specified
     - Looks up guest name and room details for each reservation
     - Shows "Unknown Guest" / "Unknown Room" if not found
     - Formats dates with formatDate
     - Renders rows with data-res-id attribute
     - Status badges: blue confirmed, green checked-in, gray checked-out,
       red cancelled
     - Action buttons vary by status (details in later commits)
     - Updates count display
     - Shows empty state if no results

3. css/reservations.css -- containing:
   - Table styles (striped rows, hover, global.css variables)
   - Status badge colors
   - Page header layout
   - Filter bar layout
   - Empty state styling
   - Action buttons in table cells
   - Responsive: horizontal scroll on small screens

Conventions: camelCase JS, kebab-case CSS with "res-" prefix, const by default,
template literals, arrow functions. Use CSS variables from global.css.
```

---

### Commit 2: Availability search and reservation form

**What to build:**
- This is the signature feature of the reservation system.
- The workflow: user clicks "New Reservation", picks check-in and check-out dates, clicks "Search Available Rooms". The system uses isRoomAvailable() to find rooms with no overlapping active reservations, and displays them as selectable options.
- The user then selects a room and a guest, sees the auto-calculated price, and submits.

**Acceptance criteria:**
- Clicking "New Reservation" opens the form with date inputs.
- After selecting dates and clicking search, only rooms available for that period appear.
- If no rooms are available, a message says "No rooms available for these dates".
- Selecting a room shows its price per night and calculates total price.
- Guest dropdown lists all registered guests.
- Submitting saves the reservation with status "confirmed".

**Commit message:**
```
[reservations] feat: add availability search and reservation creation form
```

**AI Prompt:**

```
CONTEXT: [paste the same context block from Commit 1]

CURRENT STATE: reservations.html has page layout with header, filter bar, and
table. reservations.js has initReservations and renderReservationList.

TASK: Add the availability search and reservation form. This is a two-step
form: first search for available rooms, then fill in the reservation details.

1. pages/reservations.html -- Add a modal form (id="res-form-modal"):
   Step 1 - Date Selection:
   - Check-in: date input (id="res-input-checkin", min set to today)
   - Check-out: date input (id="res-input-checkout")
   - Search button (id="res-btn-search", type="button") labeled
     "Search Available Rooms"
   - Available rooms container (id="res-available-rooms") where results show

   Step 2 - Reservation Details (shown after a room is selected):
   - Selected room display (id="res-selected-room") showing room details
   - Guest: select dropdown (id="res-input-guest")
   - Price summary: nights count, price per night, total price
     (id="res-price-summary")
   - Submit button (id="res-btn-submit", type="submit")
   - Cancel button (id="res-btn-cancel", type="button")
   - Hidden inputs: room id (id="res-input-room-id"),
     reservation id (id="res-input-id") for edit mode
   - Form has id="res-form"
   - Modal title (id="res-form-title") defaulting to "New Reservation"

2. js/reservations.js -- Add:
   - function searchAvailableRooms():
     - Read check-in and check-out values
     - Validate both are filled, checkout > checkin
     - Read all rooms from Storage.getAll(STORAGE_KEY_ROOMS)
     - Read all reservations from Storage.getAll(STORAGE_KEY_RESERVATIONS)
     - For each room, call isRoomAvailable(room.id, checkIn, checkOut,
       reservations) -- if editing, pass excludeReservationId
     - Render available rooms as selectable cards in res-available-rooms
     - Each card shows: room number, type, price, capacity, amenities
     - Each card has a "Select" button with data-room-id
     - If no rooms available, show message
   - function selectRoom(roomId):
     - Set res-input-room-id to roomId
     - Display selected room details in res-selected-room
     - Calculate and show price: nights * pricePerNight
     - Show step 2 (guest dropdown + submit)
   - function populateGuestDropdown():
     - Read all guests, populate res-input-guest
   - Event listeners:
     - res-btn-add: show modal, set min date on checkin to today
     - res-btn-search: call searchAvailableRooms
     - Event delegation on res-available-rooms for Select buttons
     - res-btn-cancel: hide and reset
     - res-form submit: validate, create reservation with generateId("res"),
       set nights with calculateNights, set totalPrice, status "confirmed",
       save, re-render list, show notification, hide form
   - function resetReservationForm()

3. css/reservations.css -- Add:
   - Modal overlay styles
   - Two-step form layout (step 1 visible first, step 2 after room selection)
   - Available room cards (smaller cards in a grid, selectable with hover)
   - Selected room highlight style
   - Price summary styling (clear breakdown: X nights * $Y = $Z)
   - Date input and search button in a row layout

Do NOT modify room status anywhere. Rooms have no status field.
Use isRoomAvailable from utils.js for all availability checks.
```

---

### Commit 3: Edit reservation with re-validation

**What to build:**
- Clicking Edit on a reservation row opens the form pre-filled with that reservation's data.
- The date fields are pre-filled. The availability search re-runs with the current reservation excluded (so the currently booked room still appears as available).
- The guest dropdown pre-selects the current guest.
- Submitting updates the existing reservation.

**Acceptance criteria:**
- Clicking Edit opens the form with dates pre-filled.
- The availability search runs automatically showing the current room as available.
- Changing dates re-runs the search with updated availability.
- The guest dropdown has the correct guest pre-selected.
- Price recalculates if dates or room change.
- Submitting updates the reservation (id and createdAt unchanged).

**Commit message:**
```
[reservations] feat: implement edit reservation with availability re-validation
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: reservations.js has list rendering, availability search,
room selection, guest dropdown, and creation form. The form has hidden inputs
res-input-id and res-input-room-id.

TASK: Add edit functionality to js/reservations.js:

1. Add event delegation on res-table-body for clicks on ".res-btn-edit".

2. When Edit is clicked:
   - Get reservation id from row's data-res-id
   - Fetch reservation from storage
   - Set res-input-id to the reservation's id
   - Pre-fill check-in and check-out dates
   - Run searchAvailableRooms() but pass the reservation's id as
     excludeReservationId to isRoomAvailable so the current room
     shows as available
   - After search results render, auto-select the current room
   - Populate guest dropdown and pre-select the reservation's guestId
   - Show price summary with current values
   - Change modal title to "Edit Reservation"
   - Show the form modal

3. Modify searchAvailableRooms():
   - Accept optional excludeReservationId parameter
   - Pass it to isRoomAvailable calls
   - Read excludeReservationId from res-input-id if not passed directly

4. Modify form submit handler:
   - If res-input-id has a value, update instead of create
   - Keep original id and createdAt
   - Show "Reservation updated successfully"

5. Modify resetReservationForm():
   - Clear res-input-id and res-input-room-id
   - Reset title to "New Reservation"
   - Clear available rooms display and step 2

Only allow editing for reservations with status "confirmed". Disable edit
for other statuses.
```

---

### Commit 4: Cancel reservation

**What to build:**
- A Cancel button on reservation rows with status "confirmed" or "checked-in".
- Cancelling sets the reservation status to "cancelled".
- No room status changes needed (rooms have no status field).
- Cancelled reservations free up the room for that date range (since isRoomAvailable ignores cancelled reservations).

**Acceptance criteria:**
- Cancel button visible only on confirmed and checked-in reservations.
- Clicking Cancel shows a confirmation dialog.
- After cancelling, status changes to "cancelled" in storage.
- The cancelled date range is now available for new reservations (verify by searching).
- Cancelled reservations show no action buttons.

**Commit message:**
```
[reservations] feat: add cancel reservation functionality
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: reservations.js has list, create, and edit functionality.

TASK: Add cancel functionality to js/reservations.js:

1. Add event delegation on res-table-body for clicks on ".res-btn-cancel-action".

2. When Cancel is clicked:
   - Get reservation from storage
   - If status is "checked-out" or "cancelled", show error and return
   - Show window.confirm("Are you sure you want to cancel this reservation?")
   - If confirmed:
     - Set reservation.status to "cancelled"
     - Storage.save(STORAGE_KEY_RESERVATIONS, reservation)
     - Re-render list with current filters
     - Show "Reservation cancelled successfully"

3. Modify renderReservationList:
   - Show Cancel button only for "confirmed" and "checked-in" reservations
   - Cancelled rows should have a muted/faded visual style

Note: Do NOT modify any room data. Rooms have no status field. Cancelling
a reservation automatically makes that date range available because
isRoomAvailable ignores cancelled reservations.
```

---

### Commit 5: Check-in action

**What to build:**
- A Check-in button on reservations with status "confirmed".
- Check-in changes reservation status to "checked-in".
- No room status changes (rooms have no status field in a reservation system).

**Acceptance criteria:**
- Check-in button appears only on "confirmed" reservations.
- Clicking Check-in changes status to "checked-in".
- The reservation list re-renders with the updated status.
- The room remains bookable for other non-overlapping dates (isRoomAvailable handles this).

**Commit message:**
```
[reservations] feat: implement check-in action
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: reservations.js has list, create, edit, and cancel. Action
buttons render conditionally by status.

TASK: Add check-in functionality to js/reservations.js:

1. Add event delegation on res-table-body for clicks on ".res-btn-checkin".

2. When Check-in is clicked:
   - Get reservation from storage
   - Verify status is "confirmed"
   - Look up the room for display purposes:
     const room = Storage.getById(STORAGE_KEY_ROOMS, reservation.roomId)
     const roomDisplay = room ? room.roomNumber : "Unknown"
   - Set reservation.status to "checked-in"
   - Storage.save(STORAGE_KEY_RESERVATIONS, reservation)
   - Re-render list with current filters
   - Show "Guest checked in to Room [roomDisplay]"

3. Modify renderReservationList:
   - Show Check-in button only for "confirmed" reservations
   - Show Check-out button only for "checked-in" reservations

Note: Do NOT touch room data. There is no room.status to update.
The reservation status alone tracks the lifecycle.
```

---

### Commit 6: Check-out action

**What to build:**
- A Check-out button on reservations with status "checked-in".
- Check-out changes reservation status to "checked-out".
- The date range is now fully released (isRoomAvailable ignores checked-out reservations).

**Acceptance criteria:**
- Check-out button appears only on "checked-in" reservations.
- Clicking Check-out changes status to "checked-out".
- After check-out, the room is available for those dates again.
- No action buttons remain for checked-out reservations.

**Commit message:**
```
[reservations] feat: implement check-out action
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: reservations.js has list, create, edit, cancel, and check-in.

TASK: Add check-out functionality to js/reservations.js:

1. Add event delegation on res-table-body for clicks on ".res-btn-checkout".

2. When Check-out is clicked:
   - Get reservation from storage
   - Verify status is "checked-in"
   - Look up room for display
   - Set reservation.status to "checked-out"
   - Storage.save(STORAGE_KEY_RESERVATIONS, reservation)
   - Re-render list with current filters
   - Show "Guest checked out from Room [roomDisplay]"

3. Final action button rules by status:
   - "confirmed": Edit, Check-in, Cancel
   - "checked-in": Check-out, Cancel
   - "checked-out": (none)
   - "cancelled": (none)

Do NOT modify room data. Rooms have no status field.
```

---

### Commit 7: Status filter and final polish

**What to build:**
- The status filter dropdown filters the reservation table.
- Final cleanup: comments, formatting, edge cases.

**Acceptance criteria:**
- Selecting "Confirmed" shows only confirmed reservations.
- "All" shows everything.
- Filter persists after create, edit, cancel, check-in, check-out.
- Count display updates: "Showing X of Y reservations".
- All functions have comments.
- No console errors.

**Commit message:**
```
[reservations] feat: add status filter and final code polish
```

**AI Prompt:**

```
CONTEXT: [paste the same context block]

CURRENT STATE: reservations.js has full functionality: list, availability search,
create, edit, cancel, check-in, check-out. The filter bar has res-filter-status.

TASK: Add filtering and polish:

1. Modify renderReservationList(filters):
   - If filters.status is set and not "all", filter reservations
   - Default: show all

2. Add getCurrentFilters() that reads res-filter-status value.

3. Add event listener on res-filter-status change event.

4. Update all renderReservationList calls to pass getCurrentFilters().

5. Add count display (id="res-count"): "Showing X of Y reservations".

6. Code cleanup:
   - Comment above every function
   - No global variable leaks
   - All DOM queries use "res-" prefix
   - Handle edge cases: deleted guests/rooms show "Unknown" gracefully
   - Empty state shows when no reservations match filter
   - Verify the availability search works correctly when editing
     (excludeReservationId is passed properly)

7. css/reservations.css -- Final pass:
   - Hover/focus states on all buttons
   - Muted style for cancelled reservations
   - Available room cards in search results: clear hover and selected states
   - Price summary clearly formatted
   - Consistent spacing with global.css variables
```

---

## Git Commands for Each Commit

After completing the work for each commit:

```bash
git add js/reservations.js css/reservations.css pages/reservations.html
git commit -m "<commit message from above>"
```

After all 7 commits, push once:

```bash
git push origin feature/reservation-system
```

---

## Testing Checklist (Stage 3)

### Functional Tests

- [ ] Reservation list renders correctly with 0 reservations (empty state)
- [ ] Reservation list renders correctly with 1 reservation
- [ ] Reservation list renders correctly with 10+ reservations
- [ ] Guest names resolve correctly from hrs_guests
- [ ] Room numbers and types resolve correctly from hrs_rooms
- [ ] "Unknown Guest" / "Unknown Room" shows for missing references
- [ ] New Reservation form opens with date inputs
- [ ] Date inputs have min set to today
- [ ] Searching with valid dates shows available rooms
- [ ] Rooms with overlapping active reservations do NOT appear in results
- [ ] Rooms with only cancelled/checked-out reservations DO appear
- [ ] "No rooms available" message shows when all rooms are booked
- [ ] Selecting a room shows its details and calculates price
- [ ] Price calculation is correct (nights * pricePerNight)
- [ ] Guest dropdown populates with all guests
- [ ] Submitting with missing fields shows error
- [ ] Submitting with check-out before check-in shows error
- [ ] Successful creation saves to localStorage with status "confirmed"
- [ ] Edit opens form with dates pre-filled
- [ ] Edit runs availability search excluding the current reservation
- [ ] Current room appears in search results when editing
- [ ] Edit preserves id and createdAt
- [ ] Cancel changes status to "cancelled"
- [ ] After cancelling, the date range becomes available for new reservations
- [ ] Check-in changes status to "checked-in"
- [ ] Check-out changes status to "checked-out"
- [ ] Action buttons match status rules:
  - confirmed: Edit, Check-in, Cancel
  - checked-in: Check-out, Cancel
  - checked-out: none
  - cancelled: none
- [ ] Status filter works correctly
- [ ] Filter persists after all actions
- [ ] Count display updates with filter
- [ ] No room data is ever modified by this module

### Code Quality

- [ ] No JavaScript errors in browser console
- [ ] No var declarations
- [ ] All strings use template literals
- [ ] All data access through Storage object
- [ ] All IDs through generateId("res")
- [ ] All availability through isRoomAvailable from utils.js
- [ ] No direct room status modifications anywhere
- [ ] All CSS colors use custom properties
- [ ] All CSS classes use "res-" prefix
- [ ] All HTML IDs use "res-" prefix
- [ ] Every input has a label with for attribute
- [ ] Every button has a type attribute
- [ ] Table has thead and tbody
- [ ] All functions have comments
- [ ] Commit history has exactly 7 commits with correct message format

---

## Cross-Review Assignment

After completing your own work, you review **Member A's branch** (feature/room-catalog).

### How to Review

```bash
git fetch origin
git checkout feature/room-catalog
```

Open index.html in the browser and test the room catalog.

### What to Check

- Does the code follow naming conventions? (camelCase JS, kebab-case CSS with "room-" prefix)
- Is the correct storage key used? ("hrs_rooms")
- Does the room data model match the spec? (id, roomNumber, type, pricePerNight, capacity, amenities, floor, description, createdAt)
- Rooms should NOT have a status field
- Does the availability badge use isRoomAvailable correctly?
- Does deleting a room check for active reservations?
- Do all form validations work?
- Does the type filter work?
- Are there any console errors?
- Are there any hardcoded color values in CSS?

Report issues to Member A. Do not fix their code.

```bash
git checkout feature/reservation-system
```

---

## Important Notes for Your Module

1. **Never modify room data.** Unlike a hotel management system, this reservation system does not change room status on check-in/check-out. Rooms have no status field. The reservation status alone tracks the lifecycle. The isRoomAvailable function handles everything by checking reservation overlaps.

2. **Availability search is your signature feature.** The two-step form (search dates, then select room) is what makes this a reservation system rather than a generic booking form. Take care to make this flow smooth and intuitive.

3. **Graceful handling of missing data.** Always check for null when looking up guests or rooms. Display "Unknown Guest" / "Unknown Room" as fallbacks.

4. **Your module merges last.** In Stage 4, feature/reservation-system merges after rooms and guests. Your dropdowns and lookups should work immediately after merge.

5. **Do not store guest names or room numbers in the reservation.** Always look them up at render time. This avoids stale data.

---

## Quick Reference

| Item | Value |
|---|---|
| Your branch | feature/reservation-system |
| Your files | js/reservations.js, css/reservations.css, pages/reservations.html |
| Storage key | "hrs_reservations" |
| Also reads | "hrs_rooms", "hrs_guests" |
| ID prefix | "res" |
| CSS class prefix | "res-" |
| HTML ID prefix | "res-" |
| Minimum commits | 5 |
| Target commits | 7 |
| Review target | Member A (feature/room-catalog) |
| Merge order | Third (last) |

---

End of Member B Task Document.
