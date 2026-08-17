// src/features/customer-portal/CustomerHome.jsx
import React, { useState, useEffect } from "react";
import CustomerBookingModal from "./CustomerBookingModal";
import { isRoomAvailable } from "../reservations/availability";
import { getTodayString, HOTELS } from "../../utils/helpers";
import { 
  Calendar, Search, ShieldCheck, Wifi, Tv, Wind, 
  MapPin, Sparkles, AlertCircle, Compass, Shield,
  Coffee, HelpCircle
} from "lucide-react";

export default function CustomerHome({ rooms, reservations, guests, onBook, addToast }) {
  const today = getTodayString();
  const [selectedHotelId, setSelectedHotelId] = useState("hotel-1");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  
  const [displayRooms, setDisplayRooms] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Set default checkout to tomorrow on mount
  useEffect(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const yyyy = tom.getFullYear();
    const mm = String(tom.getMonth() + 1).padStart(2, "0");
    const dd = String(tom.getDate()).padStart(2, "0");
    setCheckOut(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Sync rooms based on hotel choice and reservation changes
  useEffect(() => {
    // Show rooms for the selected hotel
    const hotelRooms = rooms.filter(r => r.hotelId === selectedHotelId);
    setDisplayRooms(hotelRooms);
  }, [selectedHotelId, rooms, reservations]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      addToast("Please select check-in and check-out dates.", "error");
      return;
    }
    if (checkOut <= checkIn) {
      addToast("Check-out date must be after check-in date.", "error");
      return;
    }

    // Filter available rooms in the selected hotel
    const hotelRooms = rooms.filter(r => r.hotelId === selectedHotelId);
    const available = hotelRooms.filter(room => 
      isRoomAvailable(room.id, checkIn, checkOut, reservations)
    );
    
    setDisplayRooms(available);
    setHasSearched(true);
    const hotelName = HOTELS.find(h => h.id === selectedHotelId)?.name;
    addToast(`Found ${available.length} available rooms at ${hotelName}!`, "success");
  };

  const handleBookClick = (room) => {
    setSelectedRoom(room);
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = (resObj, newGuestObj) => {
    onBook(resObj, newGuestObj);
    setIsBookingOpen(false);
    setSelectedRoom(null);
    addToast("Your booking was completed successfully!", "success");
    
    // Refresh availability
    const hotelRooms = rooms.filter(r => r.hotelId === selectedHotelId);
    const available = hotelRooms.filter(room => 
      isRoomAvailable(room.id, checkIn, checkOut, reservations) && room.id !== resObj.roomId
    );
    setDisplayRooms(available);
  };

  const handleBookPackage = (hotelId, roomType) => {
    setSelectedHotelId(hotelId);
    // Find room of that type in the hotel
    const matchedRoom = rooms.find(r => r.hotelId === hotelId && r.type === roomType);
    if (matchedRoom) {
      // Check if available today to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomStr = tomorrow.toISOString().split("T")[0];
      const isAvail = isRoomAvailable(matchedRoom.id, today, tomStr, reservations);
      if (isAvail) {
        setCheckIn(today);
        setCheckOut(tomStr);
        setSelectedRoom(matchedRoom);
        setIsBookingOpen(true);
      } else {
        addToast("This suite is currently occupied. Try searching different dates.", "info");
      }
    } else {
      addToast("Package suite not found.", "error");
    }
  };

  const selectedHotel = HOTELS.find(h => h.id === selectedHotelId);

  return (
    <div className="space-y-16 page-transition">

      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-white/5 p-8 md:p-16 flex flex-col justify-center items-center text-center space-y-8 bg-gradient-to-b from-gold-950/10 to-black/30">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-sm pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200')" }}></div>
        
        <div className="z-10 max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold-400 font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            StayBD Hotel Booking Network
          </span>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-white leading-tight">
            Discover Top Destinations in Bangladesh
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Book premium stays at Sayeman Beach Resort, Grand Sultan, The Palace, and other leading boutique hotels. Experience the best hospitality Bangladesh has to offer.
          </p>
        </div>

        {/* Date Search Widget */}
        <form onSubmit={handleSearch} className="w-full max-w-5xl z-10 bg-dark-800/90 border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1 w-full text-left">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold-400" />
              Select Hotel
            </label>
            <select
              value={selectedHotelId}
              onChange={e => setSelectedHotelId(e.target.value)}
              className="w-full bg-dark-800 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
            >
              {HOTELS.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.location})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full lg:w-48 text-left">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold-400" />
              Check-In
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              min={today}
              className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              required
            />
          </div>

          <div className="w-full lg:w-48 text-left">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gold-400" />
              Check-Out
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

          <button
            type="submit"
            className="w-full lg:w-auto bg-gold-primary hover:bg-gold-hover text-black font-bold text-sm px-8 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-gold-500/10 shrink-0"
          >
            <Search className="w-4 h-4" />
            Check Availability
          </button>
        </form>
      </section>

      {/* Featured Holiday Packages Section */}
      <section id="packages-section" className="space-y-6 scroll-mt-24">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-xl font-bold font-serif text-white">Signature Luxury Stays & Packages</h3>
          <p className="text-xs text-gray-400 mt-1">Special curated offers with top premium rates across our resorts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Package 1 */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between group hover:border-gold-primary/20 transition-all duration-300">
            <div className="p-6 space-y-4">
              <span className="bg-gold-primary/10 border border-gold-primary/30 text-gold-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Cox's Bazar Beachfront Escape
              </span>
              <h4 className="text-lg font-bold font-serif text-white mt-2">Sayeman Beach Honeymoon package</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enjoy a romantic deluxe stay at Sayeman Beach Resort. Includes complimentary breakfast buffet, candlelight dinner overlooking the beach, and free private pool access.
              </p>
              <div className="text-lg font-serif font-bold text-gold-400 mt-2">৳25,000 <span className="text-xs text-gray-500 font-normal">/ night</span></div>
            </div>
            <div className="p-4 bg-black/10 border-t border-white/5">
              <button 
                onClick={() => handleBookPackage("hotel-1", "deluxe")}
                className="w-full bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Book Honeymoon package
              </button>
            </div>
          </div>

          {/* Package 2 */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between group hover:border-gold-primary/20 transition-all duration-300">
            <div className="p-6 space-y-4">
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Sajek Valley Cloud Adventure
              </span>
              <h4 className="text-lg font-bold font-serif text-white mt-2">Sajek Cloud-View Lodge Package</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Stay high above the clouds in Sajek Valley Eco-Lodge's Luxury Suite. Features panoramic balconies, welcome local fresh drinks, and guided trekking tours.
              </p>
              <div className="text-lg font-serif font-bold text-gold-400 mt-2">৳15,000 <span className="text-xs text-gray-500 font-normal">/ night</span></div>
            </div>
            <div className="p-4 bg-black/10 border-t border-white/5">
              <button 
                onClick={() => handleBookPackage("hotel-4", "suite")}
                className="w-full bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Book Cloud Package
              </button>
            </div>
          </div>

          {/* Package 3 */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between group hover:border-gold-primary/20 transition-all duration-300">
            <div className="p-6 space-y-4">
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                Sreemangal Tea Retreat
              </span>
              <h4 className="text-lg font-bold font-serif text-white mt-2">Grand Sultan Tea Escape</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Rejuvenate in a luxury double room at Grand Sultan Tea Resort. Includes tea estate sightseeing guides, complimentary gym sessions, and spa vouchers.
              </p>
              <div className="text-lg font-serif font-bold text-gold-400 mt-2">৳7,500 <span className="text-xs text-gray-500 font-normal">/ night</span></div>
            </div>
            <div className="p-4 bg-black/10 border-t border-white/5">
              <button 
                onClick={() => handleBookPackage("hotel-2", "double")}
                className="w-full bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Book Tea Escape
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Available Suites Grid */}
      <section id="suites-catalog" className="space-y-6 scroll-mt-24">
        <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h3 className="text-xl font-bold font-serif text-white">
              Suites at {selectedHotel?.name}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {selectedHotel?.desc} ({selectedHotel?.location})
            </p>
          </div>
          {hasSearched && (
            <button
              onClick={() => {
                setHasSearched(false);
                const hotelRooms = rooms.filter(r => r.hotelId === selectedHotelId);
                setDisplayRooms(hotelRooms);
              }}
              className="text-xs text-gold-400 hover:underline cursor-pointer"
            >
              Reset Search Dates
            </button>
          )}
        </div>

        {displayRooms.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-white/5">
            <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
            <h3 className="text-lg font-bold font-serif text-white">No Suites Available</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm">
              We are fully occupied for the selected dates at this hotel. Try modifying check-in dates or browse other hotels.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayRooms.map(room => (
              <div 
                key={room.id}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border border-white/5 hover:border-gold-primary/20 transition-all duration-300"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <span className="text-xl font-bold font-serif text-white">Room {room.roomNumber}</span>
                    <span className="bg-white/5 border border-white/10 text-gray-300 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {room.type}
                    </span>
                  </div>
                  
                  <div className="text-lg font-bold text-gold-400 font-serif mt-3">
                    ৳{room.pricePerNight.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ night</span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-3 mt-4 leading-relaxed">
                    {room.description}
                  </p>
                </div>

                <div className="px-5 pb-5 mt-auto">
                  <div className="flex items-center gap-3 text-xs text-gray-300 border-t border-white/5 pt-3">
                    <span>👥 {room.capacity} Guest{room.capacity > 1 ? "s" : ""}</span>
                    <span>🏢 Floor {room.floor}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {room.amenities && room.amenities.slice(0, 3).map(amenity => (
                      <span key={amenity} className="bg-white/5 text-[9px] text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-black/10 border-t border-white/5">
                  <button
                    onClick={() => handleBookClick(room)}
                    className="w-full bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-center block"
                  >
                    Reserve Suite
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hotel Amenities Showcase Section */}
      <section id="amenities-section" className="space-y-6 scroll-mt-24">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-xl font-bold font-serif text-white">Resort Amenities & Premium Facilities</h3>
          <p className="text-xs text-gray-400 mt-1">Enjoy high-end leisure and dining services at any StayBD network hotel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-white/5 p-3 rounded-xl text-gold-400 border border-white/5 mt-1">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Fine Buffet Dining</h4>
              <p className="text-xs text-gray-400 mt-1">Complimentary luxury breakfast buffet with local and continental delicacies.</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-white/5 p-3 rounded-xl text-gold-400 border border-white/5 mt-1">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Guided Day Trips</h4>
              <p className="text-xs text-gray-400 mt-1">Plan boat safaris in the Sundarbans or tea estate excursions in Sylhet.</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-white/5 p-3 rounded-xl text-gold-400 border border-white/5 mt-1">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Elite Guest Lounges</h4>
              <p className="text-xs text-gray-400 mt-1">Private work desks and beverage services for Silver & Gold VIP loyalty members.</p>
            </div>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-white/5 p-3 rounded-xl text-gold-400 border border-white/5 mt-1">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">High-Speed WiFi</h4>
              <p className="text-xs text-gray-400 mt-1">Dedicated dual-band gigabit routers inside all room corridors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Checkout Modal */}
      {isBookingOpen && selectedRoom && (
        <CustomerBookingModal
          room={selectedRoom}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedRoom(null);
          }}
          onConfirm={handleConfirmBooking}
        />
      )}

    </div>
  );
}
