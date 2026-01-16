"use client";

import React from "react";
import { User, Brain, Shirt, Hand, Footprints, LayoutGrid } from "lucide-react";

interface NavigationRailProps {
  onSelect: (mode: string) => void;
  activeMode: string;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({ onSelect, activeMode }) => {
  const navItems = [
    { id: "full", label: "Full Body", icon: User },
    { id: "head", label: "Head Region", icon: Brain },
    { id: "torso", label: "Torso", icon: Shirt },
    { id: "left-hand", label: "Left Hand", icon: Hand }, // Hand icon might need rotation for L/R distinguishing if needed, but generic Hand is fine
    { id: "right-hand", label: "Right Hand", icon: Hand },
    { id: "left-leg", label: "Left Leg", icon: Footprints },
    { id: "right-leg", label: "Right Leg", icon: Footprints },
  ];

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-6 z-40 pointer-events-auto">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-blue-100/50 dark:border-slate-700/50 flex flex-col gap-2 transition-all duration-300 ease-out w-14 hover:w-48 overflow-hidden group">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center gap-4 p-2.5 rounded-xl transition-all duration-200 relative ${
              activeMode === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            <div className={`min-w-[20px] flex items-center justify-center`}>
               <item.icon className={`w-5 h-5 ${(item.id === "left-hand" || item.id === "left-leg") ? "-scale-x-100" : ""}`} />
            </div>
            
            <span className={`font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-12 delay-75`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
