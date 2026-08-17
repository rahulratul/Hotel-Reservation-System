// src/components/LoginModal.jsx
import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, ShieldCheck } from "lucide-react";

export default function LoginModal({ onClose, onLoginSuccess, guests, onRegisterAndLogin, addToast }) {
  const [activeTab, setActiveTab] = useState("customer"); // "customer" | "admin"
  
  // Admin credentials state
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  // Customer credentials state
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPass, setCustomerPass] = useState("");
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  
  // Customer signup state
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupNid, setSignupNid] = useState("");
  const [signupPass, setSignupPass] = useState("");

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (adminUser === "admin" && adminPass === "admin123") {
      onLoginSuccess({ role: "admin" });
      addToast("Welcome back, Manager!", "success");
      onClose();
    } else {
      addToast("Invalid credentials. Use admin / admin123.", "error");
    }
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (!customerEmail.trim()) return;

    const email = customerEmail.trim().toLowerCase();
    const guest = guests.find(g => g.email.toLowerCase() === email);

    if (guest) {
      if (guest.password === customerPass) {
        onLoginSuccess({ role: "customer", guest });
        addToast(`Welcome back, ${guest.name}!`, "success");
        onClose();
      } else {
        addToast("Incorrect password. Please try again.", "error");
      }
    } else {
      setIsNotRegistered(true);
      addToast("Email not found. Please register an account below.", "info");
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupPhone.trim() || !signupNid.trim() || !signupPass.trim()) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    if (signupName.trim().length < 2) {
      addToast("Name must be at least 2 characters.", "error");
      return;
    }
    if (signupPhone.trim().length < 8) {
      addToast("Phone must be at least 8 characters.", "error");
      return;
    }
    if (signupPass.trim().length < 4) {
      addToast("Password must be at least 4 characters.", "error");
      return;
    }

    const newGuest = {
      id: `guest-${Date.now()}`,
      name: signupName.trim(),
      email: customerEmail.trim().toLowerCase(),
      phone: signupPhone.trim(),
      nid: signupNid.trim(),
      address: "",
      password: signupPass.trim(),
      createdAt: new Date().toISOString()
    };

    onRegisterAndLogin(newGuest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-serif text-white">Sign In Gateway</h2>
            <p className="text-xs text-gold-400 font-semibold uppercase tracking-wider mt-1">AeroStay Booking Network</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Headers */}
        {!isNotRegistered && (
          <div className="flex border-b border-white/10 bg-black/10 p-1">
            <button
              onClick={() => setActiveTab("customer")}
              className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === "customer" 
                  ? "bg-gold-primary text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Guest Portal
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeTab === "admin" 
                  ? "bg-gold-primary text-black" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Manager Admin
            </button>
          </div>
        )}

        {/* Forms */}
        <div className="p-6">
          {isNotRegistered ? (
            /* Sign Up Registration */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="bg-gold-primary/5 p-3 rounded-xl border border-gold-primary/20 text-xs text-gold-200 leading-relaxed mb-4">
                The email <strong>{customerEmail}</strong> is not registered. Please fill in your profile details to create your secure account.
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-400" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  placeholder="e.g. Tanvir Hasan"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold-400" />
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    placeholder="01711223344"
                    className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                    NID / Passport *
                  </label>
                  <input
                    type="text"
                    value={signupNid}
                    onChange={e => setSignupNid(e.target.value)}
                    placeholder="National ID"
                    className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gold-400" />
                  Set Password *
                </label>
                <input
                  type="password"
                  value={signupPass}
                  onChange={e => setSignupPass(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNotRegistered(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-primary hover:bg-gold-hover text-black text-xs font-bold cursor-pointer"
                >
                  Register & Sign In
                </button>
              </div>
            </form>
          ) : activeTab === "customer" ? (
            /* Customer Sign In */
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-gold-400" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="ahmed@example.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gold-400" />
                  Password *
                </label>
                <input
                  type="password"
                  value={customerPass}
                  onChange={e => setCustomerPass(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold-primary hover:bg-gold-hover text-black font-bold text-sm py-2.5 rounded-xl transition-colors cursor-pointer mt-4"
              >
                Access Portal
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
                Pre-seeded guest: Email <strong className="text-gold-400">ahmed@example.com</strong> • Password <strong className="text-gold-400">ahmed123</strong>.
              </p>
            </form>
          ) : (
            /* Admin Sign In */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={e => setAdminUser(e.target.value)}
                  placeholder="Manager Username"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gold-400" />
                  Password *
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-gold-primary rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gold-primary hover:bg-gold-hover text-black font-bold text-sm py-2.5 rounded-xl transition-colors cursor-pointer mt-4"
              >
                Manager Sign In
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-2">
                Manager default login is username <strong className="text-gold-400">admin</strong> and password <strong className="text-gold-400">admin123</strong>.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
