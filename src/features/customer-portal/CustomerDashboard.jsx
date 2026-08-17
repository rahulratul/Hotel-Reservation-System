// src/features/customer-portal/CustomerDashboard.jsx
import React from "react";
import { formatDate, HOTELS } from "../../utils/helpers";
import { 
  Compass, Award, CalendarDays, DollarSign, 
  Sparkles, CheckCircle2, ShieldCheck, HelpCircle 
} from "lucide-react";

export default function CustomerDashboard({ guest, reservations, rooms, onBookNewStay }) {
  // Filter bookings belonging to this guest
  const myReservations = reservations.filter(r => r.guestId === guest.id);
  const activeBookings = myReservations.filter(r => r.status === "checked-in");
  const confirmedBookings = myReservations.filter(r => r.status === "confirmed");
  const completedStays = myReservations.filter(r => r.status === "checked-out");

  // Lifetime loyalty spend
  const totalSpend = completedStays.reduce((sum, r) => sum + (r.totalPrice || 0), 0);

  // Loyalty calculations: sum of nights from checked-out (completed) and active checked-in stays
  const loyaltyNights = [...completedStays, ...activeBookings].reduce((sum, r) => sum + (r.nights || 0), 0);

  // Loyalty Tiers
  let tier = "Bronze";
  let progress = 0;
  let remainingNights = 5;
  let nextTier = "Silver";
  let benefits = ["Complimentary high-speed WiFi", "Welcome room drinks on arrival"];

  if (loyaltyNights >= 12) {
    tier = "Gold VIP";
    progress = 100;
    remainingNights = 0;
    nextTier = "";
    benefits = [
      "All Silver Tier benefits",
      "Private Jacuzzi access",
      "15% direct booking discount",
      "Complimentary late checkout (2:00 PM)"
    ];
  } else if (loyaltyNights >= 5) {
    tier = "Silver";
    progress = Math.min(100, Math.round(((loyaltyNights - 5) / 7) * 100));
    remainingNights = 12 - loyaltyNights;
    nextTier = "Gold VIP";
    benefits = [
      "All Bronze Tier benefits",
      "Access to Top-Floor Luxury Lounge",
      "10% discount on minibar items",
      "Complimentary room upgrades when available"
    ];
  } else {
    progress = Math.min(100, Math.round((loyaltyNights / 5) * 100));
    remainingNights = 5 - loyaltyNights;
    nextTier = "Silver";
  }

  const statusBadges = {
    confirmed: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    "checked-in": "bg-amber-500/10 border-amber-500/20 text-amber-400",
    "checked-out": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    cancelled: "bg-gray-500/10 border-gray-500/20 text-gray-400"
  };

  return (
    <div className="space-y-8 page-transition">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-gold-950/15 via-black/25 to-black/25 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider block">StayBD Loyalty Profile</span>
          <h2 className="text-3xl font-bold font-serif text-white mt-1">Welcome back, {guest.name}!</h2>
          <p className="text-xs text-gray-400 mt-2">
            Joined on {formatDate(guest.createdAt)} • Member ID: {guest.id}
          </p>
        </div>
        <button
          onClick={onBookNewStay}
          className="flex items-center gap-2 bg-gold-primary hover:bg-gold-hover text-black font-bold text-sm px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-gold-500/10 cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          Book A New Stay
        </button>
      </div>

      {/* Main Grid: Stats and AeroRewards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Personal Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Total Stays Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[135px]">
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Registered Stays</span>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-gold-400 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-bold font-serif text-white block mt-2">{myReservations.filter(r => r.status !== "cancelled").length}</span>
            <div className="flex gap-4 text-xs text-gray-400 mt-2 border-t border-white/5 pt-2">
              <span>Active: <strong className="text-amber-400">{activeBookings.length}</strong></span>
              <span>Confirmed: <strong className="text-blue-400">{confirmedBookings.length}</strong></span>
            </div>
          </div>

          {/* Loyalty Nights Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[135px]">
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Loyalty Stays Nights</span>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-gold-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <span className="text-3xl font-bold font-serif text-white block mt-2">{loyaltyNights} <span className="text-sm font-normal text-gray-400 font-sans">nights</span></span>
            <p className="text-[10px] text-gray-400 mt-1 border-t border-white/5 pt-2 truncate">Stay nights counting to your progress.</p>
          </div>

          {/* Money Spent Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between h-[135px]">
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Lifetime Spent</span>
              <div className="bg-white/5 w-9 h-9 flex items-center justify-center rounded-xl border border-white/5 text-gold-400 font-bold shrink-0 text-base">
                ৳
              </div>
            </div>
            <span className="text-3xl font-bold font-serif text-emerald-400 block mt-2">৳{totalSpend.toLocaleString()}</span>
            <p className="text-[10px] text-gray-400 mt-1 border-t border-white/5 pt-2 truncate">Sum from completed stays.</p>
          </div>

        </div>

        {/* AeroRewards Loyalty Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between bg-gradient-to-tr from-gold-950/5 via-black/20 to-black/25">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-400 animate-pulse" />
                StayBD loyalty points
              </h3>
              <span className="bg-gold-primary text-black font-bold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full border border-gold-primary shadow-lg shadow-gold-500/10">
                {tier} Member
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs text-gray-400 font-semibold">
                <span>Nights stayed: {loyaltyNights}</span>
                {nextTier && (
                  <span>{remainingNights} more night{remainingNights > 1 ? "s" : ""} to unlock {nextTier}</span>
                )}
              </div>
              <div className="h-2.5 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-2">
                Your Tier Benefits:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 bg-black/15 p-2.5 rounded-lg border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between items-center text-[10px] text-gray-500">
            <span>Progress automatically recalculates upon checkout.</span>
            <span>StayBD Loyalty Club</span>
          </div>
        </div>

      </div>

      {/* Stay History List */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-md font-bold font-serif text-white mb-4 border-b border-white/5 pb-3">
          Your Booking History
        </h3>

        {myReservations.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center bg-black/15 rounded-xl border border-white/5">
            <HelpCircle className="w-10 h-10 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">No booking history associated with your account yet.</p>
            <button
              onClick={onBookNewStay}
              className="text-xs text-gold-400 hover:underline mt-2 font-semibold cursor-pointer"
            >
              Book your first stay now
            </button>
          </div>
        ) : (
          <div className="overflow-hidden overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-black/25 text-gray-300 uppercase tracking-wider text-[9px] font-bold border-b border-white/5">
                  <th className="py-3 px-6">Hotel Destination</th>
                  <th className="py-3 px-6">Room Number</th>
                  <th className="py-3 px-6">Room Type</th>
                  <th className="py-3 px-6">Check In</th>
                  <th className="py-3 px-6">Check Out</th>
                  <th className="py-3 px-6 text-center">Nights</th>
                  <th className="py-3 px-6 text-right">Price</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                {myReservations.map(res => {
                  const room = rooms.find(r => r.id === res.roomId);
                  const hotelName = HOTELS.find(h => h.id === room?.hotelId)?.name || "Unknown Hotel";
                  const roomNumber = room ? `Room ${room.roomNumber}` : "Unknown Room";
                  const roomType = room 
                    ? room.type.charAt(0).toUpperCase() + room.type.slice(1) 
                    : "N/A";

                  return (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-6 text-white font-semibold">{hotelName}</td>
                      <td className="py-3 px-6 font-mono">{roomNumber}</td>
                      <td className="py-3 px-6">{roomType}</td>
                      <td className="py-3 px-6">{formatDate(res.checkIn)}</td>
                      <td className="py-3 px-6">{formatDate(res.checkOut)}</td>
                      <td className="py-3 px-6 text-center font-serif">{res.nights}</td>
                      <td className="py-3 px-6 text-right font-serif text-white font-bold">৳{res.totalPrice.toLocaleString()}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                          statusBadges[res.status] || "bg-gray-800 border-gray-700 text-gray-300"
                        }`}>
                          {res.status === "checked-in" ? "Checked In" : res.status === "checked-out" ? "Checked Out" : res.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
