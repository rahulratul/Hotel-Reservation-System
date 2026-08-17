// src/features/customer-portal/CustomerBookingModal.jsx
import React, { useState } from "react";
import { calculateNights } from "../../utils/helpers";
import { X, Calendar, User, Mail, Phone, ShieldCheck } from "lucide-react";

export default function CustomerBookingModal({ room, checkIn, checkOut, onClose, onConfirm, guests }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [address, setAddress] = useState("");

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = nights * (room ? room.pricePerNight : 0);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      alert("Name must be at least 2 characters long.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
    if (phone.trim().length < 8) {
      alert("Phone number must be at least 8 characters long.");
      return;
    }
    if (!nid.trim()) {
      alert("NID/Passport is required.");
      return;
    }

    // Determine guest ID
    const existingGuest = guests.find(g => g.email.toLowerCase() === email.trim().toLowerCase());
    let guestId;
    let newGuestObj = null;

    if (existingGuest) {
      guestId = existingGuest.id;
    } else {
      guestId = `guest-${Date.now()}`;
      newGuestObj = {
        id: guestId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        nid: nid.trim(),
        address: address.trim(),
        createdAt: new Date().toISOString()
      };
    }

    const reservationObj = {
      id: `res-${Date.now()}`,
      guestId,
      roomId: room.id,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    onConfirm(reservationObj, newGuestObj);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-serif text-white">Secure Checkout</h2>
            <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider mt-1">AeroStay Booking System</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          {/* Summary Panel */}
          <div className="bg-gold-primary/5 border border-gold-primary/20 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">Your Selection</span>
              <h3 className="text-lg font-bold font-serif text-white mt-1">Room {room.roomNumber}</h3>
              <span className="text-xs text-gray-400 capitalize">{room.type} Suite — Floor {room.floor}</span>
            </div>
            <div className="flex flex-col justify-between text-right md:items-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Price Details</span>
              <span className="text-lg font-bold text-gold-400 font-serif mt-1">${room.pricePerNight} <span className="text-xs font-normal text-gray-400">× {nights} nights</span></span>
              <span className="text-sm font-semibold text-white">Total: ${totalPrice}</span>
            </div>
          </div>

          {/* Stay Dates */}
          <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5 text-sm text-gray-300">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Check-in</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-400" />
                {checkIn}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Check-out</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-400" />
                {checkOut}
              </span>
            </div>
          </div>

          {/* Guest Form Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-white/5 pb-2">
              Guest Contact Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-400" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gold-400" />
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                  NID / Passport *
                </label>
                <input
                  type="text"
                  value={nid}
                  onChange={e => setNid(e.target.value)}
                  placeholder="National ID or Passport Number"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-semibold mb-2">
                Home Address
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. Dhaka, Bangladesh"
                className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
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
              className="px-6 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-hover text-black text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-gold-500/10 flex items-center gap-2 cursor-pointer"
            >
              Complete Reservation
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
