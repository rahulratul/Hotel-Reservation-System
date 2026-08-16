# Stage 4 -- Merge, Integration, and Final Polish

This document is for the team leader (Member A). It covers everything that happens after all three members have completed their feature branches and passed Stage 3 testing. Stage 4 has three phases: merging branches, integration testing and fixes, and final polish.

---

## Prerequisites

Before starting Stage 4, confirm the following:

- [ ] Member A has pushed feature/room-catalog with at least 5 commits
- [ ] Member B has pushed feature/reservation-system with at least 5 commits
- [ ] Member C has pushed feature/guest-dashboard with at least 5 commits
- [ ] Each member has completed their Stage 3 testing checklist
- [ ] Cross-reviews are done (A reviewed C, B reviewed A, C reviewed B)
- [ ] All reported issues from cross-reviews have been fixed

---

## Phase 1: Merging Branches

Merges happen one at a time in a specific order. This order is chosen based on dependencies: rooms have no dependencies, guests depend on nothing, reservations depend on both rooms and guests.

### Step 1: Merge Room Catalog

```bash
git checkout main
git pull origin main
git merge feature/room-catalog
```

If there are conflicts:
- Conflicts will likely be in placeholder files (js/rooms.js, css/rooms.css, pages/rooms.html) where Member A replaced the stub content. Accept Member A's version entirely.
- If global.css or index.html has conflicts, keep the original Stage 1 version.

After resolving any conflicts:
```bash
git add .
git commit -m "[shared] merge: integrate room catalog module"
git push origin main
```

**Verification after this merge:**
- Open the app in the browser
- Navigate to Rooms page
- Confirm room catalog works (add, edit, delete, filter by type)
- Confirm availability badges show on room cards (all should show "Available Now" since no reservations exist yet)
- Confirm Dashboard and other pages still load (placeholder or empty content is fine)

### Step 2: Merge Guest and Dashboard

```bash
git checkout main
git pull origin main
git merge feature/guest-dashboard
```

If there are conflicts:
- Likely in placeholder files (js/guests.js, js/dashboard.js, css/guests.css, pages/guests.html, pages/dashboard.html). Accept Member C's version.
- If global.css has conflicts, compare carefully and keep both sides' additions.

After resolving:
```bash
git add .
git commit -m "[shared] merge: integrate guest management and dashboard modules"
git push origin main
```

**Verification after this merge:**
- Navigate to Guests page -- confirm guest CRUD and search work
- Navigate to Dashboard -- confirm room availability stats display correctly using live room data
- All rooms should show as "Available Today" (no reservations merged yet)
- Reservation stats should show 0 (expected, reservation module not merged yet)
- Navigate to Rooms page -- confirm rooms still work
- Confirm no console errors on any page

### Step 3: Merge Reservation System

```bash
git checkout main
git pull origin main
git merge feature/reservation-system
```

If there are conflicts:
- Likely in placeholder files (js/reservations.js, css/reservations.css, pages/reservations.html). Accept Member B's version.
- If there are conflicts in rooms.js or guests.js, investigate -- Member B should not have modified those files. Keep the existing version from main.

After resolving:
```bash
git add .
git commit -m "[shared] merge: integrate reservation system module"
git push origin main
```

**Verification after this merge:**
- Navigate to Reservations page -- confirm list renders
- Click "New Reservation" -- guest dropdown should populate with real guests
- Select dates and search -- available rooms should show from the room catalog
- Navigate to Dashboard -- all stats should now show real data
- All four navigation links should work without errors

---

## Phase 2: Integration Testing

After all three branches are merged, run through this complete integration test flow. Keep the browser console open to watch for errors throughout.

### Test Flow 1: Full Reservation Lifecycle

