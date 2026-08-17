// src/features/rooms/RoomFormModal.jsx
import React, { useState, useEffect } from "react";
import { HOTELS } from "../../utils/helpers";
import { X } from "lucide-react";

const CAPACITY_MAP = {
  single: 1,
  double: 2,
  suite: 3,
  deluxe: 4
};

const AMENITY_OPTIONS = ["wifi", "tv", "ac", "minibar", "balcony", "safe", "kitchenette", "desk", "jacuzzi"];

export default function RoomFormModal({ room, onClose, onSave, allRooms }) {
  const [hotelId, setHotelId] = useState("hotel-1");
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("single");
  const [pricePerNight, setPricePerNight] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [floor, setFloor] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    if (room) {
      setHotelId(room.hotelId || "hotel-1");
      setRoomNumber(room.roomNumber || "");
      setType(room.type || "single");
      setPricePerNight(room.pricePerNight || "");
      setCapacity(room.capacity || 1);
      setFloor(room.floor || "");
      setDescription(room.description || "");
      setAmenities(room.amenities || []);
    } else {
      setHotelId("hotel-1");
      setRoomNumber("");
      setType("single");
      setPricePerNight("");
      setCapacity(CAPACITY_MAP.single);
      setFloor("");
      setDescription("");
      setAmenities([]);
    }
  }, [room]);

  const handleTypeChange = (newType) => {
    setType(newType);
    if (CAPACITY_MAP[newType]) {
      setCapacity(CAPACITY_MAP[newType]);
    }
  };

  const handleAmenityToggle = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomNumber.trim()) {
      alert("Room Number is required.");
      return;
    }
    if (!pricePerNight || Number(pricePerNight) <= 0) {
      alert("Please enter a valid positive price per night.");
      return;
    }
    if (!floor || Number(floor) <= 0) {
      alert("Please enter a valid positive floor number.");
      return;
    }

    // Check duplicate room number inside the SAME hotel
    const isDuplicate = allRooms.some(r => 
      r.hotelId === hotelId &&
      r.roomNumber.trim().toLowerCase() === roomNumber.trim().toLowerCase() && 
      (!room || r.id !== room.id)
    );

    if (isDuplicate) {
      const hotelName = HOTELS.find(h => h.id === hotelId)?.name;
      alert(`Room number ${roomNumber} is already in use at ${hotelName}.`);
      return;
    }

    const savedRoom = {
      id: room ? room.id : `room-${hotelId}-${roomNumber}`,
      hotelId,
      roomNumber: roomNumber.trim(),
      type,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      floor: Number(floor),
      description: description.trim(),
      amenities,
      createdAt: room ? room.createdAt : new Date().toISOString()
    };

    onSave(savedRoom);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold font-serif text-white">
            {room ? "Edit Room" : "Add Room to Network"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Select Destination Hotel *
            </label>
            <select
              value={hotelId}
              onChange={e => setHotelId(e.target.value)}
              className="w-full bg-dark-800 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              {HOTELS.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Room Number *
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                placeholder="e.g. 101"
                className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Room Type *
              </label>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value)}
                className="w-full bg-dark-800 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
                <option value="deluxe">Deluxe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Price per Night (৳) *
              </label>
              <input
                type="number"
                value={pricePerNight}
                onChange={e => setPricePerNight(e.target.value)}
                placeholder="e.g. 8000"
                min="1"
                className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={capacity}
                readOnly
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Floor Number *
              </label>
              <input
                type="number"
                value={floor}
                onChange={e => setFloor(e.target.value)}
                placeholder="e.g. 2"
                min="1"
                className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Room specifications..."
              rows="2"
              className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-3 gap-2 bg-black/20 p-4 rounded-xl border border-white/5">
              {AMENITY_OPTIONS.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded text-gold-500 bg-white/5 border-white/10 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs text-gray-300 capitalize">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-hover text-black text-sm font-semibold transition-colors cursor-pointer"
            >
              {room ? "Save Changes" : "Create Room"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
