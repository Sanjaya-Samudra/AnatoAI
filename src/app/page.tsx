"use client";

import React, { useState } from "react";
import Scene from "@/components/Scene";
import Overlay from "@/components/Overlay";
import { FULL_BODY_PARTS } from "@/components/BodyModel";
import { Activity, ArrowLeft, User, Brain } from "lucide-react";

export default function Home() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [viewMode, setViewMode] = useState<"full" | "head">("full");

  const handleSidebarClick = (partName: string) => {
    if (partName === "Head") {
      setViewMode("head");
      setSelectedPart(null); // Clear selection so overlay doesn't show
    } else if (partName === "Full Body") {
      setViewMode("full");
      setSelectedPart(null);
    } else {
      setViewMode("full");
      setSelectedPart(partName);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-50">
      {/* Navbar / Header */}
      <header className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none flex justify-between items-start">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AnatoAI</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Health Assistant</p>
          </div>
        </div>

        {/* Gender Toggle */}
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/50 flex gap-1">
          <button
            onClick={() => setGender("male")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              gender === "male"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGender("female")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
              gender === "female"
                ? "bg-rose-500 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            Female
          </button>
        </div>
      </header>

      {/* Left Sidebar Navigation */}
      <div className="absolute top-40 left-6 z-10 pointer-events-auto">
        <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/60 flex flex-col gap-2 w-[68px] hover:w-48 transition-all duration-300 ease-out group overflow-hidden">
          
          <button
            onClick={() => handleSidebarClick("Full Body")}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
              viewMode === "full"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <User className="w-6 h-6 min-w-[24px]" />
            <span className="font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">
              Full Body
            </span>
          </button>

          <button
            onClick={() => handleSidebarClick("Head")}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
              viewMode === "head"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Brain className="w-6 h-6 min-w-[24px]" />
            <span className="font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">
              Head Region
            </span>
          </button>

        </div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene onSelectPart={setSelectedPart} selectedPart={selectedPart} gender={gender} viewMode={viewMode} />
      </div>

      {/* Instructions / Hint */}
      {!selectedPart && viewMode === "full" && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl border border-white/50 text-slate-600 text-sm font-medium animate-bounce">
            Click on a body part to analyze
          </div>
        </div>
      )}

      {/* Overlay */}
      <Overlay selectedPart={selectedPart} onClose={() => setSelectedPart(null)} gender={gender} />
    </main>
  );
}
