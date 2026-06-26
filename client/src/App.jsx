import { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import InterviewPage from './pages/InterviewPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [sessionData, setSessionData] = useState(() => {
    try {
      const saved = sessionStorage.getItem('smith_session_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path, data = null) => {
    if (data) {
      setSessionData(data);
      sessionStorage.setItem('smith_session_data', JSON.stringify(data));
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleRestart = () => {
    setSessionData(null);
    sessionStorage.removeItem('smith_session_data');
    navigate('/interview');
  };

  if (currentPath === '/interview') {
    return (
      <ErrorBoundary>
        <InterviewPage 
          onComplete={(data) => {
            const parsed = (() => {
              try {
                const cleanJson = data.analysis.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanJson);
              } catch {
                return {};
              }
            })();

            const accuracyScore        = parsed.accuracyScore ?? parsed.technicalScore ?? null;
            const confidenceScore      = parsed.confidenceScore ?? null;
            const logicalThinkingScore = parsed.logicalThinkingScore ?? parsed.problemSolvingScore ?? null;
            const communicationScore   = parsed.communicationScore ?? null;
            const codingScore          = parsed.codingScore ?? null;

            const scoresToAverage = [
              accuracyScore,
              confidenceScore,
              logicalThinkingScore,
              communicationScore,
              codingScore
            ].filter((s) => s !== null && s !== undefined);

            const overallScore = parsed.overallScore ?? (
              scoresToAverage.length > 0
                ? Math.round(scoresToAverage.reduce((a, b) => a + b, 0) / scoresToAverage.length)
                : null
            );

            const historyItem = {
              id: `session-${Date.now()}`,
              date: new Date().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              role: data.role,
              level: data.level,
              score: overallScore,
              accuracy: accuracyScore,
              confidence: confidenceScore,
              logicalThinking: logicalThinkingScore,
              result: parsed.hiringRecommendation || 'Borderline',
              qaEvaluations: data.qaEvaluations,
              codingSubmissions: data.codingSubmissions,
              analysis: data.analysis
            };

            try {
              const existing = JSON.parse(localStorage.getItem('smith_interview_history') || '[]');
              localStorage.setItem('smith_interview_history', JSON.stringify([historyItem, ...existing]));
            } catch (e) {
              console.error(e);
            }

            navigate('/dashboard', data);
          }} 
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DashboardPage 
        sessionData={sessionData} 
        onRestart={handleRestart} 
        onLoadHistorySession={(data) => {
          const simulatedSession = {
            role: data.role,
            level: data.level,
            questionCount: data.qaEvaluations?.length || 0,
            analysis: data.analysis,
            qaEvaluations: data.qaEvaluations,
            codingSubmissions: data.codingSubmissions
          };
          setSessionData(simulatedSession);
          sessionStorage.setItem('smith_session_data', JSON.stringify(simulatedSession));
        }}
      />
    </ErrorBoundary>
  );
}
