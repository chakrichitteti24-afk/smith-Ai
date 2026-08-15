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
              <stop offset="0%" stopColor="#0a84ff" />
              <stop offset="50%" stopColor="#5e5ce6" />
              <stop offset="100%" stopColor="#bf5af2" />
            </linearGradient>
          </defs>

          {/* Outer Shield Diamond Frame with Glowing Stroke */}
          <path
            d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
            fill="rgba(10, 132, 255, 0.12)"
            stroke="url(#smithGlowGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Core Cyber Nodes */}
          <circle cx="16" cy="6.5" r="1.5" fill="#0a84ff" />
          <circle cx="24.5" cy="21" r="1.5" fill="#5e5ce6" />
          <circle cx="7.5" cy="21" r="1.5" fill="#bf5af2" />

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
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            Smith AI
          </span>
          {showBadge && (
            <span style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', marginTop: '2px' }}>
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
      padding: '5px 14px',
      background: 'rgba(255, 255, 255, 0.06)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-pill)',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: 'var(--text-secondary)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)'
    }}>
      <span style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>⚡</span>
      <span>Developed by <strong style={{ color: 'var(--text-primary)' }}>CipherFlux Labs</strong></span>
    </div>
  );
}

export default SmithLogo;
