import React from 'react';

/**
 * AtlyraSymbol — Official Vector Logomark of Atlyra
 *
 * Geometric Anatomy:
 * 1. Apex Monolith (Ascending Delta / Letter 'A' Peak)
 * 2. Left & Right Structural Pylons (Atlyra Platform)
 * 3. Quantum Sync Bridge (Resonance Lattice)
 * 4. Smith AI Nexus Core (Vega Celestial Diamond)
 */
export default function AtlyraSymbol({
  size = 24,
  className = '',
  withGlow = false,
  animated = false,
  variant = 'default' // 'default' | 'silver'
}) {
  const uniqueId = React.useId().replace(/:/g, '');

  const apexId = `atlyra-apex-${uniqueId}`;
  const leftId = `atlyra-wing-left-${uniqueId}`;
  const rightId = `atlyra-wing-right-${uniqueId}`;
  const coreId = `atlyra-smith-core-${uniqueId}`;
  const glowId = `atlyra-glow-${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform ${animated ? 'hover:scale-110 active:scale-95' : ''} ${className}`}
      aria-label="Atlyra Official Symbol"
    >
      <defs>
        {variant === 'silver' ? (
          <>
            <linearGradient id={apexId} x1="24" y1="4" x2="24" y2="23" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E4E4E7" />
            </linearGradient>
            <linearGradient id={leftId} x1="4" y1="20" x2="23" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D4D4D8" />
              <stop offset="100%" stopColor="#71717A" />
            </linearGradient>
            <linearGradient id={rightId} x1="44" y1="20" x2="25" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F4F4F5" />
              <stop offset="100%" stopColor="#A1A1AA" />
            </linearGradient>
            <linearGradient id={coreId} x1="19" y1="27" x2="29" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#D4D4D8" />
            </linearGradient>
          </>
        ) : (
          <>
            <linearGradient id={apexId} x1="24" y1="4" x2="24" y2="23" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E0E7FF" />
              <stop offset="100%" stopColor="#A5B4FC" />
            </linearGradient>
            <linearGradient id={leftId} x1="4" y1="20" x2="23" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id={rightId} x1="44" y1="20" x2="25" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id={coreId} x1="19" y1="27" x2="29" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </>
        )}

        {withGlow && (
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#8B5CF6" floodOpacity="0.45" />
          </filter>
        )}
      </defs>

      <g filter={withGlow ? `url(#${glowId})` : undefined}>
        {/* 1. Ascending Apex Delta (The Letter 'A' Monogram) */}
        <path d="M 24 4 L 31 18 L 24 23 L 17 18 Z" fill={`url(#${apexId})`} />

        {/* 2. Left Structural Wing (Atlyra Platform Pylon) */}
        <path d="M 16 20 L 23 25 L 12 44 L 4 44 Z" fill={`url(#${leftId})`} />

        {/* 3. Right Structural Wing (Atlyra Platform Pylon) */}
        <path d="M 25 25 L 32 20 L 44 44 L 36 44 Z" fill={`url(#${rightId})`} />

        {/* 4. Quantum Sync Bridge */}
        <line
          x1="14"
          y1="34"
          x2="34"
          y2="34"
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1"
          strokeDasharray="2 1.5"
        />

        {/* 5. Smith AI Nexus Core (Vega Celestial Diamond) */}
        <path d="M 24 27 L 28.5 34 L 24 40 L 19.5 34 Z" fill={`url(#${coreId})`} />

        {/* 6. Apex Shimmer Sparkle */}
        <circle cx="24" cy="5.5" r="1.1" fill="#FFFFFF" opacity="0.95" />
      </g>
    </svg>
  );
}
