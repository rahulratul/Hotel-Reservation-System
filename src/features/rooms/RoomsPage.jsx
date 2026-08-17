// src/features/rooms/RoomsPage.jsx
import React, { useState } from "react";
import RoomCard from "./RoomCard";
import RoomFormModal from "./RoomFormModal";
import { isRoomAvailable } from "../../features/reservations/availability";
import { getTodayString, HOTELS } from "../../utils/helpers";
import { Plus, HelpCircle } from "lucide-react";

export default function RoomsPage({ rooms, reservations, onSaveRoom, onDeleteRoom, addToast }) {
  const [filterType, setFilterType] = useState("all");
  const [filterHotelId, setFilterHotelId] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const today = getTodayString();
  
  // Calculate tomorrow safely in local timezone
  const todayDate = new Date(today + "T00:00:00");
  todayDate.setDate(todayDate.getDate() + 1);
  const yyyy = todayDate.getFullYear();
  const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
  const dd = String(todayDate.getDate()).padStart(2, '0');
  const tomorrow = `${yyyy}-${mm}-${dd}`;

  // Filter rooms by type and hotel
  const filteredRooms = rooms.filter(room => {
    const matchesType = filterType === "all" || room.type === filterType;
    const matchesHotel = filterHotelId === "all" || room.hotelId === filterHotelId;
    return matchesType && matchesHotel;
  });

  // Calculate stats
  const totalRoomsCount = rooms.length;
  const availableRoomsCount = rooms.filter(room => 
    isRoomAvailable(room.id, today, tomorrow, reservations)
  ).length;

  const handleDeleteClick = (roomId) => {
    // Deletion protection: prevent deletion if room is linked to active reservations (confirmed or checked-in)
    const activeReservations = reservations.filter(r => 
      r.roomId === roomId && (r.status === "confirmed" || r.status === "checked-in")
    );

    if (activeReservations.length > 0) {
      addToast(
        `Cannot delete room. It is associated with ${activeReservations.length} active reservation(s).`, 
        "error"
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      onDeleteRoom(roomId);
      addToast("Room deleted successfully.", "success");
    }
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };

  const handleSave = (savedRoom) => {
    onSaveRoom(savedRoom);
    setIsModalOpen(false);
    setEditingRoom(null);
    addToast(
      editingRoom ? "Room updated successfully." : "Room created successfully.", 
      "success"
    );
  };

  const roomTypes = ["all", "single", "double", "suite", "deluxe"];

  return (
    <div className="space-y-6 page-transition">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/25 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white">Room Inventory</h2>
          <p className="text-sm text-gray-400 mt-1">
            {availableRoomsCount} of {totalRoomsCount} rooms available globally today ({today})
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-gold-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Room
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

        {/* Room Type Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-end">
          {roomTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                filterType === type
                  ? "bg-gold-primary text-black"
                  : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-white/5">
          <HelpCircle className="w-12 h-12 text-gray-500 mb-3" />
          <h3 className="text-lg font-bold font-serif text-white">No Rooms Found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            {rooms.length === 0 
              ? "The room catalog is empty. Click 'Add New Room' or seed data in the Dashboard to populate rooms." 
              : "No rooms match the selected filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map(room => {
            const isAvailable = isRoomAvailable(room.id, today, tomorrow, reservations);
            return (
              <RoomCard
                key={room.id}
                room={room}
                isAvailable={isAvailable}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <RoomFormModal
          room={editingRoom}
          allRooms={rooms}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRoom(null);
          }}
          onSave={handleSave}
        />
      )}

    </div>
  );
}