```
1. Go to Guests page
2. Add a new guest: "Test User", test@test.com, 01700000000, NID 999, Dhaka
3. Confirm guest appears in the list

4. Go to Rooms page
5. Add a new room: Room 501, type "suite", price 200, floor 5,
   amenities: wifi, ac, description: "Test suite room"
6. Confirm room appears in catalog with "Available Now" badge

7. Go to Reservations page
8. Click "New Reservation"
9. Set check-in to tomorrow, check-out to 3 days from now
10. Click "Search Available Rooms"
11. Confirm Room 501 appears in the available rooms list
12. Select Room 501
13. Confirm price shows: 2 nights * $200 = $400
14. Select "Test User" from guest dropdown
15. Submit the reservation
16. Confirm reservation appears in list with status "confirmed"

17. Go to Rooms page
18. Confirm Room 501 still shows "Available Now" (check-in is tomorrow,
    not today, so room is available today)

19. Go to Dashboard
20. Confirm "Upcoming Arrivals" section shows the new reservation
21. Confirm reservation count increased

22. Go to Reservations page
23. Click "Check In" on the reservation
24. Confirm status changes to "checked-in"

25. Go to Rooms page
26. Confirm Room 501 now shows "Reserved" badge (because a checked-in
    reservation covers its dates)

27. Go to Reservations page
28. Click "Check Out" on the reservation
29. Confirm status changes to "checked-out"

30. Go to Rooms page
31. Confirm Room 501 shows "Available Now" again

32. Go to Dashboard
33. Confirm stats are accurate:
    - Room availability reflects current state
    - Reservation counts are correct
    - Revenue includes the checked-out reservation ($400)
    - Upcoming arrivals no longer shows the reservation (it is checked-out)
```

### Test Flow 2: Availability Search Validation

```
1. Add 3 rooms: Room 101 (single, $80), Room 201 (double, $120),
   Room 301 (suite, $250)
2. Add 2 guests: Guest A and Guest B

3. Create a reservation: Guest A in Room 201, Aug 20 to Aug 25
4. Confirm reservation saved as "confirmed"

5. Click "New Reservation"
6. Search for Aug 22 to Aug 24 (overlaps with existing reservation)
7. Confirm Room 201 does NOT appear in results (it is reserved)
8. Confirm Room 101 and Room 301 DO appear

9. Search for Aug 25 to Aug 28 (starts on checkout day, no overlap)
10. Confirm Room 201 DOES appear (check-out day is free)

11. Edit the first reservation (Guest A, Room 201)
12. Confirm Room 201 appears in search results (excluded from overlap check)
13. Change dates to Aug 20-22 and save
14. Search for Aug 23 to Aug 25
15. Confirm Room 201 now appears (dates no longer overlap)
```

### Test Flow 3: Deletion Protection

```
1. Add a guest: "Protected Guest"
2. Add a room: Room 601
3. Create a reservation for Protected Guest in Room 601 (confirmed)

4. Go to Guests page
5. Try to delete "Protected Guest"
6. Confirm deletion is blocked: "Cannot delete. They have 1 active reservation(s)."

7. Go to Rooms page
8. Try to delete Room 601
9. Confirm deletion is blocked: "Cannot delete. It has 1 active reservation(s)."

10. Go to Reservations page
11. Cancel the reservation
12. Confirm status changes to "cancelled"

13. Go to Guests page
14. Try to delete "Protected Guest" again
15. Confirm deletion succeeds (cancelled reservation is not active)

16. Go to Rooms page
17. Try to delete Room 601
18. Confirm deletion succeeds
```

### Test Flow 4: Edge Cases

```
1. Clear all localStorage (dev tools Application tab)
2. Go to Dashboard -- all stats show 0, no errors
3. Go to each page -- empty states show correctly
4. Add one guest, one room -- verify they appear
5. Go to Reservations, try "New Reservation"
6. Try searching with check-out before check-in -- validation error
7. Try submitting without selecting a guest -- validation error
8. Go to Guests page
9. Try adding a guest with duplicate email -- error
10. Try adding a guest with 1-character name -- error
11. Try adding a guest with 7-character phone -- error
```

### Record of Issues Found

Use this table to track integration issues. Fix them in Phase 3.

| # | Issue Description | Affected Files | Status |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

---

## Phase 3: Fixes and Final Polish

### 3.1 Fix Integration Issues

For each issue found in Phase 2, fix and commit:

```bash
git add <affected files>
git commit -m "[shared] fix: <description>"
```

### Common Integration Issues and Fixes

**Issue: Availability search shows no rooms or all rooms**
- Cause: isRoomAvailable is not being called correctly, or the reservation storage key has a typo.
- Fix: Verify reservations.js uses exactly "hrs_reservations" and rooms uses "hrs_rooms". Test isRoomAvailable manually in the console.

