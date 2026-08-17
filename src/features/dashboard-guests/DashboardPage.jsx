// src/features/dashboard-guests/DashboardPage.jsx
import React, { useState } from "react";
import { isRoomAvailable } from "../../features/reservations/availability";
import { getTodayString, formatDate, HOTELS } from "../../utils/helpers";
import { 
  Bed, CheckCircle2, Key, HelpCircle, 
  Users, Landmark, RefreshCw, Trash2, CalendarDays 
} from "lucide-react";

export default function DashboardPage({ 
  rooms, 
  guests, 
  reservations, 
  onSeedDemo, 
  onClearAll, 
  addToast 
}) {
  const [filterHotelId, setFilterHotelId] = useState("all");

  const today = getTodayString();
  const todayDate = new Date(today);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  // Filter rooms based on selected hotel
  const hotelRooms = filterHotelId === "all" 
    ? rooms 
    : rooms.filter(r => r.hotelId === filterHotelId);

  // Room availability metrics for today (for selected hotel or globally)
  let availableCount = 0;
  hotelRooms.forEach(room => {
    if (isRoomAvailable(room.id, today, tomorrow, reservations)) {
      availableCount++;
    }
  });

  const totalRoomsCount = hotelRooms.length;
  const reservedCount = totalRoomsCount - availableCount;

  // Reservation Status counters & revenue calculation filtered by hotel rooms
  let confirmedCount = 0;
  let checkedInCount = 0;
  let checkedOutCount = 0;
  let cancelledCount = 0;
  let realizedRevenue = 0;

  // Filter reservations based on whether their room belongs to the selected hotel
  const hotelReservations = reservations.filter(res => {
    const room = rooms.find(r => r.id === res.roomId);
    return filterHotelId === "all" || (room && room.hotelId === filterHotelId);
  });

  hotelReservations.forEach(res => {
    if (res.status === "confirmed") confirmedCount++;
    else if (res.status === "checked-in") checkedInCount++;
    else if (res.status === "checked-out") {
      checkedOutCount++;
      realizedRevenue += (res.totalPrice || 0);
    }
    else if (res.status === "cancelled") cancelledCount++;
  });

  // Upcoming Arrivals (confirmed, checking in today -> 7 days from now, for selected hotel)
  const sevenDaysDate = new Date(todayDate);
  sevenDaysDate.setDate(sevenDaysDate.getDate() + 7);
  const sevenDaysFromNow = sevenDaysDate.toISOString().split("T")[0];

  const upcomingReservations = hotelReservations
    .filter(res => 
      res.status === "confirmed" && 
      res.checkIn >= today && 
      res.checkIn <= sevenDaysFromNow
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const handleSeedClick = () => {
    if (rooms.length > 0) {
      addToast("Data already exists. Please clear all data first.", "error");
      return;
    }
    onSeedDemo();
    addToast("Sample demonstration data loaded successfully!", "success");
  };

  const handleClearClick = () => {
    if (window.confirm("Are you sure you want to clear all data? This will reset rooms, guests, and reservations.")) {
      onClearAll();
      addToast("All data successfully cleared from database.", "info");
    }
  };

  return (
    <div className="space-y-6 page-transition">

      {/* Hotel Filter Header Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between bg-gradient-to-r from-gold-950/5 via-black/20 to-black/20">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Select Dashboard Focus:</span>
          <select
            value={filterHotelId}
            onChange={e => setFilterHotelId(e.target.value)}
            className="bg-dark-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary transition-colors cursor-pointer"
          >
            <option value="all">All Hotels (Global Network)</option>
            {HOTELS.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          Showing metrics for: <strong className="text-white">{filterHotelId === "all" ? "All Hotels" : HOTELS.find(h => h.id === filterHotelId)?.name}</strong>
        </span>
      </div>

      {/* Grid of Key Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Rooms Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Today's Room Availability</span>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-gold-400 shrink-0">
              <Bed className="w-5 h-5" />
            </div>
          </div>
          <span className="text-4xl font-bold font-serif text-white mt-4 block">{availableCount} / {totalRoomsCount}</span>
          <div className="flex gap-4 text-xs text-gray-400 mt-4 border-t border-white/5 pt-3">
            <span>Available: <strong className="text-emerald-400">{availableCount}</strong></span>
            <span>Occupied: <strong className="text-gold-400">{reservedCount}</strong></span>
          </div>
        </div>

        {/* Guest Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Registered Guests</span>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-gold-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="text-4xl font-bold font-serif text-white mt-4 block">{guests.length}</span>
          <p className="text-xs text-gray-400 mt-4 border-t border-white/5 pt-3">
            Active directory members (Global network)
          </p>
        </div>

        {/* Revenue Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start gap-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Realized Revenue</span>
            <div className="bg-white/5 w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 text-gold-400 font-bold shrink-0 text-base">
              ৳
            </div>
          </div>
          <span className="text-4xl font-bold font-serif text-emerald-400 mt-4 block">৳{realizedRevenue.toLocaleString()}</span>
          <p className="text-xs text-gray-400 mt-4 border-t border-white/5 pt-3">
            Earnings collected from checked-out stays
          </p>
        </div>

      </div>

      {/* Reservation Status Counters Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <h3 className="text-md font-bold font-serif text-white mb-6 border-b border-white/5 pb-3">
          Reservation Lifecycle Dashboard
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Bookings</span>
            <span className="text-3xl font-serif font-bold text-white block mt-2">{hotelReservations.length}</span>
          </div>
          <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 text-center">
            <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Confirmed</span>
            <span className="text-3xl font-serif font-bold text-blue-300 block mt-2">{confirmedCount}</span>
          </div>
          <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-center">
            <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Checked In</span>
            <span className="text-3xl font-serif font-bold text-amber-300 block mt-2">{checkedInCount}</span>
          </div>
          <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-center">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Checked Out</span>
            <span className="text-3xl font-serif font-bold text-emerald-300 block mt-2">{checkedOutCount}</span>
          </div>
          <div className="bg-gray-500/5 p-4 rounded-xl border border-gray-500/10 text-center">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cancelled</span>
            <span className="text-3xl font-serif font-bold text-gray-400 block mt-2">{cancelledCount}</span>
          </div>
        </div>
      </div>

      {/* Upcoming Arrivals Section */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <h3 className="text-md font-bold font-serif text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gold-500" />
            Upcoming Arrivals (Next 7 Days)
          </h3>
          <span className="text-xs text-gray-400">Total: {upcomingReservations.length}</span>
        </div>

        {upcomingReservations.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center bg-black/15 rounded-xl border border-white/5">
            <HelpCircle className="w-10 h-10 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No upcoming arrivals confirmed within the next 7 days for selected hotel.</p>
          </div>
        ) : (
          <div className="overflow-hidden overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/25 text-gray-300 uppercase tracking-wider text-[9px] font-bold border-b border-white/5">
                  <th className="py-3.5 px-6">Guest Name</th>
                  <th className="py-3.5 px-6">Hotel Destination</th>
                  <th className="py-3.5 px-6">Room Number</th>
                  <th className="py-3.5 px-6">Check In</th>
                  <th className="py-3.5 px-6">Check Out</th>
                  <th className="py-3.5 px-6 text-center">Nights</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {upcomingReservations.map(res => {
                  const guest = guests.find(g => g.id === res.guestId);
                  const room = rooms.find(r => r.id === res.roomId);
                  const currentHotelName = room ? (HOTELS.find(h => h.id === room.hotelId)?.name || "Unknown") : "N/A";

                  const guestName = guest ? guest.name : "Unknown Guest";
                  const roomNumber = room ? `Room ${room.roomNumber}` : "Unknown Room";

                  return (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-6 text-white font-semibold">{guestName}</td>
                      <td className="py-3.5 px-6">{currentHotelName}</td>
                      <td className="py-3.5 px-6 font-mono text-white">{roomNumber}</td>
                      <td className="py-3.5 px-6">{formatDate(res.checkIn)}</td>
                      <td className="py-3.5 px-6">{formatDate(res.checkOut)}</td>
                      <td className="py-3.5 px-6 text-center font-serif">{res.nights}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Demonstration Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gold-950/15 via-black/25 to-black/25">
        <div>
          <h3 className="text-sm font-bold font-serif text-gold-400">Demonstration Operations</h3>
          <p className="text-xs text-gray-400 mt-1">Pre-load representative listings for evaluation or completely wipe the database state.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeedClick}
            className="flex items-center gap-1.5 bg-white/5 hover:bg-gold-primary border border-white/10 hover:border-gold-primary hover:text-black font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Sample Data
          </button>
          <button
            onClick={handleClearClick}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All Data
          </button>
        </div>
      </div>

    </div>
  );
}
