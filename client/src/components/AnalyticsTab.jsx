export default function AnalyticsTab({ history, currentMetrics }) {
  if (!history || history.length === 0) {
    return (
      <div className="pro-page-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="pro-card" style={{ maxWidth: '540px', width: '100%', textAlign: 'center', padding: '48px 32px', alignItems: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: '1px solid var(--border-accent)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>No Analytics Data Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: '1.5' }}>
            Complete your first AI mock interview session to unlock algorithmic accuracy tracking, trajectory graphs, and competency meters.
          </p>
        </div>
      </div>
    );
  }

  const passCount = history.filter(h => (h.score || 0) >= 75).length;
  const passRate = Math.round((passCount / history.length) * 100);

  return (
    <div className="pro-page-container">
      
      {/* Header */}
      <div className="pro-header">
        <div>
          <h2 className="pro-header-title">Performance Intelligence</h2>
          <p className="pro-header-subtitle">
            Telemetry aggregated from {history.length} evaluated interview session{history.length > 1 ? 's' : ''}.
          </p>
        </div>

        <div className="pro-header-badges">
          <div className="pro-pill-badge">
            Pass Benchmark: <strong style={{ color: 'var(--success)' }}>{passRate}%</strong>
          </div>
          <div className="pro-pill-badge">
            Current Index: <strong style={{ color: 'var(--accent)' }}>{currentMetrics.overall || 78}%</strong>
          </div>
        </div>
      </div>

      {/* 4 Clean Activity Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Technical Accuracy', score: currentMetrics.accuracy || 75, subtitle: 'Algorithmic CS' },
          { label: 'Problem Decomposition', score: currentMetrics.logicalThinking || 80, subtitle: 'Logic & Architecture' },
          { label: 'Communication Clarity', score: currentMetrics.confidence || 72, subtitle: 'Clarity & Articulation' },
          { label: 'Composite Index', score: currentMetrics.overall || 78, subtitle: 'Overall Hireability' }
        ].map((item, idx) => (
          <div key={idx} className="pro-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>{item.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: idx === 3 ? 'var(--success)' : 'var(--text-primary)', marginTop: '4px' }}>
              {item.score}%
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '12px' }}>
              <div style={{ width: `${item.score}%`, height: '100%', background: idx === 3 ? 'var(--success)' : 'var(--accent)', borderRadius: 'var(--radius-full)' }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>{item.subtitle}</span>
          </div>
        ))}
      </div>

      {/* Trajectory & Competencies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
        
        {/* Left: SVG Spline Graph */}
        <div className="pro-card">
          <div className="pro-card-header">
            <div className="pro-card-title">Performance Trajectory</div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Target: 80% Benchmark</span>
          </div>

          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="20" x2="500" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="74" x2="500" y2="74" stroke="rgba(99,102,241,0.25)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              
              <text x="-24" y="24" fill="var(--text-muted)" fontSize="9" fontWeight="600">100%</text>
              <text x="-24" y="78" fill="var(--accent)" fontSize="9" fontWeight="700">80%</text>
              
              {(() => {
                const points = [...history].reverse().map((item, idx) => {
                  const s = typeof item.score === 'number' ? item.score : 70;
                  const x = history.length === 1 ? 250 : (idx / (history.length - 1)) * 500;
                  const y = 200 - (s / 100) * 180;
                  return { x, y, s };
                });

                const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaD = `${lineD} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#analyticsGrad)" />
                    <path d={lineD} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-app)" stroke="var(--accent)" strokeWidth="2" />
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">
                          {p.s}%
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Right: Competency Breakdown */}
        <div className="pro-card" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="pro-card-header">
              <div className="pro-card-title">Competency Breakdown</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Technical Accuracy', score: currentMetrics.accuracy || 75 },
                { label: 'Problem Solving & Logic', score: currentMetrics.logicalThinking || 80 },
                { label: 'Communication Confidence', score: currentMetrics.confidence || 72 },
                { label: 'Code Architecture', score: Math.round(((currentMetrics.accuracy || 75) + (currentMetrics.logicalThinking || 80)) / 2) }
              ].map((cat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{cat.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{cat.score}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${cat.score}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-full)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '10px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Strongest metric: <strong style={{ color: 'var(--accent)' }}>Problem Solving & Logic</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
