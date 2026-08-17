// src/App.jsx
import React, { useState, useEffect } from "react";
import DashboardPage from "./features/dashboard-guests/DashboardPage";
import RoomsPage from "./features/rooms/RoomsPage";
import ReservationsPage from "./features/reservations/ReservationsPage";
import GuestsPage from "./features/dashboard-guests/GuestsPage";
import CustomerHome from "./features/customer-portal/CustomerHome";
import CustomerDashboard from "./features/customer-portal/CustomerDashboard";
import LoginModal from "./components/LoginModal";
import Toast from "./components/Toast";
import { Storage, STORAGE_KEYS } from "./utils/storage";
import { seedDemoData, clearAllData } from "./utils/helpers";
import { 
  Hotel, LayoutDashboard, BedDouble, LogOut,
  CalendarCheck, Users, User, Menu, ShieldAlert,
  Compass, CalendarDays, Key, Sparkles
} from "lucide-react";

export default function App() {
  const [session, setSession] = useState(null); // null | { role: 'admin' } | { role: 'customer', guest: guestObj }
  const [activePage, setActivePage] = useState("home"); // admin: 'dashboard'|'rooms'|'reservations'|'guests'; customer: 'dashboard'|'book'; public: 'home'
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileVisitorMenuOpen, setMobileVisitorMenuOpen] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Load initial data from localStorage
  useEffect(() => {
    const storedRooms = Storage.getAll(STORAGE_KEYS.ROOMS);
    if (!storedRooms || storedRooms.length === 0) {
      const data = seedDemoData();
      setRooms(data.rooms);
      setGuests(data.guests);
      setReservations(data.reservations);
    } else {
      setRooms(storedRooms);
      setGuests(Storage.getAll(STORAGE_KEYS.GUESTS));
      setReservations(Storage.getAll(STORAGE_KEYS.RESERVATIONS));
    }
  }, []);

  // Update default sub-tabs when session shifts
  useEffect(() => {
    if (!session) {
      setActivePage("home");
    } else if (session.role === "admin") {
      setActivePage("dashboard");
    } else if (session.role === "customer") {
      setActivePage("dashboard");
    }
  }, [session]);

  // Toast Helpers
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // State update helpers (writes to state and local storage)
  const handleSaveRoom = (savedRoom) => {
    const updated = Storage.save(STORAGE_KEYS.ROOMS, savedRoom);
    setRooms(updated);
  };

  const handleDeleteRoom = (roomId) => {
    const updated = Storage.remove(STORAGE_KEYS.ROOMS, roomId);
    setRooms(updated);
  };

  const handleSaveGuest = (savedGuest) => {
    const updated = Storage.save(STORAGE_KEYS.GUESTS, savedGuest);
    setGuests(updated);
  };

  const handleQuickAddGuest = (newGuest) => {
    const updated = Storage.save(STORAGE_KEYS.GUESTS, newGuest);
    setGuests(updated);
    addToast(`Guest ${newGuest.name} registered and selected!`, "success");
  };

  const handleDeleteGuest = (guestId) => {
    const updated = Storage.remove(STORAGE_KEYS.GUESTS, guestId);
    setGuests(updated);
  };

  const handleSaveReservation = (savedRes) => {
    const updated = Storage.save(STORAGE_KEYS.RESERVATIONS, savedRes);
    setReservations(updated);
  };

  // Handle direct customer self-booking
  const handleCustomerBook = (resObj, newGuestObj) => {
    if (newGuestObj) {
      const updatedGuests = Storage.save(STORAGE_KEYS.GUESTS, newGuestObj);
      setGuests(updatedGuests);
    }
    const updatedRes = Storage.save(STORAGE_KEYS.RESERVATIONS, resObj);
    setReservations(updatedRes);

    // If customer is booking in public visitor mode, log them in automatically to show their dashboard!
    if (!session) {
      const activeGuest = newGuestObj || guests.find(g => g.id === resObj.guestId);
      if (activeGuest) {
        setSession({ role: "customer", guest: activeGuest });
        addToast(`Reservation confirmed! Logged into guest portal.`, "success");
      }
    }
  };

  // Handle quick guest signup from login modal
  const handleRegisterAndLogin = (newGuest) => {
    const updated = Storage.save(STORAGE_KEYS.GUESTS, newGuest);
    setGuests(updated);
    setSession({ role: "customer", guest: newGuest });
    addToast(`Account created! Welcome, ${newGuest.name}.`, "success");
  };

  const handleSeedDemo = () => {
    const data = seedDemoData();
    setRooms(data.rooms);
    setGuests(data.guests);
    setReservations(data.reservations);
  };

  const handleClearAll = () => {
    const data = clearAllData();
    setRooms(data.rooms);
    setGuests(data.guests);
    setReservations(data.reservations);
  };

  // Render navigation configurations
  const adminNavItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "rooms", label: "Rooms Catalog", icon: <BedDouble className="w-5 h-5" /> },
    { id: "reservations", label: "Reservations Book", icon: <CalendarCheck className="w-5 h-5" /> },
    { id: "guests", label: "Guests Directory", icon: <Users className="w-5 h-5" /> }
  ];

  const customerNavItems = [
    { id: "dashboard", label: "My StayDashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "book", label: "Book A Suite", icon: <Compass className="w-5 h-5" /> }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-900 text-gray-100 font-sans scroll-smooth">
      
      {/* PUBLIC VISITOR INTERFACE (Default View) */}
      {!session ? (
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Horizontal Navbar */}
          <nav className="h-20 bg-dark-800 border-b border-white/5 flex items-center justify-between px-6 md:px-12 select-none sticky top-0 z-30">
            <div className="flex items-center gap-2.5">
              <div className="bg-gold-primary/10 border border-gold-primary/30 p-1.5 rounded-lg">
                <Hotel className="w-5 h-5 text-gold-primary" />
              </div>
              <span className="text-lg font-bold font-serif text-white tracking-wide">StayBD</span>
            </div>

            {/* Functional scroll links */}
            <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-semibold text-gray-400">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection("suites-catalog")}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Suites
              </button>
              <button 
                onClick={() => scrollToSection("packages-section")}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Packages
              </button>
              <button 
                onClick={() => scrollToSection("amenities-section")}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Amenities
              </button>
            </div>

            {/* Login button & Hamburger toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-gold-primary hover:bg-gold-hover text-black font-bold text-xs px-6 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-gold-500/10 cursor-pointer"
              >
                Sign In / Register
              </button>
              
              <button
                onClick={() => setMobileVisitorMenuOpen(!mobileVisitorMenuOpen)}
                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 md:hidden cursor-pointer"
                title="Menu"
              >
                <Menu className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </nav>

          {/* Visitor Mobile Dropdown Menu */}
          {mobileVisitorMenuOpen && (
            <div className="md:hidden bg-dark-800 border-b border-white/5 p-4 space-y-3 flex flex-col sticky top-20 z-20 animate-fade-in select-none">
              <button 
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileVisitorMenuOpen(false);
                }}
                className="text-left text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors py-1.5"
              >
                Home
              </button>
              <button 
                onClick={() => {
                  scrollToSection("suites-catalog");
                  setMobileVisitorMenuOpen(false);
                }}
                className="text-left text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors py-1.5"
              >
                Suites
              </button>
              <button 
                onClick={() => {
                  scrollToSection("packages-section");
                  setMobileVisitorMenuOpen(false);
                }}
                className="text-left text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors py-1.5"
              >
                Packages
              </button>
              <button 
                onClick={() => {
                  scrollToSection("amenities-section");
                  setMobileVisitorMenuOpen(false);
                }}
                className="text-left text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors py-1.5"
              >
                Amenities
              </button>
            </div>
          )}

          {/* Main Landing content */}
          <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-7xl mx-auto w-full">
            <CustomerHome
              rooms={rooms}
              reservations={reservations}
              guests={guests}
              onBook={handleCustomerBook}
              addToast={addToast}
            />
          </main>
        </div>
      ) : (
        /* LOGGED IN MEMBER/ADMIN INTERFACE (Sidebar Layout) */
        <>
          {/* Sidebar Navigation */}
          <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-800 border-r border-white/5 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            
            <div>
              {/* Brand Logo */}
              <div className="h-20 border-b border-white/5 flex items-center gap-3 px-6 select-none">
                <div className="bg-gold-primary/10 border border-gold-primary/30 p-2 rounded-xl">
                  <Hotel className="w-6 h-6 text-gold-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-serif text-white tracking-wide leading-none">StayBD</h1>
                  <span className="text-[10px] text-gold-400 uppercase tracking-widest font-semibold block mt-1">Luxury Booking</span>
                </div>
              </div>

              {/* Identity Display block */}
              <div className="p-4 border-b border-white/5 bg-black/15 flex items-center gap-3 select-none">
                <div className="bg-gold-primary text-black p-1.5 rounded-full shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-xs font-bold text-white block leading-none truncate">
                    {session.role === "admin" ? "Manager" : session.guest.name}
                  </span>
                  <span className="text-[9px] text-gold-400 font-bold uppercase tracking-wider block mt-1">
                    {session.role === "admin" ? "Hotel Admin" : "Guest Portal"}
                  </span>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-4 space-y-1.5">
                {(session.role === "admin" ? adminNavItems : customerNavItems).map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? "bg-gold-primary text-black shadow-lg shadow-gold-500/10" 
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer Log out button */}
            <div className="p-4 border-t border-white/5">
              <button
                onClick={() => {
                  setSession(null);
                  addToast("You have successfully signed out.", "info");
                }}
                className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs py-2.5 rounded-xl border border-rose-500/20 hover:border-rose-500 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout Account
              </button>
              
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mt-4 px-1">
                <span>StayBD Network</span>
                <span>v1.3.0</span>
              </div>
            </div>

          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
          )}

          {/* Main Body */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Header */}
            <header className="h-20 bg-dark-800 border-b border-white/5 flex items-center justify-between px-6 md:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 lg:hidden cursor-pointer"
                >
                  <Menu className="w-5 h-5 text-gray-300" />
                </button>
                <h2 className="text-xl font-bold font-serif text-white tracking-wide capitalize">
                  {session.role === "admin" 
                    ? adminNavItems.find(item => item.id === activePage)?.label
                    : customerNavItems.find(item => item.id === activePage)?.label
                  }
                </h2>
              </div>
              
              {session.role === "customer" && (
                <div className="flex items-center gap-1.5 bg-gold-primary/10 border border-gold-primary/30 text-gold-400 text-xs px-3 py-1.5 rounded-full font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  Rewards Level Check
                </div>
              )}
            </header>

            {/* Page content switcher */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* Customer Logged-in view pages */}
              {session.role === "customer" && activePage === "dashboard" && (
                <CustomerDashboard
                  guest={session.guest}
                  reservations={reservations}
                  rooms={rooms}
                  onBookNewStay={() => setActivePage("book")}
                />
              )}

              {session.role === "customer" && activePage === "book" && (
                <CustomerHome
                  rooms={rooms}
                  reservations={reservations}
                  guests={guests}
                  onBook={handleCustomerBook}
                  addToast={addToast}
                />
              )}

              {/* Admin Logged-in view pages */}
              {session.role === "admin" && activePage === "dashboard" && (
                <DashboardPage
                  rooms={rooms}
                  guests={guests}
                  reservations={reservations}
                  onSeedDemo={handleSeedDemo}
                  onClearAll={handleClearAll}
                  addToast={addToast}
                />
              )}

              {session.role === "admin" && activePage === "rooms" && (
                <RoomsPage
                  rooms={rooms}
                  reservations={reservations}
                  onSaveRoom={handleSaveRoom}
                  onDeleteRoom={handleDeleteRoom}
                  addToast={addToast}
                />
              )}

              {session.role === "admin" && activePage === "reservations" && (
                <ReservationsPage
                  rooms={rooms}
                  guests={guests}
                  reservations={reservations}
                  onSaveReservation={handleSaveReservation}
                  onQuickAddGuest={handleQuickAddGuest}
                  addToast={addToast}
                />
              )}

              {session.role === "admin" && activePage === "guests" && (
                <GuestsPage
                  guests={guests}
                  reservations={reservations}
                  onSaveGuest={handleSaveGuest}
                  onDeleteGuest={handleDeleteGuest}
                  addToast={addToast}
                />
              )}
            </main>

          </div>
        </>
      )}

      {/* Login Portal Trigger Modal */}
      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(newSession) => setSession(newSession)}
          onRegisterAndLogin={handleRegisterAndLogin}
          guests={guests}
          addToast={addToast}
        />
      )}

      {/* Global Toast Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

    </div>
  );
}
