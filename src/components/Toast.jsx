// src/components/Toast.jsx
import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-950/80 border-emerald-500/30 text-emerald-200",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    },
    error: {
      bg: "bg-rose-950/80 border-rose-500/30 text-rose-200",
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
    },
    info: {
      bg: "bg-blue-950/80 border-blue-500/30 text-blue-200",
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />
    }
  };

  const style = config[type] || config.info;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 pointer-events-auto min-w-[320px] max-w-md ${style.bg} animate-slide-in`}>
      {style.icon}
      <span className="text-sm font-medium font-sans flex-grow">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
