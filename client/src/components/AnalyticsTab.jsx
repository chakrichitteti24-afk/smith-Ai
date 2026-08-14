import React from 'react';

function CircularProgress({ percentage, color, label }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = percentage !== null && percentage !== undefined
    ? circumference - (percentage / 100) * circumference
    : circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-elevated)', padding: '24px 20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', flex: '1', minWidth: '180px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--border-medium)" strokeWidth="7" />
          <circle 
            cx="50" cy="50" r={radius} fill="transparent" 
            stroke={color} strokeWidth="7" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            transform="rotate(-90 50 50)" 
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <span style={{ position: 'absolute', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {percentage !== null && percentage !== undefined ? `${percentage}%` : 'N/A'}
        </span>
      </div>
      <span style={{ marginTop: '14px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  );
}

export default function AnalyticsTab({ history, currentMetrics }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '60px 40px', textAlign: 'center', border: '1px dashed var(--border-medium)', borderRadius: '16px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', maxWidth: '600px', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>No Analytics Data Yet</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '24px', fontSize: '0.95rem' }}>
            Complete your first mock interview to generate an enterprise-grade performance dashboard showing your accuracy, confidence, coding metrics, and trend analysis.
          </p>
        </div>
      </div>
    );
  }

  // Calculate trends
  const trendScore = history.length > 1 ? history[0].score - history[history.length - 1].score : 0;

  return (
    <div style={{ padding: '36px 40px', maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Performance Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>Aggregated analytics from {history.length} interview session{history.length > 1 ? 's' : ''}.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: '14px', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-card)' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>Average Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: currentMetrics.overall >= 80 ? 'var(--success)' : 'var(--warning)' }}>
              {currentMetrics.overall}%
            </div>
          </div>
          {trendScore !== 0 && (
            <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, background: trendScore > 0 ? 'var(--success-dim)' : 'var(--danger-dim)', color: trendScore > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {trendScore > 0 ? '+' : ''}{trendScore}%
            </div>
          )}
        </div>
      </div>

      {/* KPI Donuts */}
      <div className="overview-card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <CircularProgress percentage={currentMetrics.accuracy} color="#3b82f6" label="Technical Accuracy" />
        <CircularProgress percentage={currentMetrics.logicalThinking} color="#8b5cf6" label="Logical Thinking" />
        <CircularProgress percentage={currentMetrics.confidence} color="#10b981" label="Communication Confidence" />
        <CircularProgress percentage={currentMetrics.overall} color="#f59e0b" label="Overall Benchmark" />
      </div>

      {/* Trend Graph & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column - Trends */}
        <div className="overview-card" style={{ padding: '28px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>Performance Trend Analysis</h4>
          <div style={{ width: '100%', height: '220px', position: 'relative' }}>
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="var(--border-subtle)" strokeWidth="1" />
              
              <text x="-28" y="25" fill="var(--text-muted)" fontSize="10">100%</text>
              <text x="-28" y="115" fill="var(--text-muted)" fontSize="10">50%</text>
              
              {(() => {
                const points = [...history].reverse().map((item, idx) => {
                  const x = history.length === 1 ? 250 : (idx / (history.length - 1)) * 500;
                  const y = 200 - (item.score / 100) * 180;
                  return { x, y, score: item.score };
                });

                const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                return (
                  <>
                    <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke="var(--accent)" strokeWidth="3" />
                        <text x={p.x} y={p.y - 14} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="800">
                          {p.score}%
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Right Column - History Breakdown */}
        <div className="overview-card" style={{ padding: '28px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', color: 'var(--text-primary)' }}>Session Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.slice(0, 5).map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{h.role}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{h.date}</div>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: h.score >= 80 ? 'var(--success)' : 'var(--warning)' }}>
                  {h.score}%
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
