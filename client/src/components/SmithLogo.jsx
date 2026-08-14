import React from 'react';

/**
 * Unique Smith AI Brand Symbol & CipherFlux Labs Attribution Badge
 */
export function SmithLogo({ size = 32, showText = false, showBadge = false }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="smithGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Outer Shield Diamond Frame with Glowing Stroke */}
          <path
            d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
            fill="rgba(59, 130, 246, 0.12)"
            stroke="url(#smithGlowGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Core Cyber Nodes */}
          <circle cx="16" cy="6.5" r="1.5" fill="#3b82f6" />
          <circle cx="24.5" cy="21" r="1.5" fill="#8b5cf6" />
          <circle cx="7.5" cy="21" r="1.5" fill="#10b981" />

          {/* Stylized Smith AI "S" Emblem */}
          <path
            d="M11.5 11C11.5 9.8 12.8 8.8 14.5 8.8H17.5C19.2 8.8 20.5 9.8 20.5 11C20.5 12.2 19.2 13.2 17.5 13.2H14.5C12.8 13.2 11.5 14.2 11.5 15.5C11.5 16.8 12.8 17.8 14.5 17.8H17.5C19.2 17.8 20.5 16.8 20.5 15.5"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: '1.1' }}>
            Smith AI
          </span>
          {showBadge && (
            <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', marginTop: '2px' }}>
              Developed by CipherFlux Labs
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function CipherFluxBadge() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      background: 'rgba(59, 130, 246, 0.08)',
      border: '1px solid rgba(59, 130, 246, 0.22)',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 700,
      color: 'var(--text-secondary)'
    }}>
      <span style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>⚡</span>
      <span>Developed by <strong style={{ color: 'var(--accent)' }}>CipherFlux Labs</strong></span>
    </div>
  );
}

export default SmithLogo;
