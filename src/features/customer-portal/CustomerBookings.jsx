// src/features/customer-portal/CustomerBookings.jsx
import React, { useState } from "react";
import { formatDate } from "../../utils/helpers";
import { Search, Mail, Calendar, Key, UserCheck, XCircle } from "lucide-react";

export default function CustomerBookings({ reservations, guests, rooms }) {
  const [emailInput, setEmailInput] = useState("");
  const [searchedEmail, setSearchedEmail] = useState("");
  const [customerBookings, setCustomerBookings] = useState([]);
  const [guestProfile, setGuestProfile] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const email = emailInput.trim().toLowerCase();
    const guest = guests.find(g => g.email.toLowerCase() === email);
    
    setSearchedEmail(emailInput);
    setHasSearched(true);

    if (guest) {
      setGuestProfile(guest);
      const bookings = reservations.filter(r => r.guestId === guest.id);
      // Sort bookings: newest bookings or current ones first
      bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setCustomerBookings(bookings);
    } else {
      setGuestProfile(null);
      setCustomerBookings([]);
    }
  };

  const statusBadges = {
    confirmed: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    "checked-in": "bg-amber-500/10 border-amber-500/30 text-amber-400",
    "checked-out": "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    cancelled: "bg-gray-500/10 border-gray-500/30 text-gray-400"
  };

  const statusIcons = {
    confirmed: <Calendar className="w-4 h-4" />,
    "checked-in": <Key className="w-4 h-4" />,
    "checked-out": <UserCheck className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto page-transition">
      
      {/* Search Input Box */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 bg-gradient-to-b from-white/5 to-transparent">
        <div className="max-w-lg">
          <h2 className="text-xl font-bold font-serif text-white">Find Your Reservations</h2>
          <p className="text-xs text-gray-400 mt-1">
            Input the email address used during registration to retrieve active bookings, dates, and stay records.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gold-primary hover:bg-gold-hover text-black font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-gold-500/10 shrink-0"
          >
            <Search className="w-4 h-4" />
            Lookup Stay
          </button>
        </form>
      </div>

      {/* Results Display */}
      {hasSearched && (
        <div className="space-y-6">
          {!guestProfile ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/5">
              <p className="text-sm text-gray-400">
                No guest record was found in our system matching the email <strong className="text-white">"{searchedEmail}"</strong>.
              </p>
              <p className="text-xs text-gray-500 mt-1">Check the email address or register a stay in our home catalog first.</p>
            </div>
          ) : customerBookings.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 space-y-2">
              <h3 className="text-md font-bold font-serif text-white">Guest Found: {guestProfile.name}</h3>
              <p className="text-sm text-gray-400">
                There are no active or past reservation records registered under this email.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-gray-400 px-1">
                <span>Welcome Back, <strong className="text-white">{guestProfile.name}</strong></span>
                <span>Total Bookings: {customerBookings.length}</span>
              </div>

              {/* Bookings Card List */}
              <div className="space-y-4">
                {customerBookings.map(res => {
                  const room = rooms.find(r => r.id === res.roomId);
                  const roomNumber = room ? `Room ${room.roomNumber}` : "Unknown Room";
                  const roomType = room ? room.type : "N/A";
                  const pricePerNight = room ? room.pricePerNight : 0;

                  return (
                    <div 
                      key={res.id} 
                      className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between gap-6 hover:border-gold-primary/10 transition-all duration-300"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold font-serif text-white">{roomNumber}</h4>
                          <span className="bg-white/5 border border-white/5 text-[9px] text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                            {roomType}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusBadges[res.status] || "bg-gray-800 border-gray-700 text-gray-300"
                          }`}>
                            {statusIcons[res.status]}
                            {res.status === "checked-in" ? "Checked In" : res.status === "checked-out" ? "Checked Out" : res.status}
                          </span>
                        </div>

                        {/* Stay Dates */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-500">Check-in</span>
                            <span className="text-white font-semibold">{formatDate(res.checkIn)}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-gray-500">Check-out</span>
                            <span className="text-white font-semibold">{formatDate(res.checkOut)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right details */}
                      <div className="flex flex-col justify-between md:text-right md:items-end">
                        <div>
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Stay Duration</span>
                          <span className="text-md font-bold text-white font-serif block mt-0.5">{res.nights} nights</span>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Stays Cost</span>
                          <span className="text-xl font-bold text-gold-400 font-serif block mt-0.5">${res.totalPrice}</span>
                          <span className="text-[10px] text-gray-400 font-mono">${pricePerNight} / night</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