**Issue: Dashboard room availability counts are wrong**
- Cause: Dashboard is not using isRoomAvailable or is computing tomorrow's date incorrectly.
- Fix: Verify dashboard.js computes tomorrow as one day after getTodayString() and passes it as checkOut to isRoomAvailable.

**Issue: Guest/room dropdowns in reservation form are empty**
- Cause: The dropdown population reads from a storage key that does not match.
- Fix: Verify "hrs_rooms" and "hrs_guests" are used exactly.

**Issue: Upcoming arrivals shows wrong reservations**
- Cause: Date comparison logic is off, or status filter is not applied.
- Fix: Upcoming arrivals must filter: status === "confirmed" AND checkIn >= today AND checkIn <= sevenDaysFromNow.

**Issue: Revenue includes cancelled reservations**
- Cause: Revenue sum is not filtering by status === "checked-out".
- Fix: Only sum totalPrice where reservation.status === "checked-out".

**Issue: CSS inconsistencies between modules**
- Cause: Each member styled independently.
- Fix: Review all CSS files and align with global.css variables.

### 3.2 Add Seed Data Function

Create a seed data function for project demonstration.

**AI Prompt:**

```
CONTEXT: This is a Hotel Reservation System with localStorage.
Storage keys: "hrs_rooms", "hrs_reservations", "hrs_guests"
Storage API: Storage.save(key, item), Storage.getAll(key), Storage.clear(key)
Availability: isRoomAvailable(roomId, checkIn, checkOut, reservations)

Room model: { id, roomNumber, type, pricePerNight, capacity, amenities, floor, description, createdAt }
Guest model: { id, name, email, phone, nid, address, createdAt }
Reservation model: { id, guestId, roomId, checkIn, checkOut, nights, totalPrice, status, createdAt }

TASK: Add a seed data feature:

1. Create js/seed.js with function seedData():
   - Check if data exists (if hrs_rooms has items, show notification
     "Data already exists. Clear data first." and return)
   - Create 8 rooms:
     - 3 single (floor 1, price 80, capacity 1)
     - 2 double (floor 2, price 120, capacity 2)
     - 2 suite (floor 3, price 250, capacity 3)
     - 1 deluxe (floor 4, price 350, capacity 4)
     Each with amenities and description
   - Create 5 guests with realistic names and details
   - Create 6 reservations using relative dates (today, tomorrow, etc.):
     - 2 confirmed (future check-in dates, within next 7 days for
       upcoming arrivals demo)
     - 1 checked-in (check-in was yesterday, checkout in 3 days)
     - 2 checked-out (past dates)
     - 1 cancelled (past dates)
     Link to actual room and guest IDs created above.
     Calculate nights and totalPrice correctly.
   - Save everything with Storage.save
   - Show notification "Sample data loaded successfully"

2. Create function clearAllData():
   - Storage.clear for all three keys
   - Show notification "All data cleared"

3. Add script tag for js/seed.js in index.html (before app.js)

4. In pages/dashboard.html, add two buttons at the bottom:
   - "Load Sample Data" (id="dashboard-btn-seed", type="button")
     onclick calls seedData() then renderDashboard()
   - "Clear All Data" (id="dashboard-btn-clear", type="button")
     onclick calls clearAllData() then renderDashboard()

Use generateId() for all IDs. Use calculateNights() for nights.
Compute totalPrice as nights * pricePerNight.
```

**Commit:**
```bash
git add js/seed.js index.html pages/dashboard.html
git commit -m "[shared] feat: add seed data and clear data functions for demonstration"
```

### 3.3 Final CSS Polish

Review all pages for visual consistency:

- [ ] All pages use the same button sizes and padding
- [ ] All tables have the same row height and cell padding
- [ ] All modals have the same overlay opacity, border-radius, and shadow
- [ ] All form inputs have the same height, padding, and border style
- [ ] All badge styles (type badges, status badges, availability badges) are consistent in size
- [ ] All empty state messages are styled the same way
- [ ] All page headers (title + action button) are aligned the same way
- [ ] Notification toasts appear in the same position and animate the same way
- [ ] Navigation active state is visually clear
- [ ] The app looks correct at 1200px, 768px, and 480px widths

**AI Prompt for CSS polish:**

