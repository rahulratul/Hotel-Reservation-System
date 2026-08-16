# Hotel Reservation System

A browser-based hotel reservation system for browsing rooms, making date-based reservations, managing guest registrations, and viewing reservation statistics. Built as a group project with three contributors.

---

## Features

### Room Catalog
- Browse room inventory with rich card layouts, price per night, floor number, capacity, and amenities.
- Add, edit, and delete rooms with comprehensive form validation and automatic capacity mapping.
- Real-time room availability status badges ("Available Now" vs. "Reserved") computed dynamically for today.
- Room type filtering (Single, Double, Suite, Deluxe, or All).
- Deletion protection preventing deletion of rooms associated with active reservations.

### Reservation System
- Two-step date-based availability search that calculates available rooms across specified check-in and check-out periods.
- Room selection with live duration calculations, price breakdowns, and guest assignment.
- Reservation lifecycle management: Confirmed, Checked-in, Checked-out, and Cancelled.
- Edit reservations with availability re-validation (excluding the current reservation).
- Action buttons dynamically controlled by reservation status.
- Status filtering and responsive table display with dynamic count indicators.

### Guest Management
- Complete guest directory management: add, edit, and delete guests.
- Real-time guest search by name and email.
- Form validations including email format, unique email constraints, and phone/name length checks.
- Deletion protection preventing removal of guests with active reservations.

### Dashboard
- Real-time room availability statistics for the current day.
- Comprehensive reservation status counters (Confirmed, Checked-in, Checked-out, Cancelled).
- Business metrics including total guests registered and realized revenue from completed stays.
- Upcoming arrivals table displaying confirmed reservations checking in within the next 7 days.
- Demonstration controls to populate and reset sample data with one click.

---

## Technology Stack

- **Structure**: Semantic HTML5 partials loaded dynamically
- **Styling**: Vanilla CSS3 utilizing CSS custom properties, responsive grids, and modern layout techniques
- **Logic**: Vanilla JavaScript (ES6+), modular architecture, event delegation
- **Data Persistence**: Browser localStorage API

---

## Key Architectural Concept: Dynamic Room Availability

In this system, room objects do not possess a static `status` property. Room availability is determined dynamically using the `isRoomAvailable()` function, which checks for overlapping active reservations (`confirmed` or `checked-in`) within any requested date range. Cancelled and checked-out reservations release room dates immediately.

---

## Project Structure

```text
Hotel-Reservation-System/
├── index.html              # Main application shell with sidebar navigation
├── README.md               # Project documentation
├── css/
│   ├── global.css          # Shared design system variables, resets, components
│   ├── rooms.css           # Room catalog module styles
│   ├── reservations.css    # Reservation system module styles
│   └── guests.css          # Guest directory and dashboard styles
├── js/
│   ├── storage.js          # Unified LocalStorage CRUD abstraction
│   ├── utils.js            # Shared helper functions (ID, date, availability)
│   ├── rooms.js            # Room catalog controller logic
│   ├── reservations.js     # Reservation management controller logic
│   ├── guests.js           # Guest directory controller logic
│   ├── dashboard.js        # Dashboard overview controller logic
│   ├── seed.js             # Sample demonstration data generator
│   └── app.js              # Application router and partial loader
├── pages/
│   ├── dashboard.html      # Dashboard view partial
│   ├── rooms.html          # Room catalog view partial
│   ├── reservations.html   # Reservations view partial
│   └── guests.html         # Guest management view partial
└── docs/                   # Specification and task documents
```

---

## How to Run

1. Clone this repository:
   ```bash
   git clone https://github.com/rahulratul/Hotel-Reservation-System.git
   cd Hotel-Reservation-System
   ```

2. Start a local HTTP server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   ```
   Or open the folder in VS Code and use the **Live Server** extension.

3. Navigate to `http://localhost:8000` in your web browser.

---

## Sample Demonstration Data

To quickly evaluate the system with pre-configured rooms, guests, and reservations:
1. Navigate to the **Dashboard** page.
2. Scroll to the **Demonstration Controls** section at the bottom.
3. Click **Load Sample Data** to populate sample records across all modules.
4. Click **Clear All Data** to reset the system to an empty state.

---

## Team Members and Roles

- **Member A (Team Lead)**: Room Catalog (`feature/room-catalog`)
- **Member B**: Reservation System (`feature/reservation-system`)
- **Member C**: Guest Directory & Dashboard Overview (`feature/guest-dashboard`)