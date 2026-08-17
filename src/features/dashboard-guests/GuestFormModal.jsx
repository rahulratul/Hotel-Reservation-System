// src/features/dashboard-guests/GuestFormModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function GuestFormModal({ guest, onClose, onSave, allGuests }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nid, setNid] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (guest) {
      setName(guest.name || "");
      setEmail(guest.email || "");
      setPhone(guest.phone || "");
      setNid(guest.nid || "");
      setAddress(guest.address || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setNid("");
      setAddress("");
    }
  }, [guest]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation checks
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

    // Check email uniqueness
    const isDuplicateEmail = allGuests.some(g => 
      g.email.toLowerCase() === email.trim().toLowerCase() && 
      (!guest || g.id !== guest.id)
    );

    if (isDuplicateEmail) {
      alert("This email address is already registered to another guest.");
      return;
    }

    const savedGuest = {
      id: guest ? guest.id : `guest-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      nid: nid.trim(),
      address: address.trim(),
      createdAt: guest ? guest.createdAt : new Date().toISOString()
    };

    onSave(savedGuest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold font-serif text-white">
            {guest ? "Edit Guest Details" : "Register Guest"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tanvir Hasan"
              className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. tanvir@example.com"
              className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
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
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                NID / Passport *
              </label>
              <input
                type="text"
                value={nid}
                onChange={e => setNid(e.target.value)}
                placeholder="NID or Passport"
                className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Home Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Dhanmondi, Dhaka"
              className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            />
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
              {guest ? "Save Changes" : "Register Guest"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
