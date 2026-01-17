"use client";

import React, { useState } from "react";
import Scene from "@/components/Scene";
import Overlay from "@/components/Overlay";
import { Footprints } from "lucide-react";
import Image from "next/image";

export default function AppPage() {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [viewMode, setViewMode] = useState<"full" | "head" | "torso" | "left-hand" | "right-hand" | "right-leg">("full");

  const handleSidebarClick = (partName: string) => {
    if (partName === "Head") {
      setViewMode("head");
      setSelectedPart(null);
    } else if (partName === "Torso") {
      setViewMode("torso");
      setSelectedPart(null);
    } else if (partName === "Full Body") {
      setViewMode("full");
      setSelectedPart(null);
    } else if (partName === "Left Hand") {
      setViewMode("left-hand");
      setSelectedPart(null);
    } else if (partName === "Right Hand") {
      setViewMode("right-hand");
      setSelectedPart(null);
    } else if (partName === "Right Leg") {
      setViewMode("right-leg");
      setSelectedPart(null);
    } else {
      setViewMode("full");
      setSelectedPart(partName);
    }
  };

  const handlePartSelect = (partName: string) => {
    if (partName === "Head") {
      setViewMode("head");
      setSelectedPart(null);
    } else if (partName === "Torso") {
      setViewMode("torso");
      setSelectedPart(null);
    } else if (partName === "Left Hand") {
      setViewMode("left-hand");
      setSelectedPart(null);
    } else if (partName === "Right Hand") {
      setViewMode("right-hand");
      setSelectedPart(null);
    } else if (partName === "Right Leg") {
      setViewMode("right-leg");
      setSelectedPart(null);
    } else {
      setSelectedPart(partName);
    }
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      {/* Fixed Header at Top */}
      <header className="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none">
        <div className="px-6 py-4 flex justify-between items-center pointer-events-auto max-w-7xl mx-auto">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
              <Image src="/LOGO1.png" alt="AnatoAI Logo" width={24} height={24} className="brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">AnatoAI</h1>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider font-sans">Interactive Health Assistant</p>
            </div>
          </div>

          {/* Gender Toggle */}
          <div className="bg-blue-50/80 backdrop-blur-sm p-1 rounded-xl shadow-md border border-blue-200/50 flex gap-1">
            <button
              onClick={() => setGender("male")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 font-sans ${
                gender === "male"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-white hover:text-blue-600"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 font-sans ${
                gender === "female"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-white hover:text-blue-600"
              }`}
            >
              Female
            </button>
          </div>
        </div>
      </header>

      {/* Left Sidebar Navigation */}
      <div className="fixed top-24 left-6 z-40 pointer-events-auto">
        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-blue-100/50 flex flex-col gap-2 w-auto transition-all duration-300 ease-out overflow-hidden">
          
          <button
            onClick={() => handleSidebarClick("Full Body")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans whitespace-nowrap ${
              viewMode === "full"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <span className="font-semibold text-sm">Full Body</span>
          </button>

          <button
            onClick={() => handleSidebarClick("Head")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans whitespace-nowrap ${
              viewMode === "head"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <span className="font-semibold text-sm">Head Region</span>
          </button>
          <button
            onClick={() => handleSidebarClick("Torso")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans whitespace-nowrap ${
              viewMode === "torso"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <span className="font-semibold text-sm">Torso</span>
          </button>
          <button
            onClick={() => handleSidebarClick("Left Hand")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans whitespace-nowrap ${
              viewMode === "left-hand"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <span className="font-semibold text-sm">Left Hand</span>
          </button>

          <button
            onClick={() => handleSidebarClick("Right Hand")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-sans whitespace-nowrap ${
              viewMode === "right-hand"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <span className="font-semibold text-sm">Right Hand</span>
          </button>

          <button
            onClick={() => handleSidebarClick("Right Leg")}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
              viewMode === "right-leg"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Footprints className="w-6 h-6 min-w-[24px]" />
            <span className="font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap delay-75">
              Right Leg
            </span>
          </button>

        </div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene onSelectPart={handlePartSelect} selectedPart={selectedPart} gender={gender} viewMode={viewMode} />
      </div>

      {/* Fixed Notification Button */}
      {!selectedPart && viewMode === "full" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-xl px-6 py-3.5 rounded-full shadow-2xl border border-blue-200/50 text-blue-700 text-sm font-semibold animate-pulse font-sans">
            <div className="flex items-center gap-2">
              <Image src="/LOGO1.png" alt="Feature" width={16} height={16} className="brightness-0 invert" />
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
