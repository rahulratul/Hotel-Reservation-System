// src/utils/helpers.js
import { Storage, STORAGE_KEYS } from "./storage";

export const HOTELS = [
  { id: "hotel-1", name: "Sayeman Beach Resort", location: "Cox's Bazar", desc: "Oceanfront luxury steps from the sandy shores of Cox's Bazar." },
  { id: "hotel-2", name: "Grand Sultan Tea Resort & Golf", location: "Sreemangal", desc: "Five-star luxury nested within lush tea hills of Sreemangal." },
  { id: "hotel-3", name: "The Palace Luxury Resort", location: "Habiganj, Sylhet", desc: "A majestic forest resort in Habiganj with premium private villas." },
  { id: "hotel-4", name: "Sajek Cloud Eco-Lodge", location: "Sajek Valley", desc: "Traditional wooden cottages floating above the clouds of Sajek Valley." },
  { id: "hotel-5", name: "Pan Pacific Sonargaon", location: "Dhaka", desc: "Premium five-star corporate hotel in the heart of Dhaka City." },
  { id: "hotel-6", name: "Rose View Hotel", location: "Sylhet City", desc: "Elegant city hotel with outstanding mountain vistas and skyline lounges." },
  { id: "hotel-7", name: "Sundarbans Eco Mangrove Lodge", location: "Sundarbans", desc: "Nature-immersive safari cabins in the heart of the mangrove forest." },
  { id: "hotel-8", name: "Long Beach Hotel", location: "Cox's Bazar", desc: "Modern hotel providing ocean views and indoor pool access." },
  { id: "hotel-9", name: "Momo Inn", location: "Bogura", desc: "Top-tier leisure resort with a scenic private boating lake in Bogura." },
  { id: "hotel-10", name: "Kuakata Grand Hotel", location: "Kuakata", desc: "Watch both the sunrise and sunset right from the beachfront resort." }
];

export function generateId(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  const dateObj = new Date(dateString.includes("T") ? dateString : `${dateString}T00:00:00`);
  return dateObj.toLocaleDateString("en-US", options);
}

export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = end - start;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getRelativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Seeds initial demo data for hotels, rooms, guests, and reservations.
 */
