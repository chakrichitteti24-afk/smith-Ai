import React, { useMemo } from 'react';

function CircularProgress({ percentage, color, label }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--border-subtle)" strokeWidth="8" />
        {/* Progress circle */}
        <circle 
          cx="50" cy="50" r={radius} fill="transparent" 
          stroke={color} strokeWidth="8" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          transform="rotate(-90 50 50)" 
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <text x="50" y="55" textAnchor="middle" fill="var(--text-primary)" fontSize="18" fontWeight="800">
          {percentage}%
        </text>
      </svg>
      <span style={{ marginTop: '12px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

export default function AnalyticsTab({ history, currentMetrics }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '60px 40px', textAlign: 'center', border: '1px dashed var(--border-medium)', borderRadius: '16px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', maxWidth: '600px', width: '100%' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>No Analytics Data Yet</h3>
          <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>
            Complete your first mock interview to generate an enterprise-grade performance dashboard showing your accuracy, confidence, coding metrics, and trend analysis.
          </p>
        </div>
      </div>
    );
  }

  // Calculate trends
  const trendScore = history.length > 1 ? history[0].score - history[history.length - 1].score : 0;
  
  // Aggregate strong/weak topics from all history items
  const allStrong = history.flatMap(h => h.raw?.strongTopics || []);
  const allWeak = history.flatMap(h => h.raw?.weakTopics || []);
  // Deduplicate
  const strongTopics = [...new Set(allStrong)].slice(0, 4);
  const weakTopics = [...new Set(allWeak)].slice(0, 4);
  
  const recommendations = history[0]?.raw?.recommendations || [
    "Focus on system design fundamentals.",
    "Practice speaking clearly without rushing.",
    "Review time complexities for common algorithms."
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Performance Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Aggregated insights from {history.length} interview session{history.length > 1 ? 's' : ''}.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-elevated)', padding: '16px 24px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>Overall Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: currentMetrics.overall > 80 ? 'var(--success)' : 'var(--warning)' }}>
              {currentMetrics.overall}%
            </div>
          </div>
          {trendScore !== 0 && (
            <div style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, background: trendScore > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: trendScore > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {trendScore > 0 ? '+' : ''}{trendScore}%
            </div>
          )}
        </div>
      </div>

      {/* KPI Donuts */}
      <div className="overview-card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' }}>
        <CircularProgress percentage={currentMetrics.accuracy} color="var(--accent)" label="Technical Accuracy" />
        <CircularProgress percentage={currentMetrics.logicalThinking} color="#a855f7" label="Logical Thinking" />
        <CircularProgress percentage={currentMetrics.confidence} color="var(--success)" label="Communication Confidence" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column - Trends & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="overview-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Trend Analysis</h4>
            <div style={{ width: '100%', height: '200px', position: 'relative' }}>
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="200" x2="500" y2="200" stroke="var(--border-subtle)" strokeWidth="1" />
                
                <text x="-25" y="25" fill="var(--text-secondary)" fontSize="10">100%</text>
                <text x="-25" y="115" fill="var(--text-secondary)" fontSize="10">50%</text>
                
                {(() => {
                  const points = [...history].reverse().map((item, idx) => {
                    const x = history.length === 1 ? 250 : (idx / (history.length - 1)) * 500;
                    const y = 200 - (item.score / 100) * 180;
                    return { x, y, score: item.score };
                  });

                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                  return (
                    <>
                      <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="var(--accent)" strokeWidth="3" />
                          <text x={p.x} y={p.y - 12} textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="700">
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

          <div className="overview-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Interview History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-medium)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{h.role} • {h.result || 'Completed'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(h.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: h.score > 80 ? 'var(--success)' : 'var(--warning)' }}>
                    {h.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column - Strengths, Weaknesses, Recs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="overview-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--success)' }}>Strong Topics</h4>
            {strongTopics.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {strongTopics.map((s, i) => <span key={i} style={{ fontSize: '0.85rem', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '6px', fontWeight: 600 }}>{s}</span>)}
              </div>
            ) : <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Complete more interviews to detect strengths.</p>}
          </div>

          <div className="overview-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--danger)' }}>Weak Topics</h4>
            {weakTopics.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {weakTopics.map((w, i) => <span key={i} style={{ fontSize: '0.85rem', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '6px', fontWeight: 600 }}>{w}</span>)}
              </div>
            ) : <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Complete more interviews to detect weak areas.</p>}
          </div>

          <div className="overview-card" style={{ padding: '24px', border: '1px solid var(--accent)', background: 'linear-gradient(180deg, rgba(79, 110, 247, 0.05) 0%, transparent 100%)' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Coaching Recommendations</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
