// src/features/reservations/ReservationFormModal.jsx
import React, { useState, useEffect } from "react";
import { isRoomAvailable } from "./availability";
import { calculateNights, getTodayString, HOTELS } from "../../utils/helpers";
import { X, Search, Calendar, ChevronRight, Check, MapPin } from "lucide-react";

export default function ReservationFormModal({ 
  reservation, 
  onClose, 
  onSave, 
  rooms, 
  guests, 
  reservations,
  onQuickAddGuest 
}) {
  const [step, setStep] = useState(1);
  const [hotelId, setHotelId] = useState("hotel-1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [guestId, setGuestId] = useState("");
  const [status, setStatus] = useState("confirmed");
  const [searchedRooms, setSearchedRooms] = useState(false);
  
  // Quick guest signup state
  const [showQuickGuest, setShowQuickGuest] = useState(false);
  const [quickGuestName, setQuickGuestName] = useState("");
  const [quickGuestEmail, setQuickGuestEmail] = useState("");
  const [quickGuestPhone, setQuickGuestPhone] = useState("");
  const [quickGuestNid, setQuickGuestNid] = useState("");
  const [quickGuestPass, setQuickGuestPass] = useState("");

  const today = getTodayString();

  useEffect(() => {
    if (reservation) {
      const room = rooms.find(r => r.id === reservation.roomId);
      setHotelId(room ? room.hotelId : "hotel-1");
      setCheckIn(reservation.checkIn);
      setCheckOut(reservation.checkOut);
      setSelectedRoomId(reservation.roomId);
      setGuestId(reservation.guestId);
      setStatus(reservation.status);
      setStep(1);
      setSearchedRooms(false);
    } else {
      setHotelId("hotel-1");
      setCheckIn(today);
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      const yyyy = tom.getFullYear();
      const mm = String(tom.getMonth() + 1).padStart(2, "0");
      const dd = String(tom.getDate()).padStart(2, "0");
      setCheckOut(`${yyyy}-${mm}-${dd}`);
      setSelectedRoomId("");
      setGuestId(guests[0]?.id || "");
      setStatus("confirmed");
      setStep(1);
      setSearchedRooms(false);
    }
  }, [reservation, guests, today]);

  const handleDateSearch = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    const resId = reservation ? reservation.id : null;
    // Filter rooms by selected hotel AND date availability
    const available = rooms.filter(room => 
      room.hotelId === hotelId &&
      isRoomAvailable(room.id, checkIn, checkOut, reservations, resId)
    );

    setAvailableRooms(available);
    setSearchedRooms(true);
    setStep(2);
  };

  const handleQuickGuestSubmit = (e) => {
    e.preventDefault();
    if (!quickGuestName.trim() || !quickGuestEmail.trim() || !quickGuestPhone.trim() || !quickGuestNid.trim() || !quickGuestPass.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    
    const isDuplicate = guests.some(g => g.email.toLowerCase() === quickGuestEmail.toLowerCase());
    if (isDuplicate) {
      alert("A guest with this email already exists.");
      return;
    }

    const newGuest = {
      id: `guest-${Date.now()}`,
      name: quickGuestName.trim(),
      email: quickGuestEmail.trim().toLowerCase(),
      phone: quickGuestPhone.trim(),
      nid: quickGuestNid.trim(),
      password: quickGuestPass.trim(),
      address: "",
      createdAt: new Date().toISOString()
    };

    onQuickAddGuest(newGuest);
    setGuestId(newGuest.id);
    setShowQuickGuest(false);
    
    // Clear state
    setQuickGuestName("");
    setQuickGuestEmail("");
    setQuickGuestPhone("");
    setQuickGuestNid("");
    setQuickGuestPass("");
  };

  const handleSaveReservation = () => {
    if (!selectedRoomId) {
      alert("Please select a room.");
      return;
    }
    if (!guestId) {
      alert("Please select a guest.");
      return;
    }

    const room = rooms.find(r => r.id === selectedRoomId);
    const nights = calculateNights(checkIn, checkOut);
    const totalPrice = nights * (room ? room.pricePerNight : 0);

    const savedReservation = {
      id: reservation ? reservation.id : `res-${Date.now()}`,
      guestId,
      roomId: selectedRoomId,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      status,
      createdAt: reservation ? reservation.createdAt : new Date().toISOString()
    };

    onSave(savedReservation);
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const nights = calculateNights(checkIn, checkOut);
  const totalCost = selectedRoom ? nights * selectedRoom.pricePerNight : 0;
  const hotelName = HOTELS.find(h => h.id === hotelId)?.name || "Unknown Hotel";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-serif text-white">
              {reservation ? "Edit Reservation" : "New Reservation"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Step {step} of 2: {step === 1 ? "Select Hotel & Booking Dates" : "Choose Suite & Guest"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/15 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step 1 */}
        {step === 1 && (
          <form onSubmit={handleDateSearch} className="p-6 space-y-6">
            
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold-400" />
                Select Hotel *
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-6 rounded-2xl border border-white/5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  Check-In Date *
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  min={reservation ? undefined : today}
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  Check-Out Date *
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  min={checkIn || today}
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {checkIn && checkOut && checkOut > checkIn && (
              <div className="text-right text-sm text-gray-400 font-medium">
                Stay duration: <strong className="text-gold-400 font-serif text-lg">{calculateNights(checkIn, checkOut)}</strong> nights
              </div>
            )}

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
                className="px-5 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-hover text-black text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Find Rooms
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Wizard Step 2 */}
        {step === 2 && (
          <div className="flex-grow flex flex-col overflow-hidden relative">
            <div className="p-6 overflow-y-auto space-y-6 flex-grow max-h-[60vh]">
              
              {/* Hotel & Dates Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs bg-white/5 border border-white/5 rounded-xl p-4 gap-2 text-gray-300">
                <div>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase">Destination</span>
                  <span className="font-semibold text-white">{hotelName}</span>
                </div>
                <div className="flex gap-4">
                  <span>Check-in: <strong className="text-white">{checkIn}</strong></span>
                  <span>Check-out: <strong className="text-white">{checkOut}</strong></span>
                  <span>Duration: <strong className="text-gold-400 font-serif">{nights} nights</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gold-400 hover:underline font-semibold cursor-pointer"
                >
                  Change Settings
                </button>
              </div>

              {/* Rooms List */}
              <div>
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Available Suites ({availableRooms.length})
                </h3>
                {availableRooms.length === 0 ? (
                  <p className="text-sm text-rose-400 py-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                    No suites available at {hotelName} for the selected dates.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                    {availableRooms.map(room => {
                      const isSelected = room.id === selectedRoomId;
                      return (
                        <div
                          key={room.id}
                          onClick={() => setSelectedRoomId(room.id)}
                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                            isSelected 
                              ? "bg-gold-primary/10 border-gold-primary shadow-lg shadow-gold-500/5"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-white block">Room {room.roomNumber}</span>
                              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{room.type}</span>
                            </div>
                            {isSelected && (
                              <span className="bg-gold-primary text-black p-0.5 rounded-full">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-baseline mt-4">
                            <span className="text-xs text-gray-400">👥 Capacity: {room.capacity}</span>
                            <span className="text-sm font-bold text-gold-400 font-serif">৳{room.pricePerNight.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">/ night</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Guest Selector */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Select Guest
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowQuickGuest(true)}
                    className="text-xs font-semibold text-gold-400 hover:text-gold-500 cursor-pointer"
                  >
                    + Quick Register Guest
                  </button>
                </div>
                {guests.length === 0 ? (
                  <p className="text-sm text-amber-400 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                    No registered guests in the directory.
                  </p>
                ) : (
                  <select
                    value={guestId}
                    onChange={e => setGuestId(e.target.value)}
                    className="w-full bg-dark-800 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  >
                    {guests.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status and Price breakdown */}
              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Booking Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-dark-800 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked In</option>
                    {reservation && <option value="checked-out">Checked Out</option>}
                    {reservation && <option value="cancelled">Cancelled</option>}
                  </select>
                </div>

                {selectedRoom && (
                  <div className="bg-gold-primary/5 rounded-xl border border-gold-primary/20 p-4 flex flex-col justify-center">
                    <span className="text-xs text-gray-400">Total Price Summary</span>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-xs text-gray-300">৳{selectedRoom.pricePerNight.toLocaleString()} × {nights} nights</span>
                      <span className="text-xl font-bold text-gold-400 font-serif">৳{totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Step 2 Footer */}
            <div className="p-6 border-t border-white/10 flex gap-3 justify-between items-center bg-black/25">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                Back
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReservation}
                  disabled={!selectedRoomId || !guestId}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    !selectedRoomId || !guestId 
                      ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed" 
                      : "bg-gold-primary hover:bg-gold-hover text-black"
                  }`}
                >
                  {reservation ? "Save Changes" : "Confirm Booking"}
                </button>
              </div>
            </div>

            {/* Quick Guest Add Form */}
            {showQuickGuest && (
              <div className="absolute inset-0 bg-dark-900/95 backdrop-blur-md z-10 flex flex-col animate-fade-in">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h3 className="text-lg font-bold font-serif text-white">Register Guest Quick Form</h3>
                  <button 
                    onClick={() => setShowQuickGuest(false)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleQuickGuestSubmit} className="p-6 space-y-4 overflow-y-auto flex-grow">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={quickGuestName}
                      onChange={e => setQuickGuestName(e.target.value)}
                      placeholder="e.g. Sakib Hasan"
                      className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={quickGuestEmail}
                      onChange={e => setQuickGuestEmail(e.target.value)}
                      placeholder="sakib@example.com"
                      className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        Phone *
                      </label>
                      <input
                        type="text"
                        value={quickGuestPhone}
                        onChange={e => setQuickGuestPhone(e.target.value)}
                        placeholder="01711223344"
                        className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                        NID / Passport *
                      </label>
                      <input
                        type="text"
                        value={quickGuestNid}
                        onChange={e => setQuickGuestNid(e.target.value)}
                        placeholder="NID Number"
                        className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Set Password *
                    </label>
                    <input
                      type="password"
                      value={quickGuestPass}
                      onChange={e => setQuickGuestPass(e.target.value)}
                      placeholder="Minimum 4 characters"
                      className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowQuickGuest(false)}
                      className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-hover text-black text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Register Guest
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