```
CONTEXT: This is a Hotel Reservation System with four CSS files:
- css/global.css (shared variables, reset, layout, component base)
- css/rooms.css (room catalog styles, "room-" prefix)
- css/reservations.css (reservation styles, "res-" prefix)
- css/guests.css (guest and dashboard styles, "guest-" and "dashboard-" prefix)

TASK: Review all four CSS files and fix visual inconsistencies:

1. Buttons: same padding, font-size, border-radius from global.css variables
2. Tables: same header background, row striping, cell padding, hover
3. Modals: same overlay background, card width, padding, shadow, radius
4. Form inputs: same height, padding, border color, focus ring
5. Badges: consistent size, padding, font-size, border-radius across
   room type badges, availability badges, and reservation status badges
6. Page headers: same layout (title left, button right, alignment)
7. Responsive breakpoints:
   - Below 768px: cards single column, tables scroll horizontally
   - Below 480px: sidebar collapses or stacks
8. Do NOT change color values -- they should use CSS variables already.
   Fix sizing, spacing, and layout only.
```

**Commit:**
```bash
git add css/global.css css/rooms.css css/reservations.css css/guests.css
git commit -m "[shared] style: fix cross-module CSS inconsistencies"
```

### 3.4 Update README.md

**AI Prompt:**

```
Update README.md for a Hotel Reservation System:

Title: Hotel Reservation System
Description: A browser-based hotel reservation system for browsing rooms,
making date-based reservations, managing guest registrations, and viewing
reservation statistics. Built as a group project with three contributors.

Sections:
1. Features -- grouped by module:
   - Room Catalog: browse rooms, add/edit/delete, type filter, live availability
   - Reservation System: date-based availability search, create/edit/cancel
     reservations, check-in, check-out, status filter
   - Guest Management: register, edit, delete with protection, search
   - Dashboard: room availability today, reservation stats, revenue,
     upcoming arrivals
2. Technology Stack -- HTML5, CSS3, Vanilla JavaScript, localStorage
3. How to Run -- clone, open with Live Server or python3 -m http.server 8000
4. Project Structure -- file tree
5. Key Concept -- rooms have no status; availability is date-based via
   isRoomAvailable checking reservation overlaps
6. Team Members -- placeholder names with module assignments
7. Sample Data -- "Load Sample Data" button on dashboard

No emoji. Clean and professional.
```

**Commit:**
```bash
git add README.md
git commit -m "[shared] docs: update README with features, structure, and setup instructions"
```

---

## Final Commit Summary for Stage 4

| # | Commit Message | Description |
|---|---|---|
| 1 | [shared] merge: integrate room catalog module | Merge feature/room-catalog |
| 2 | [shared] merge: integrate guest management and dashboard modules | Merge feature/guest-dashboard |
| 3 | [shared] merge: integrate reservation system module | Merge feature/reservation-system |
| 4+ | [shared] fix: (varies) | Integration bug fixes |
| - | [shared] feat: add seed data and clear data functions for demonstration | Seed data |
| - | [shared] style: fix cross-module CSS inconsistencies | CSS polish |
| - | [shared] docs: update README with features, structure, and setup instructions | Final README |

Minimum Stage 4 commits: 5 (3 merges + seed + README). Typical: 7-9 with fixes and polish.

---

## Final Verification

After all Stage 4 work is done, run this checklist:

- [ ] All four navigation links work (Dashboard, Rooms, Reservations, Guests)
- [ ] "Load Sample Data" populates data across all modules
- [ ] Dashboard shows correct room availability using isRoomAvailable
- [ ] Dashboard shows correct reservation counts by status
- [ ] Dashboard shows revenue from checked-out reservations only
- [ ] Dashboard shows upcoming arrivals (confirmed, check-in within 7 days)
- [ ] Full reservation lifecycle works (register guest, add room, search dates, reserve, check-in, check-out)
- [ ] Availability search correctly excludes rooms with overlapping active reservations
- [ ] Deletion protections work (room with active reservation, guest with active reservation)
- [ ] After cancelling a reservation, the date range becomes available again
- [ ] After checking out, the date range becomes available again
- [ ] All filters and search features work
- [ ] No JavaScript errors in the browser console
- [ ] The app looks visually consistent across all pages
- [ ] README.md is accurate
- [ ] "Clear All Data" removes everything and all pages show empty states

Once everything passes:

```bash
git push origin main
```

The project is complete.

---

End of Stage 4 Document.
