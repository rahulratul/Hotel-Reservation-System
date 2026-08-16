// js/seed.js

/**
 * Seeds initial demo data for rooms, guests, and reservations.
 */
function seedData() {
  const existingRooms = Storage.getAll("hrs_rooms");
  if (existingRooms && existingRooms.length > 0) {
    showNotification("Data already exists. Clear data first.", "error");
    return;
  }

  // 1. Create 8 Rooms
  const rooms = [
    {
      id: generateId("room"),
      roomNumber: "101",
      type: "single",
      pricePerNight: 80,
      capacity: 1,
      amenities: ["wifi", "tv"],
      floor: 1,
      description: "Cozy single room with high-speed wifi and smart TV.",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("room"),
      roomNumber: "102",
      type: "single",
      pricePerNight: 80,
      capacity: 1,
      amenities: ["wifi", "desk"],
      floor: 1,
      description: "Comfortable single room ideal for solo travelers and business guests.",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("room"),
      roomNumber: "103",
      type: "single",
      pricePerNight: 80,
      capacity: 1,
      amenities: ["wifi", "tv", "ac"],
      floor: 1,
      description: "Standard single room with climate control and garden view.",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("room"),
      roomNumber: "201",
      type: "double",
      pricePerNight: 120,
      capacity: 2,
      amenities: ["wifi", "tv", "ac"],
      floor: 2,
      description: "Spacious double room with queen-sized bed and city view.",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("room"),
      roomNumber: "202",
      type: "double",
      pricePerNight: 120,
      capacity: 2,
      amenities: ["wifi", "tv", "ac", "balcony"],
      floor: 2,
      description: "Delightful double room featuring a private sunset balcony.",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("room"),
      roomNumber: "301",
      type: "suite",
      pricePerNight: 250,
      capacity: 3,
      amenities: ["wifi", "tv", "ac", "minibar", "balcony"],
      floor: 3,
      description: "Luxury executive suite with separate lounge and premium minibar.",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("room"),
      roomNumber: "302",
      type: "suite",
      pricePerNight: 250,
      capacity: 3,
      amenities: ["wifi", "tv", "ac", "minibar", "jacuzzi"],
      floor: 3,
      description: "Signature suite with private jacuzzi and panoramic skyline view.",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("room"),
      roomNumber: "401",
      type: "deluxe",
      pricePerNight: 350,
      capacity: 4,
      amenities: ["wifi", "tv", "ac", "minibar", "balcony", "safe", "kitchenette"],
      floor: 4,
      description: "Presidential deluxe suite with family living space and private kitchenette.",
      createdAt: new Date().toISOString()
    }
  ];

  rooms.forEach(room => Storage.save("hrs_rooms", room));

  // 2. Create 5 Guests
  const guests = [
    {
      id: generateId("guest"),
      name: "Ahmed Rahman",
      email: "ahmed.rahman@example.com",
      phone: "01711223344",
      nid: "1990269123456",
      address: "Gulshan-2, Dhaka",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("guest"),
      name: "Fatima Yasmin",
      email: "fatima.yasmin@example.com",
      phone: "01822334455",
      nid: "1994389654321",
      address: "Agrabad, Chittagong",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("guest"),
      name: "Tanvir Hasan",
      email: "tanvir.hasan@example.com",
      phone: "01933445566",
      nid: "1988574123987",
      address: "Zindabazar, Sylhet",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("guest"),
      name: "Sabrina Chowdhury",
      email: "sabrina.chowdhury@example.com",
      phone: "01644556677",
      nid: "1995874561230",
      address: "Dhanmondi, Dhaka",
      createdAt: new Date().toISOString()
    },
    {
      id: generateId("guest"),
      name: "Mahmudul Karim",
      email: "mahmudul.karim@example.com",
      phone: "01555667788",
      nid: "1982741852963",
      address: "Shaheb Bazar, Rajshahi",
      createdAt: new Date().toISOString()
    }
  ];

  guests.forEach(guest => Storage.save("hrs_guests", guest));

  // Helper date generators for relative dates
  const today = new Date();
  const getRelativeDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // 3. Create 6 Reservations
  const reservationSpecs = [
    // 2 Confirmed (Upcoming arrivals within next 7 days)
    {
      guestId: guests[0].id,
      roomId: rooms[0].id, // Room 101, $80
      checkIn: getRelativeDate(1), // Tomorrow
      checkOut: getRelativeDate(4),
      status: "confirmed"
    },
    {
      guestId: guests[1].id,
      roomId: rooms[3].id, // Room 201, $120
      checkIn: getRelativeDate(3), // In 3 days
      checkOut: getRelativeDate(6),
      status: "confirmed"
    },
    // 1 Checked-in (check-in yesterday, checkout in 3 days)
    {
      guestId: guests[2].id,
      roomId: rooms[5].id, // Room 301, $250
      checkIn: getRelativeDate(-1), // Yesterday
      checkOut: getRelativeDate(3),
      status: "checked-in"
    },
    // 2 Checked-out (past dates for revenue)
    {
      guestId: guests[3].id,
      roomId: rooms[1].id, // Room 102, $80
      checkIn: getRelativeDate(-10),
      checkOut: getRelativeDate(-7),
      status: "checked-out"
    },
    {
      guestId: guests[4].id,
      roomId: rooms[7].id, // Room 401, $350
      checkIn: getRelativeDate(-6),
      checkOut: getRelativeDate(-2),
      status: "checked-out"
    },
    // 1 Cancelled
    {
      guestId: guests[0].id,
      roomId: rooms[4].id, // Room 202, $120
      checkIn: getRelativeDate(-15),
      checkOut: getRelativeDate(-12),
      status: "cancelled"
    }
  ];

  reservationSpecs.forEach(spec => {
    const room = rooms.find(r => r.id === spec.roomId);
    const nights = calculateNights(spec.checkIn, spec.checkOut);
    const totalPrice = nights * (room ? room.pricePerNight : 100);

    const resObj = {
      id: generateId("res"),
      guestId: spec.guestId,
      roomId: spec.roomId,
      checkIn: spec.checkIn,
      checkOut: spec.checkOut,
      nights: nights,
      totalPrice: totalPrice,
      status: spec.status,
      createdAt: new Date().toISOString()
    };

    Storage.save("hrs_reservations", resObj);
  });

  showNotification("Sample data loaded successfully!", "success");
}

/**
 * Clears all room, guest, and reservation records from storage.
 */
function clearAllData() {
  Storage.clear("hrs_rooms");
  Storage.clear("hrs_reservations");
  Storage.clear("hrs_guests");
  showNotification("All data cleared successfully.", "info");
}
