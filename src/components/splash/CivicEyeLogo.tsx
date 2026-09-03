'use client';

import React from 'react';

interface CivicEyeLogoProps {
  size?: number;
  className?: string;
  isScanning?: boolean;
  scanYPercent?: number; // 0 to 100
  showParticles?: boolean;
  scale?: number;
  opacity?: number;
}

/**
 * Minimal abstract AI Eye / Civic Intelligence symbol.
 * Pure geometric design adhering to the Class AI white visual language:
 * - Off-white / dark charcoal typography
 * - Vibrant precision blue (#2563eb) accent
 * - Clean modern geometric radar aperture
 */
export const CivicEyeLogo: React.FC<CivicEyeLogoProps> = ({
  size = 72,
  className = '',
  isScanning = false,
  scanYPercent = 50,
  showParticles = false,
  scale = 1,
  opacity = 1,
}) => {
  // Convert 0-100 scan percentage to vertical coordinate range (approx Y=22 to Y=58)
  const scanY = 22 + (scanYPercent / 100) * 36;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: `scale(${scale})`,
        opacity,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
      }}
      aria-label="CivicEye AI Symbol"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* Subtle Blue Scanning Line Gradient */}
          <linearGradient id="blueScanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
            <stop offset="20%" stopColor="#2563eb" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="80%" stopColor="#2563eb" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>

          {/* Very Subtle Pulse Gradient for Central Sensor */}
          <radialGradient id="pupilGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Outer Geospatial Alignment Ring (City Radar Grid) */}
        <circle
          cx="40"
          cy="40"
          r="35"
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* 2. Cardinal Coordinate Alignment Ticks (North, South, East, West) */}
        <line x1="40" y1="2" x2="40" y2="7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="40" y1="73" x2="40" y2="78" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="40" x2="7" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="73" y1="40" x2="78" y2="40" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />

        {/* 3. Micro City Telemetry Points (Discreetly placed around the aperture) */}
        {showParticles && (
          <g className="transition-opacity duration-500 ease-out" style={{ opacity: 0.9 }}>
            {/* Top-Left Telemetry Node */}
            <circle cx="22" cy="18" r="1.5" fill="#2563eb" className="animate-pulse" />
            <circle cx="22" cy="18" r="4" stroke="#2563eb" strokeWidth="0.75" strokeOpacity="0.3" />

            {/* Top-Right Telemetry Node */}
            <circle cx="58" cy="18" r="1.5" fill="#94a3b8" />
            
            {/* Bottom-Left Telemetry Node */}
            <circle cx="18" cy="58" r="1.5" fill="#94a3b8" />

            {/* Bottom-Right Telemetry Node */}
            <circle cx="62" cy="56" r="1.5" fill="#2563eb" className="animate-pulse" style={{ animationDelay: '300ms' }} />
            <circle cx="62" cy="56" r="4" stroke="#2563eb" strokeWidth="0.75" strokeOpacity="0.3" />
          </g>
        )}

        {/* 4. Abstract AI Eye Aperture (Precision Intersecting Arcs) */}
        <path
          d="M 14 40 C 24 23, 56 23, 66 40 C 56 57, 24 57, 14 40 Z"
          stroke="#0f172a"
          strokeWidth="2.25"
          fill="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Concentric Iris Ring (Civic Target Aperture) */}
        <circle
          cx="40"
          cy="40"
          r="11.5"
          stroke="#2563eb"
          strokeWidth="1.5"
          fill="none"
        />

        {/* 6. Subtle Sensor Aura */}
        <circle cx="40" cy="40" r="10" fill="url(#pupilGlow)" />

        {/* 7. Central AI Focal Core (Pupil) */}
        <circle cx="40" cy="40" r="4.5" fill="#2563eb" />
        <circle cx="38.5" cy="38.5" r="1.25" fill="#ffffff" />

        {/* 8. Active Precision Scanning Beam */}
        {isScanning && (
          <g>
            {/* Soft Scanning Beam Glow */}
            <line
              x1="16"
              y1={scanY}
              x2="64"
              y2={scanY}
              stroke="url(#blueScanGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Crisp Center Filament */}
            <line
              x1="20"
              y1={scanY}
              x2="60"
              y2={scanY}
              stroke="#ffffff"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeOpacity="0.9"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