export function seedDemoData() {
  Storage.clear(STORAGE_KEYS.ROOMS);
  Storage.clear(STORAGE_KEYS.GUESTS);
  Storage.clear(STORAGE_KEYS.RESERVATIONS);

  // 1. Create 40 Rooms (4 rooms in each of the 10 hotels)
  const rooms = [];
  HOTELS.forEach((hotel) => {
    const roomConfigs = [
      { roomNumber: "101", type: "single", price: 4000, floor: 1 },
      { roomNumber: "102", type: "double", price: 7500, floor: 1 },
      { roomNumber: "201", type: "suite", price: 15000, floor: 2 },
      { roomNumber: "202", type: "deluxe", price: 25000, floor: 2 }
    ];

    roomConfigs.forEach((config) => {
      rooms.push({
        id: `room-${hotel.id}-${config.roomNumber}`,
        hotelId: hotel.id,
        roomNumber: config.roomNumber,
        type: config.type,
        pricePerNight: config.price,
        capacity: config.type === "single" ? 1 : config.type === "double" ? 2 : config.type === "suite" ? 3 : 4,
        amenities: config.type === "single" ? ["wifi", "tv"] : config.type === "double" ? ["wifi", "tv", "ac", "balcony"] : config.type === "suite" ? ["wifi", "tv", "ac", "minibar", "jacuzzi"] : ["wifi", "tv", "ac", "minibar", "balcony", "safe", "kitchenette"],
        floor: config.floor,
        description: `${hotel.name}'s premium ${config.type} room featuring high-class furniture and specialized guest care.`,
        createdAt: new Date().toISOString()
      });
    });
  });

  rooms.forEach(room => Storage.save(STORAGE_KEYS.ROOMS, room));

  // 2. Create 10 Guests with passwords
  const guests = [
    { id: "guest-1", name: "Ahmed Rahman", email: "ahmed@example.com", phone: "01711223344", nid: "1990269123456", address: "Gulshan-2, Dhaka", password: "ahmed123", createdAt: new Date().toISOString() },
    { id: "guest-2", name: "Fatima Yasmin", email: "fatima@example.com", phone: "01822334455", nid: "1994389654321", address: "Agrabad, Chittagong", password: "fatima123", createdAt: new Date().toISOString() },
    { id: "guest-3", name: "Tanvir Hasan", email: "tanvir@example.com", phone: "01933445566", nid: "1988574123987", address: "Zindabazar, Sylhet", password: "tanvir123", createdAt: new Date().toISOString() },
    { id: "guest-4", name: "Sabrina Chowdhury", email: "sabrina@example.com", phone: "01644556677", nid: "1995874561230", address: "Dhanmondi, Dhaka", password: "sabrina123", createdAt: new Date().toISOString() },
    { id: "guest-5", name: "Mahmudul Karim", email: "mahmudul@example.com", phone: "01555667788", nid: "1982741852963", address: "Shaheb Bazar, Rajshahi", password: "mahmudul123", createdAt: new Date().toISOString() },
    { id: "guest-6", name: "Anika Tabassum", email: "anika@example.com", phone: "01744552211", nid: "1993452145698", address: "Uttara, Dhaka", password: "anika123", createdAt: new Date().toISOString() },
    { id: "guest-7", name: "Sakib Al Hasan", email: "sakib@example.com", phone: "01833441122", nid: "1987541258963", address: "Magura, Khulna", password: "sakib123", createdAt: new Date().toISOString() },
    { id: "guest-8", name: "Nusrat Jahan", email: "nusrat@example.com", phone: "01944553311", nid: "1992451247852", address: "Halishahar, Chittagong", password: "nusrat123", createdAt: new Date().toISOString() },
    { id: "guest-9", name: "Asif Iqbal", email: "asif@example.com", phone: "01633445599", nid: "1989451236547", address: "Jessore City", password: "asif123", createdAt: new Date().toISOString() },
    { id: "guest-10", name: "Farhana Amin", email: "farhana@example.com", phone: "01522336688", nid: "1996523654789", address: "Mymensingh Town", password: "farhana123", createdAt: new Date().toISOString() }
  ];

  guests.forEach(guest => Storage.save(STORAGE_KEYS.GUESTS, guest));

  // Helper date generators for relative dates
  const reservationSpecs = [
    // 6 Confirmed stays (upcoming)
    { guestId: "guest-1", roomId: `room-hotel-1-201`, checkIn: getRelativeDate(1), checkOut: getRelativeDate(4), status: "confirmed" }, // Sayeman Suite, 15000 * 3 = 45,000
    { guestId: "guest-2", roomId: `room-hotel-2-202`, checkIn: getRelativeDate(3), checkOut: getRelativeDate(6), status: "confirmed" }, // Grand Sultan Deluxe, 25000 * 3 = 75,000
    { guestId: "guest-6", roomId: `room-hotel-4-201`, checkIn: getRelativeDate(2), checkOut: getRelativeDate(5), status: "confirmed" }, // Sajek Suite, 15000 * 3 = 45,000
    { guestId: "guest-7", roomId: `room-hotel-5-102`, checkIn: getRelativeDate(4), checkOut: getRelativeDate(7), status: "confirmed" }, // Sonargaon Double, 7500 * 3 = 22,500
    { guestId: "guest-8", roomId: `room-hotel-7-101`, checkIn: getRelativeDate(1), checkOut: getRelativeDate(3), status: "confirmed" }, // Sundarbans Single, 4000 * 2 = 8,000
    { guestId: "guest-9", roomId: `room-hotel-9-202`, checkIn: getRelativeDate(5), checkOut: getRelativeDate(10), status: "confirmed" }, // Momo Deluxe, 25000 * 5 = 125,000

    // 4 Checked-in stays (current)
    { guestId: "guest-3", roomId: `room-hotel-3-201`, checkIn: getRelativeDate(-1), checkOut: getRelativeDate(3), status: "checked-in" }, // The Palace Suite, 15000 * 4 = 60,000
    { guestId: "guest-4", roomId: `room-hotel-6-102`, checkIn: getRelativeDate(-2), checkOut: getRelativeDate(2), status: "checked-in" }, // Rose View Double, 7500 * 4 = 30,000
    { guestId: "guest-10", roomId: `room-hotel-8-202`, checkIn: getRelativeDate(-1), checkOut: getRelativeDate(4), status: "checked-in" }, // Long Beach Deluxe, 25000 * 5 = 125,000
    { guestId: "guest-5", roomId: `room-hotel-10-101`, checkIn: getRelativeDate(-3), checkOut: getRelativeDate(1), status: "checked-in" }, // Kuakata Single, 4000 * 4 = 16,000

    // 6 Checked-out stays (past stays for realized revenue)
    { guestId: "guest-1", roomId: `room-hotel-1-102`, checkIn: getRelativeDate(-10), checkOut: getRelativeDate(-7), status: "checked-out" }, // Sayeman Double, 7500 * 3 = 22,500
    { guestId: "guest-2", roomId: `room-hotel-2-201`, checkIn: getRelativeDate(-8), checkOut: getRelativeDate(-5), status: "checked-out" }, // Grand Sultan Suite, 15000 * 3 = 45,000
    { guestId: "guest-3", roomId: `room-hotel-3-101`, checkIn: getRelativeDate(-12), checkOut: getRelativeDate(-10), status: "checked-out" }, // The Palace Single, 4000 * 2 = 8,000
    { guestId: "guest-4", roomId: `room-hotel-4-202`, checkIn: getRelativeDate(-6), checkOut: getRelativeDate(-2), status: "checked-out" }, // Sajek Deluxe, 25000 * 4 = 100,000
    { guestId: "guest-5", roomId: `room-hotel-5-201`, checkIn: getRelativeDate(-14), checkOut: getRelativeDate(-10), status: "checked-out" }, // Sonargaon Suite, 15000 * 4 = 60,000
    { guestId: "guest-6", roomId: `room-hotel-6-202`, checkIn: getRelativeDate(-15), checkOut: getRelativeDate(-11), status: "checked-out" }, // Rose View Deluxe, 25000 * 4 = 100,000

    // 2 Cancelled stays
    { guestId: "guest-7", roomId: `room-hotel-8-101`, checkIn: getRelativeDate(-15), checkOut: getRelativeDate(-12), status: "cancelled" }, // Long Beach Single
    { guestId: "guest-8", roomId: `room-hotel-10-201`, checkIn: getRelativeDate(-20), checkOut: getRelativeDate(-17), status: "cancelled" } // Kuakata Suite
  ];

  const reservations = reservationSpecs.map((spec, index) => {
    const room = rooms.find(r => r.id === spec.roomId);
    const nights = calculateNights(spec.checkIn, spec.checkOut);
    const totalPrice = nights * (room ? room.pricePerNight : 1000);

    return {
      id: `res-${index + 1}`,
      guestId: spec.guestId,
      roomId: spec.roomId,
      checkIn: spec.checkIn,
      checkOut: spec.checkOut,
      nights: nights,
      totalPrice: totalPrice,
      status: spec.status,
      createdAt: new Date().toISOString()
    };
  });

  reservations.forEach(res => Storage.save(STORAGE_KEYS.RESERVATIONS, res));

  return { rooms, guests, reservations };
}

export function clearAllData() {
  Storage.clear(STORAGE_KEYS.ROOMS);
  Storage.clear(STORAGE_KEYS.GUESTS);
  Storage.clear(STORAGE_KEYS.RESERVATIONS);
  return { rooms: [], guests: [], reservations: [] };
}
