"use client";

import React, { useState } from "react";
import Scene from "@/components/Scene";
import Overlay from "@/components/Overlay";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavigationRail } from "@/components/NavigationRail";
import Link from "next/link";

export default function AppPage() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [viewMode, setViewMode] = useState<"full" | "head" | "torso" | "left-hand" | "right-hand" | "left-leg" | "right-leg">("full");

  const handleSidebarClick = (partName: string) => {
    // Map internal IDs to view modes if necessary, but NavigationRail uses IDs that match viewMode
    // Actually partName coming from NavigationRail will be the ID (e.g., "head", "full")
    // Let's assume onSelect passes the ID directly.
    setViewMode(partName as any);
    setSelectedPart(null);
  };

  const handlePartSelect = (partName: string) => {
    // This logic maps 3D click names to view modes or selection
    if (partName === "Head") setViewMode("head");
    else if (partName === "Torso") setViewMode("torso");
    else if (partName === "Left Hand") setViewMode("left-hand");
    else if (partName === "Right Hand") setViewMode("right-hand");
    else if (partName === "Left Leg") setViewMode("left-leg");
    else if (partName === "Right Leg") setViewMode("right-leg");
    else setSelectedPart(partName);
    
    if (["Head", "Torso", "Left Hand", "Right Hand", "Left Leg", "Right Leg", "Full Body"].includes(partName)) {
        setSelectedPart(null);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 transition-colors duration-500">
      {/* Fixed Header at Top */}
      <header className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none">
        <div className="px-6 py-4 flex justify-between items-center pointer-events-auto max-w-7xl mx-auto">
          {/* Logo and Tagline */}
          <Link href="/landing" className="flex items-center gap-4 cursor-pointer">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-sans">AnatoAI</h1>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-sans">Interactive Health Assistant</p>
            </div>
          </Link>

          {/* Gender Toggle */}
          <div className="bg-blue-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-xl shadow-md border border-blue-200/50 dark:border-slate-700/50 flex gap-1">
            <button
              onClick={() => setGender("male")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 font-sans ${
                gender === "male"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 font-sans ${
                gender === "female"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </header>

      {/* Left Sidebar Navigation */}
      <NavigationRail onSelect={handleSidebarClick} activeMode={viewMode} />

      <ThemeToggle />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene onSelectPart={handlePartSelect} selectedPart={selectedPart} gender={gender} viewMode={viewMode} />
      </div>

      {/* Fixed Notification Button */}
      {!selectedPart && viewMode === "full" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-6 py-3.5 rounded-full shadow-2xl border border-blue-200/50 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold animate-pulse font-sans">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Click on a body part to analyze</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <Overlay selectedPart={selectedPart} onClose={() => setSelectedPart(null)} gender={gender} />
    </main>
  );
}
