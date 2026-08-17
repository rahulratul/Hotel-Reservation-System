// src/features/rooms/RoomCard.jsx
import React from "react";
import { HOTELS } from "../../utils/helpers";
import { Users, Layers, ShieldCheck, ShieldAlert, Edit, Trash2, MapPin } from "lucide-react";

export default function RoomCard({ room, isAvailable, onEdit, onDelete }) {
  const typeBadgeColors = {
    single: "bg-blue-900/40 text-blue-200 border border-blue-500/20",
    double: "bg-indigo-900/40 text-indigo-200 border border-indigo-500/20",
    suite: "bg-amber-900/40 text-amber-200 border border-amber-500/20",
    deluxe: "bg-purple-900/40 text-purple-200 border border-purple-500/20"
  };

  const hotel = HOTELS.find(h => h.id === room.hotelId);
  const hotelName = hotel ? hotel.name : "Unknown Hotel";
  const hotelLocation = hotel ? hotel.location : "";

  return (
    <article className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full group">
      {/* Header */}
      <div className="relative p-5 pb-3 flex justify-between items-start">
        <div>
          <span className="text-2xl font-bold font-serif text-white tracking-wide block">
            Room {room.roomNumber}
          </span>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${typeBadgeColors[room.type] || "bg-gray-800 text-gray-200"}`}>
            {room.type}
          </span>
        </div>
        <div>
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" />
              Occupied
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 pt-0 flex-grow flex flex-col justify-between">
        <div>
          {/* Hotel Location Detail */}
          <div className="flex items-center gap-1.5 text-xs text-gold-400 mb-2 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate font-semibold">{hotelName} ({hotelLocation})</span>
          </div>

          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-xl font-bold text-white font-serif">৳{room.pricePerNight.toLocaleString()}</span>
            <span className="text-xs text-gray-400">/ night</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-300 mb-3 border-y border-white/5 py-2.5">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold-500" />
              <span>{room.capacity} Guest{room.capacity === 1 ? "" : "s"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gold-500" />
              <span>Floor {room.floor}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {room.description || "No description provided."}
          </p>
        </div>

        {/* Amenities */}
        <div>
          <div className="flex flex-wrap gap-1 mb-2">
            {room.amenities && room.amenities.length > 0 ? (
              room.amenities.slice(0, 3).map(amenity => (
                <span 
                  key={amenity} 
                  className="bg-white/5 text-[9px] text-gray-300 uppercase tracking-wider px-2 py-0.5 rounded border border-white/5 font-semibold"
                >
                  {amenity}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-gray-500 italic">No amenities</span>
            )}
            {room.amenities && room.amenities.length > 3 && (
              <span className="text-[9px] text-gray-500 font-bold px-1 mt-0.5">+{room.amenities.length - 3}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-black/20 border-t border-white/5 flex gap-2 justify-end">
        <button
          onClick={() => onEdit(room)}
          className="flex items-center gap-1 text-[10px] font-bold bg-white/5 hover:bg-gold-primary hover:text-black text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-gold-primary transition-all duration-200 cursor-pointer"
        >
          <Edit className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={() => onDelete(room.id)}
          className="flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500 transition-all duration-200 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </article>
  );
}
