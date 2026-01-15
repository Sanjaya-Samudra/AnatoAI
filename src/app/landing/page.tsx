"use client";

import React, { useRef, useEffect, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GlowModelRotator } from "@/components/GlowModelRotator";
import { Activity } from "lucide-react";
import Link from "next/link";

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
    <div className="text-center">
      <h2
        className={`text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent transition-all duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
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
        .animated-hero-gradient {
          background: linear-gradient(-45deg, #e0f2fe, #f0f9ff, #bfdbfe, #ffffff);
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
      <main className="relative w-full bg-white text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AnatoAI</h1>
              <p className="text-xs font-medium text-slate-500">Interactive health assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <Link href="#home" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="#about" className="font-medium text-slate-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <button
              onClick={() => window.location.href = "/app"}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative w-full h-screen flex items-center justify-center pt-20 overflow-hidden animated-hero-gradient">
        {/* 3D Canvas - Background */}
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 16], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Environment preset="studio" />
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 10]} intensity={1.2} />
            
            <Suspense fallback={null}>
              {/* Female Model - Left Corner */}
              <GlowModelRotator
                modelPath="/models/female/GlowBodyFemale.glb"
                position={[-11, 0, 0]}
                scale={7.5}
              />
              
              {/* Male Model - Right Corner */}
              <GlowModelRotator
                modelPath="/models/male/GlowBody.glb"
                position={[11, 0, 0]}
                scale={7.5}
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
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none px-6">
          <AnimatedHeroText />
          
          <p className="mt-6 text-xl text-slate-600 max-w-2xl text-center leading-relaxed">
            Interactive 3D Anatomy Models with AI-powered insights to understand human health better.
          </p>

          <button
            onClick={() => window.location.href = "/app"}
            className="mt-10 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 pointer-events-auto text-lg"
          >
            Start Exploring
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative w-full py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">About AnatoAI</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Combining cutting-edge 3D anatomical models with artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Advanced 3D Models</h3>
                <p className="text-slate-600 leading-relaxed">
                  Explore detailed, high-quality 3D models of the human body. Interactive visualization 
                  allows you to examine anatomical structures from every angle, providing comprehensive 
                  understanding of human anatomy.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">AI-Powered Insights</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our advanced AI system provides intelligent, context-aware information about different 
                  body parts. Get accurate medical information explained in simple, understandable language.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Learn at Your Pace</h3>
                <p className="text-slate-600 leading-relaxed">
                  Whether you're a student, healthcare professional, or health-conscious individual, 
                  AnatoAI provides the information you need to understand human health and anatomy better.
                </p>
              </div>
            </div>

            {/* Right Content - Features */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-8 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="text-white w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Interactive Learning</h4>
                <p className="text-slate-600">
                  Click on body parts to learn detailed information with AI-powered explanations.
                </p>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="text-white w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Male & Female Models</h4>
                <p className="text-slate-600">
                  Explore anatomical differences between male and female body structures.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-8 rounded-2xl border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="text-white w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Health Education</h4>
                <p className="text-slate-600">
                  Improve your understanding of human anatomy and health with expert AI guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">
            © 2026 AnatoAI. Interactive health assistant powered by AI and 3D anatomy models.
          </p>
        </div>
      </footer>
    </main>
    </>
  );
}
