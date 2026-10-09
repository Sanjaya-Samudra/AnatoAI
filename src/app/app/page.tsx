"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import BodyPartSearch from "@/components/BodyPartSearch";
import SceneBoundary from "@/components/SceneBoundary";
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false, loading: () => <div role="status" className="flex h-full items-center justify-center text-sm text-blue-600">Preparing the 3D viewer…</div> });
import Overlay from "@/components/Overlay";
import { Activity, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavigationRail } from "@/components/NavigationRail";
import Link from "next/link";
import Image from "next/image";

export default function AppPage() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [viewMode, setViewMode] = useState<"full" | "head" | "torso" | "left-hand" | "right-hand" | "left-leg" | "right-leg">("full");

  const handleSidebarClick = (partName: string) => {
    // Map internal IDs to view modes if necessary, but NavigationRail uses IDs that match viewMode
    // Actually partName coming from NavigationRail will be the ID (e.g., "head", "full")
    // Let's assume onSelect passes the ID directly.
    const validViews: React.ComponentProps<typeof Scene>["viewMode"][] = ["full", "head", "torso", "left-hand", "right-hand", "left-leg", "right-leg"];
    const nextView = validViews.find((view) => view === partName);
    if (!nextView) return;
    setViewMode(nextView);
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
    <main className="relative w-full h-dvh overflow-hidden bg-gradient-to-b from-blue-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 transition-colors duration-500">
      {/* Fixed Header at Top */}
      <header className="fixed top-0 left-0 w-full p-2 md:p-4 z-40 pointer-events-none">
        <div className="px-2 py-2 md:px-6 md:py-4 flex justify-between items-center pointer-events-auto max-w-7xl mx-auto">
          {/* Logo and Tagline */}
          <Link href="/landing" className="flex items-center gap-2 md:gap-4 cursor-pointer">
            <div className="relative w-9 h-9 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-lg shadow-blue-500/30 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Image 
                src="/Asset-2.png" 
                alt="AnatoAI Logo" 
                fill
                sizes="(max-width: 767px) 36px, 48px"
                className="object-contain p-2"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight font-sans">AnatoAI</h1>
              <p className="hidden md:block text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider font-sans">Interactive Health Assistant</p>
            </div>
          </Link>

          {/* Gender Toggle */}
          <div className="bg-blue-50/80 dark:bg-slate-800/80 backdrop-blur-sm p-1 rounded-xl shadow-md border border-blue-200/50 dark:border-slate-700/50 flex gap-1">
            <button
              aria-pressed={gender === "male"}
              onClick={() => { setGender("male"); setSelectedPart(null); }}
              className={`px-3 md:px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 font-sans ${
                gender === "male"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Male
            </button>
            <button
              aria-pressed={gender === "female"}
              onClick={() => { setGender("female"); setSelectedPart(null); }}
              className={`px-3 md:px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 font-sans ${
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
      <div className={selectedPart ? "hidden md:block" : ""}><NavigationRail onSelect={handleSidebarClick} activeMode={viewMode} /></div>
      <div className={`fixed left-4 right-4 top-20 z-40 md:left-28 md:top-28 ${selectedPart ? 'md:right-[500px]' : 'md:right-auto'}`}><BodyPartSearch key={`${gender}-${viewMode}`} gender={gender} viewMode={viewMode} onSelect={(name, view) => { setViewMode(view); setSelectedPart(name); }} /></div>

      <div className={selectedPart ? "hidden md:block" : ""}><ThemeToggle aboveMobileNavigation /></div>

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setSelectedPart("AnatoAI Assistant")}
        className={`fixed bottom-20 md:bottom-6 right-6 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 group shadow-blue-500/30 hover:scale-110 ${
          selectedPart ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"
        }`}
        aria-label="Open Chat Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* 3D Scene */}
      <div className={`absolute inset-0 z-0 ${selectedPart ? "bottom-[62dvh] top-28 md:top-0 md:bottom-0 md:right-[480px]" : ""}`}>
        <SceneBoundary><Scene onSelectPart={handlePartSelect} selectedPart={selectedPart} gender={gender} viewMode={viewMode} /></SceneBoundary>
      </div>

      {/* Fixed Notification Button */}
      {!selectedPart && viewMode === "full" && (
        <div className="fixed bottom-36 md:bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl px-4 py-3 rounded-full shadow-2xl border border-blue-200/50 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs md:text-sm font-semibold animate-pulse font-sans">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Click on a body part to analyze</span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <Overlay selectedPart={selectedPart} onClose={() => setSelectedPart(null)} gender={gender} viewMode={viewMode} />
    </main>
  );
}
