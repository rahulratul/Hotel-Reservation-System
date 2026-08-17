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

- **Frontend Framework**: React 19 with Vite for ultra-fast development.
- **Styling**: Tailwind CSS for responsive styling.
- **Icons**: Lucide React for consistent and modern iconography.
- **Data Persistence**: Browser localStorage API.

---

## Key Architectural Concept: Dynamic Room Availability

In this system, room objects do not possess a static `status` property. Room availability is determined dynamically using the `isRoomAvailable()` function, which checks for overlapping active reservations (`confirmed` or `checked-in`) within any requested date range. Cancelled and checked-out reservations release room dates immediately.

---

## Project Structure

```text
Hotel-Reservation-System/
├── src/
│   ├── assets/             # Images and static assets
│   ├── components/         # Reusable UI components (Modals, Toasts)
│   ├── features/           # Feature-specific modules (Dashboard, Rooms)
│   ├── utils/              # Helper functions and Storage abstractions
│   ├── App.jsx             # Main application component and routing logic
│   ├── main.jsx            # React entry point
│   └── index.css           # Global Tailwind and custom styles
├── public/                 # Public assets (Favicons, etc.)
├── package.json            # Project dependencies and NPM scripts
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

---

## How to Run

1. Clone this repository:
   ```bash
   git clone https://github.com/rahulratul/Hotel-Reservation-System.git
   cd Hotel-Reservation-System
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Navigate to the local URL (usually `http://localhost:5173`) in your web browser.

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