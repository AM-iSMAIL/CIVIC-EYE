'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CivicEyeLogo } from './CivicEyeLogo';

interface CivicEyeSplashScreenProps {
  onComplete?: () => void;
  durationMs?: number; // Total loading animation duration (default ~3200ms)
}

/**
 * CivicEye Loading / Splash Screen
 * 
 * Aesthetic: Class AI White Design
 * - Pure/off-white background (#fafbfd / #ffffff)
 * - Black/dark charcoal typography (#0f172a)
 * - Clean blue (#2563eb) primary accent
 * - Generous whitespace & rounded geometry
 * - No purple, neon, heavy gradients, or glassmorphism
 * - 60fps cinematic, calm, intentional animation sequence
 */
export const CivicEyeSplashScreen: React.FC<CivicEyeSplashScreenProps> = ({
  onComplete,
  durationMs = 3200,
}) => {
  // Animation Phase State
  // 0: Blank pure white
  // 1: Eye fades in + scales 96% -> 100%
  // 2: Scan line pass 1
  // 3: Wordmark "CIVICEYE" fades upward
  // 4: "SEE • REPORT • RESOLVE" appears
  // 5: City micro-grid points active + progress bar filling
  // 6: 100% reached + final scan pass
  // 7: Smooth exit transition (fade + upward motion)
  const [phase, setPhase] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [scanYPercent, setScanYPercent] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('AI INITIALIZING');
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Main 60fps Animation Orchestration
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setProgress(100);
        setPhase(6);
        setIsExiting(true);
        setTimeout(() => {
          if (onCompleteRef.current) onCompleteRef.current();
        }, 300);
      }, 50);
      return () => clearTimeout(timer);
    }

    let isCancelled = false;

    // Step 1: Blank Screen -> Eye fades in at 350ms
    const t1 = setTimeout(() => {
      if (isCancelled) return;
      setPhase(1);
    }, 350);

    // Step 2: First Scanning Line Pass through the eye at 850ms
    const t2 = setTimeout(() => {
      if (isCancelled) return;
      setPhase(2);
      setIsScanning(true);
    }, 850);

    // Step 3: CIVICEYE Wordmark fades upward into view at 1150ms
    const t3 = setTimeout(() => {
      if (isCancelled) return;
      setPhase(3);
    }, 1150);

    // Step 4: SEE • REPORT • RESOLVE appears at 1450ms
    const t4 = setTimeout(() => {
      if (isCancelled) return;
      setPhase(4);
    }, 1450);

    // Step 5: City Telemetry Micro-grid activates at 1650ms
    const t5 = setTimeout(() => {
      if (isCancelled) return;
      setPhase(5);
    }, 1650);

    // Progress Bar Animation Loop (60fps)
    const animate = (timestamp: number) => {
      if (isCancelled) return;
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const progressRatio = Math.min(Math.max((elapsed - 600) / (durationMs - 1200), 0), 1);

      // Smooth cubic ease-out for progress filling
      const easeProgress = Math.round(progressRatio * 100);
      setProgress(easeProgress);

      // Scanning line oscillation / sweep
      if (elapsed > 850 && elapsed < 1650) {
        // First scan pass
        const scanRatio = (elapsed - 850) / 800;
        setScanYPercent(scanRatio * 100);
      } else if (elapsed >= 2500 && elapsed <= 2950) {
        // Final scan pass when reaching 100%
        const scanRatio = (elapsed - 2500) / 450;
        setScanYPercent(scanRatio * 100);
        setIsScanning(true);
      } else if (elapsed > 1650 && elapsed < 2500) {
        setIsScanning(false);
      }

      // Dynamic Intelligence Status Indicators
      if (easeProgress < 35) {
        setStatusText('AI INITIALIZING');
      } else if (easeProgress < 75) {
        setStatusText('ANALYZING CIVIC MESH');
      } else if (easeProgress < 100) {
        setStatusText('SYNCHRONIZING TELEMETRY');
      } else {
        setStatusText('SYSTEM READY');
      }

      if (elapsed < durationMs) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Step 8 & 9: 100% reached, trigger exit transition
        setPhase(6);
        setIsScanning(false);
        const exitTimer = setTimeout(() => {
          if (isCancelled) return;
          setIsExiting(true);
          const finishTimer = setTimeout(() => {
            if (isCancelled) return;
            if (onCompleteRef.current) onCompleteRef.current();
          }, 450);
          return () => clearTimeout(finishTimer);
        }, 200);
        return () => clearTimeout(exitTimer);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      isCancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [durationMs]);

  // Handle manual skip on click or key press
  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fafbfd] text-slate-900 cursor-pointer select-none transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}
      style={{
        backgroundColor: '#ffffff',
      }}
      role="region"
      aria-label="CivicEye System Initialization"
    >
      {/* Extremely Subtle Precision Background Grid (Class AI Signature) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Main Centered Content Stack */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-sm w-full px-6 text-center">
        {/* 1. Abstract AI Eye / Civic Intelligence Symbol */}
        <div
          className="mb-7 transition-all duration-700 ease-out"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1)' : 'scale(0.96)',
          }}
        >
          <CivicEyeLogo
            size={76}
            isScanning={isScanning}
            scanYPercent={scanYPercent}
            showParticles={phase >= 5}
          />
        </div>

        {/* 2. CIVICEYE Wordmark */}
        <div
          className="transition-all duration-600 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-[0.18em] text-slate-900 font-sans leading-none pl-[0.18em]">
            CIVICEYE
          </h1>
        </div>

        {/* 3. Sub-wordmark: SEE • REPORT • RESOLVE */}
        <div
          className="mt-3.5 transition-all duration-600 ease-out"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? 'translateY(0)' : 'translateY(4px)',
          }}
        >
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.32em] text-slate-400 pl-[0.32em] uppercase">
            SEE &bull; REPORT &bull; RESOLVE
          </p>
        </div>

        {/* 4. Subtle Loading Indicator & Progress Bar */}
        <div
          className="mt-14 flex flex-col items-center transition-all duration-500 ease-out"
          style={{
            opacity: phase >= 3 ? 1 : 0,
          }}
        >
          {/* Status Text */}
          <span className="text-[9px] sm:text-[10px] font-mono font-semibold tracking-[0.24em] text-slate-500 uppercase pl-[0.24em] mb-2.5">
            {statusText}
          </span>

          {/* Thin Horizontal Precision Progress Line */}
          <div className="w-36 sm:w-44 h-[2px] bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-150 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: progress > 0 ? '0 0 8px rgba(37, 99, 235, 0.4)' : 'none',
              }}
            />
          </div>

          {/* Micro Telemetry Percentage Display */}
          <span className="text-[9px] font-mono text-slate-300 mt-2 tracking-wider">
            {progress}%
          </span>
        </div>
      </div>

      {/* Subtle Bottom System Disclaimer */}
      <div className="absolute bottom-6 text-[10px] font-mono text-slate-300/80 tracking-widest uppercase">
        Autonomous Civic Intelligence
      </div>
    </div>
  );
};
