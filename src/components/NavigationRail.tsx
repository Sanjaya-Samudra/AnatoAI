"use client";

import React from "react";
// import { User, Brain, Shirt, Hand, Footprints, LayoutGrid } from "lucide-react";

interface NavigationRailProps {
  onSelect: (mode: string) => void;
  activeMode: string;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({ onSelect, activeMode }) => {
  const navItems = [
    { id: "full", label: "Full Body", image: "/navigation/full-body.svg" },
    { id: "head", label: "Head Region", image: "/navigation/head.svg" },
    { id: "torso", label: "Torso", image: "/navigation/torso.svg" },
    { id: "left-hand", label: "Left Hand", image: "/navigation/hand.svg" }, // Use hand.svg, standard for left
    { id: "right-hand", label: "Right Hand", image: "/navigation/hand.svg", flip: true }, // Use hand.svg, flipped for right
    { id: "left-leg", label: "Left Leg", image: "/navigation/right-leg.svg", flip: true }, // Use right-leg.svg, flipped for left
    { id: "right-leg", label: "Right Leg", image: "/navigation/right-leg.svg" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-6 z-40 pointer-events-auto">
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800 flex flex-row md:flex-col gap-1 transition-all cubic-bezier(0.4, 0, 0.2, 1) duration-300 w-auto md:w-16 md:hover:w-60 md:focus-within:w-60 overflow-hidden group">
        {navItems.map((item) => (
          <button
            key={item.id}
            aria-label={item.label}
            aria-pressed={activeMode === item.id}
            onClick={() => onSelect(item.id)}
            className={`flex items-center p-1.5 md:p-2 rounded-xl transition-all duration-200 relative group/btn overflow-hidden w-full ${
              activeMode === item.id
                ? "bg-blue-600 shadow-md shadow-blue-500/30"
                : "hover:bg-blue-50 dark:hover:bg-slate-800/50"
            }`}
          >
            {/* Centered Icon Container */}
            <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                 <div 
                   className={`w-full h-full transition-all duration-200 ${
                     activeMode === item.id 
                       ? "bg-white" 
                       : "bg-slate-600 dark:bg-slate-400 group-hover:bg-blue-600 dark:group-hover:bg-blue-400"
                   } ${item.flip ? "-scale-x-100" : ""}`}
                   style={{ 
                     maskImage: `url(${item.image})`,
                     WebkitMaskImage: `url(${item.image})`,
                     maskSize: "contain",
                     WebkitMaskSize: "contain",
                     maskRepeat: "no-repeat",
                     WebkitMaskRepeat: "no-repeat",
                     maskPosition: "center",
                     WebkitMaskPosition: "center"
                   }}
                 />
            </div>
            
            {/* Text Label */}
            <span className={`hidden md:block font-medium text-sm whitespace-nowrap pl-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-200 delay-75 absolute left-12 ${
              activeMode === item.id ? "text-white" : "text-slate-600 dark:text-slate-300"
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
