"use client";

import React, { useRef, useEffect, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GlowModelRotator } from "@/components/GlowModelRotator";
import { Activity, Brain, Heart, Stethoscope, ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { ThemeToggle } from "@/components/ThemeToggle";

const AnimatedHeroText = () => {
  const [displayedText, setDisplayedText] = useState("Explore the human body");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const textItems = ["Explore the human body", "Get answers powered by AI"];
  const currentIndex = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        currentIndex.current = (currentIndex.current + 1) % textItems.length;
        setDisplayedText(textItems[currentIndex.current]);
        setIsTransitioning(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center min-h-[120px] flex items-center justify-center">
      <h2
        className={`text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent transition-all duration-500 pb-4 leading-normal ${
          isTransitioning ? "opacity-0 transform translate-y-8 blur-sm" : "opacity-100 transform translate-y-0 blur-0"
        }`}
      >
        {displayedText}
      </h2>
    </div>
  );
};

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animated-hero-gradient {
          /* Darkened Light Mode Gradient: Slate-200 to Blue-100 mix, no pure white */
          background: linear-gradient(-45deg, #cbd5e1, #e2e8f0, #dbeafe, #cbd5e1);
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }
        :global(.dark) .animated-hero-gradient {
          background: none !important;
        }
        .glass-header-floating {
             background: rgba(255, 255, 255, 0.85);
             backdrop-filter: blur(12px);
             -webkit-backdrop-filter: blur(12px);
        }
        :global(.dark) .glass-header-floating {
             background: rgba(15, 23, 42, 0.95);
             border-color: transparent;
             box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
        }
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      <main className="relative w-full bg-gradient-to-br from-slate-200 via-blue-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
      
      {/* Floating Premium Header */}
      <header className="fixed top-4 left-0 right-0 mx-auto w-[92%] max-w-7xl glass-header-floating rounded-2xl border border-white/60 dark:border-none shadow-lg shadow-blue-900/5 z-50 transition-all duration-300">
        <div className="px-6 py-3 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Image 
                src="/Asset-2.png" 
                alt="AnatoAI Logo" 
                fill
                className="object-contain p-1.5"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-black tracking-tight leading-none">AnatoAI</h1>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest leading-none mt-0.5">Health Intelligence</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-full border border-slate-300 dark:border-none">
            {["Home", "Features", "About"].map((item) => (
              <Link 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-slate-900 hover:bg-white dark:hover:bg-white rounded-full transition-all duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => window.location.href = "/app"}
            className="group px-6 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white dark:text-white text-sm font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
          >
            Launch App 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <ThemeToggle />

      {/* Hero Section */}
      <section id="home" className="relative w-full h-screen flex items-center justify-center pt-24 overflow-hidden animated-hero-gradient dark:!bg-none dark:bg-slate-950">
        {/* 3D Canvas - Background */}
        <div className="absolute inset-0 z-0 opacity-100 dark:opacity-100 transition-opacity duration-500 bg-transparent">
          {/* Subtle dark gradient for depth in dark mode - removes patchy white */}
          <div className="absolute inset-0 bg-transparent dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 opacity-100 pointer-events-none" />
          
          <Canvas
            camera={{ position: [0, 0, 16], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Environment preset="studio" />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            
            <Suspense fallback={null}>
              {/* Female Model - Left Corner - Counter Clockwise */}
              <GlowModelRotator
                modelPath="/models/female/GlowBodyFemale.glb"
                position={[-10, -0.5, 0]}
                scale={7}
                direction="counter-clockwise"
              />
              
              {/* Male Model - Right Corner - Clockwise */}
              <GlowModelRotator
                modelPath="/models/male/GlowBody.glb"
                position={[10, -0.5, 0]}
                scale={7}
                direction="clockwise"
              />
            </Suspense>

            <OrbitControls
              autoRotate={false}
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Canvas>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-[-5vh] pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide mb-8 border border-blue-100 dark:border-blue-900 shadow-sm backdrop-blur-sm floating-element">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            NEXT-GEN HEALTH EDUCATION
          </div>
          
          <div className="dark:text-white">
            <AnimatedHeroText />
          </div>
          
          <p className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-medium">
            Experience the human body like never before. Interactive 3D visualization combined with powerful AI diagnostics for a smarter, healthier you.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <button
              onClick={() => window.location.href = "/app"}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 text-lg flex items-center gap-3 transform hover:-translate-y-1"
            >
              Start Exploring <Activity className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-300 text-lg border border-white dark:border-slate-700 backdrop-blur-sm">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features / About Section (Condensed) */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-slate-900 relative z-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Why Choose AnatoAI?</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-xl">We bridge the gap between complex medical data and understandable visual insights.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "AI Intelligence", desc: "Powered by advanced LLMs to answer your health queries instantly with medical accuracy." },
              { icon: Activity, title: "Real-time 3D", desc: "Interact with high-fidelity anatomical models. Rotate, zoom, and isolate specific body parts." },
              { icon: Heart, title: "Holistic Health", desc: "Understand connections between different bodily systems and improved health literacy." }
            ].map((feature, i) => (
              <div key={i} className="group p-10 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-700 hover:bg-gradient-to-br hover:from-white dark:hover:from-slate-700 hover:to-blue-50/30 dark:hover:to-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-150 transition-transform duration-700 ease-out" />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next Level Footer */}
      <footer id="about" className="bg-slate-950 text-slate-300 py-12 px-6 border-t border-slate-800 relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center text-center gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-blue-900/20 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                  <Image 
                    src="/Asset-2.png" 
                    alt="AnatoAI Logo" 
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">AnatoAI</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-lg">
                Revolutionizing health education through interactive 3D visualization and artificial intelligence.
              </p>
            </div>

            {/* GitHub - Central Divider */}
            <div>
               <Link 
                  href="https://github.com/Sanjaya-Samudra/AnatoAI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all duration-300 group shadow-lg shadow-blue-900/10"
                >
                  <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </Link>
            </div>

            {/* Team Section */}
            <div className="flex flex-col items-center w-full">
              <h4 className="text-white font-bold mb-6 text-xl flex items-center gap-2">
                <span className="bg-blue-500/10 text-blue-400 py-1 px-3 rounded-lg text-sm uppercase tracking-wider">Team</span>
                JthonX
              </h4>
              <ul className="space-y-3 text-sm font-medium text-slate-300 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
                <li className="flex items-center gap-2 group whitespace-nowrap">
                   <div className="w-2 h-2 rounded-full bg-blue-600 group-hover:bg-blue-400 transition-colors shrink-0"></div>
                   <span className="group-hover:text-white transition-colors">Sanjaya Samudra</span>
                </li>
                <li className="flex items-center gap-2 group whitespace-nowrap">
                   <div className="w-2 h-2 rounded-full bg-blue-600 group-hover:bg-blue-400 transition-colors shrink-0"></div>
                   <span className="group-hover:text-white transition-colors">Praveen Tharuka</span>
                </li>
                <li className="flex items-center gap-2 group whitespace-nowrap">
                   <div className="w-2 h-2 rounded-full bg-blue-600 group-hover:bg-blue-400 transition-colors shrink-0"></div>
                   <span className="group-hover:text-white transition-colors">Yasas Chamod</span>
                </li>
                <li className="flex items-center gap-2 group whitespace-nowrap">
                   <div className="w-2 h-2 rounded-full bg-blue-600 group-hover:bg-blue-400 transition-colors shrink-0"></div>
                   <span className="group-hover:text-white transition-colors">Sithum Dineth</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/50 flex justify-center text-sm text-slate-500">
            <p>© 2026 AnatoAI Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}
