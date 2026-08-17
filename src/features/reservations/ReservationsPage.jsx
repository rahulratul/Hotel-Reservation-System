// src/features/reservations/ReservationsPage.jsx
import React, { useState } from "react";
import ReservationFormModal from "./ReservationFormModal";
import { formatDate, HOTELS } from "../../utils/helpers";
import { Plus, HelpCircle, CalendarDays, Key, LogOut, XCircle, Edit3 } from "lucide-react";

export default function ReservationsPage({ 
  rooms, 
  guests, 
  reservations, 
  onSaveReservation, 
  onQuickAddGuest,
  addToast 
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterHotelId, setFilterHotelId] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // Status mapping colors
  const statusBadgeColors = {
    "confirmed": "bg-blue-500/10 border-blue-500/30 text-blue-400",
    "checked-in": "bg-amber-500/10 border-amber-500/30 text-amber-400",
    "checked-out": "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    "cancelled": "bg-gray-500/10 border-gray-500/30 text-gray-400"
  };

  const statusLabels = {
    "confirmed": "Confirmed",
    "checked-in": "Checked In",
    "checked-out": "Checked Out",
    "cancelled": "Cancelled"
  };

  // Filter reservations
  const filteredReservations = reservations.filter(res => {
    const room = rooms.find(r => r.id === res.roomId);
    
    const matchesStatus = filterStatus === "all" || res.status === filterStatus;
    const matchesHotel = filterHotelId === "all" || (room && room.hotelId === filterHotelId);
    
    return matchesStatus && matchesHotel;
  });

  const handleCheckIn = (resId) => {
    const reservation = reservations.find(r => r.id === resId);
    if (!reservation) return;

    const updated = { ...reservation, status: "checked-in" };
    onSaveReservation(updated);
    addToast("Guest successfully checked in.", "success");
  };

  const handleCheckOut = (resId) => {
    const reservation = reservations.find(r => r.id === resId);
    if (!reservation) return;

    const updated = { ...reservation, status: "checked-out" };
    onSaveReservation(updated);
    addToast("Guest successfully checked out.", "success");
  };

  const handleCancel = (resId) => {
    const reservation = reservations.find(r => r.id === resId);
    if (!reservation) return;

    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      const updated = { ...reservation, status: "cancelled" };
      onSaveReservation(updated);
      addToast("Reservation cancelled successfully.", "info");
    }
  };

  const handleEditClick = (res) => {
    setEditingReservation(res);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingReservation(null);
    setIsModalOpen(true);
  };

  const handleSave = (savedRes) => {
    onSaveReservation(savedRes);
    setIsModalOpen(false);
    setEditingReservation(null);
    addToast(
      editingReservation ? "Reservation updated successfully." : "Reservation created successfully.", 
      "success"
    );
  };

  const statuses = ["all", "confirmed", "checked-in", "checked-out", "cancelled"];

  return (
    <div className="space-y-6 page-transition">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/25 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white">Reservations Book</h2>
          <p className="text-sm text-gray-400 mt-1">
            Showing {filteredReservations.length} of {reservations.length} total bookings
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-gold-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Reservation
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Hotel Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">Filter Hotel:</span>
          <select
            value={filterHotelId}
            onChange={e => setFilterHotelId(e.target.value)}
            className="bg-dark-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-primary transition-colors cursor-pointer"
          >
            <option value="all">All Hotels (Globally)</option>
            {HOTELS.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-end">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                filterStatus === status
                  ? "bg-gold-primary text-black"
                  : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10"
              }`}
            >
              {statusLabels[status] || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      {filteredReservations.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-white/5">
          <CalendarDays className="w-12 h-12 text-gray-500 mb-3" />
          <h3 className="text-lg font-bold font-serif text-white">No Reservations Found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            {reservations.length === 0 
              ? "There are no bookings in the system yet. Click 'New Reservation' to register a guest stay." 
              : "No reservations match the selected filters."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-black/25 text-gray-300 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <th className="py-4 px-6">Guest</th>
                <th className="py-4 px-6">Hotel Resort</th>
                <th className="py-4 px-6">Room Number</th>
                <th className="py-4 px-6">Room Type</th>
                <th className="py-4 px-6">Check In</th>
                <th className="py-4 px-6">Check Out</th>
                <th className="py-4 px-6 text-center">Nights</th>
                <th className="py-4 px-6 text-right">Total Price</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {filteredReservations.map(res => {
                const guest = guests.find(g => g.id === res.guestId);
                const room = rooms.find(r => r.id === res.roomId);
                const hotelName = room ? (HOTELS.find(h => h.id === room.hotelId)?.name || "Unknown") : "N/A";

                const guestName = guest ? guest.name : "Unknown Guest";
                const roomNumber = room ? `Room ${room.roomNumber}` : "Unknown Room";
                const roomType = room 
                  ? room.type.charAt(0).toUpperCase() + room.type.slice(1) 
                  : "N/A";

                return (
                  <tr 
                    key={res.id} 
                    className={`hover:bg-white/5 transition-colors ${
                      res.status === "cancelled" ? "opacity-60 line-through decoration-gray-500" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-semibold text-white">{guestName}</td>
                    <td className="py-4 px-6">{hotelName}</td>
                    <td className="py-4 px-6 font-mono text-white">{roomNumber}</td>
                    <td className="py-4 px-6">{roomType}</td>
                    <td className="py-4 px-6">{formatDate(res.checkIn)}</td>
                    <td className="py-4 px-6">{formatDate(res.checkOut)}</td>
                    <td className="py-4 px-6 text-center font-serif">{res.nights}</td>
                    <td className="py-4 px-6 text-right font-serif text-white font-bold">৳{res.totalPrice.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                        statusBadgeColors[res.status] || "bg-gray-800 text-gray-200"
                      }`}>
                        {statusLabels[res.status]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex gap-1.5 justify-end items-center">
                        {res.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleCheckIn(res.id)}
                              title="Check In"
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all cursor-pointer"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClick(res)}
                              title="Edit Reservation"
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white transition-all cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(res.id)}
                              title="Cancel"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {res.status === "checked-in" && (
                          <>
                            <button
                              onClick={() => handleCheckOut(res.id)}
                              title="Check Out"
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white transition-all cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancel(res.id)}
                              title="Cancel"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {(res.status === "checked-out" || res.status === "cancelled") && (
                          <span className="text-gray-600 font-bold px-2">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* New/Edit Modal Wizard */}
      {isModalOpen && (
        <ReservationFormModal
          reservation={editingReservation}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReservation(null);
          }}
          onSave={handleSave}
          rooms={rooms}
          guests={guests}
          reservations={reservations}
          onQuickAddGuest={onQuickAddGuest}
        />
      )}

    </div>
  );
}
