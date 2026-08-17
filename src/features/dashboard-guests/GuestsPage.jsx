// src/features/dashboard-guests/GuestsPage.jsx
import React, { useState } from "react";
import GuestFormModal from "./GuestFormModal";
import { formatDate } from "../../utils/helpers";
import { Plus, Search, UserCheck, Edit, Trash2 } from "lucide-react";

export default function GuestsPage({ guests, reservations, onSaveGuest, onDeleteGuest, addToast }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  // Filter guests based on search
  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (guestId, guestName) => {
    // Check if guest has active reservations (confirmed or checked-in)
    const activeRes = reservations.filter(r => 
      r.guestId === guestId && (r.status === "confirmed" || r.status === "checked-in")
    );

    if (activeRes.length > 0) {
      addToast(
        `Cannot delete guest ${guestName}. They have ${activeRes.length} active reservation(s).`, 
        "error"
      );
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${guestName}? This will clear their record.`)) {
      onDeleteGuest(guestId);
      addToast("Guest profile removed successfully.", "success");
    }
  };

  const handleEditClick = (guest) => {
    setEditingGuest(guest);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingGuest(null);
    setIsModalOpen(true);
  };

  const handleSave = (savedGuest) => {
    onSaveGuest(savedGuest);
    setIsModalOpen(false);
    setEditingGuest(null);
    addToast(
      editingGuest ? "Guest profile updated successfully." : "Guest registered successfully.", 
      "success"
    );
  };

  return (
    <div className="space-y-6 page-transition">

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/25 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold font-serif text-white">Guests Directory</h2>
          <p className="text-sm text-gray-400 mt-1">
            Showing {filteredGuests.length} of {guests.length} registered guests
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-gold-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register Guest
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
        />
      </div>

      {/* Guests Table */}
      {filteredGuests.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-white/5">
          <UserCheck className="w-12 h-12 text-gray-500 mb-3" />
          <h3 className="text-lg font-bold font-serif text-white">No Guests Found</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm">
            {guests.length === 0 
              ? "The guest directory is empty. Register a guest or load demo data from the Dashboard." 
              : `No guests match search term "${searchTerm}".`}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/25 text-gray-300 uppercase tracking-wider text-[10px] font-bold border-b border-white/5">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">NID/Passport</th>
                <th className="py-4 px-6">Address</th>
                <th className="py-4 px-6">Registered On</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {filteredGuests.map(g => (
                <tr key={g.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">{g.name}</td>
                  <td className="py-4 px-6">{g.email}</td>
                  <td className="py-4 px-6 font-mono text-xs">{g.phone}</td>
                  <td className="py-4 px-6 font-mono text-xs">{g.nid}</td>
                  <td className="py-4 px-6 max-w-xs truncate">{g.address || "—"}</td>
                  <td className="py-4 px-6">{formatDate(g.createdAt)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditClick(g)}
                        className="flex items-center gap-1 text-xs font-semibold bg-white/5 hover:bg-gold-primary hover:text-black text-white px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-gold-primary transition-all duration-200 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(g.id, g.name)}
                        className="flex items-center gap-1 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500 transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guest Modal */}
      {isModalOpen && (
        <GuestFormModal
          guest={editingGuest}
          allGuests={guests}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGuest(null);
          }}
          onSave={handleSave}
        />
      )}

    </div>
  );
}
