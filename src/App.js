// App.js
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import PDPAOverlay from './PDPAOverlay.js';
import FullscreenNewsCarousel from './FullscreenNewsCarousel.js';
import FaceAnalyzerPopup from './FaceAnalyzerPopup.js';
import PersonalizedNewsView from './PersonalizedNewsView.js';
import TiewSonAI from './TiewSonAI.js';
import AdminCMS from './AdminCMS.js';

function App() {
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [language, setLanguage] = useState('th');
  const [userProfile, setUserProfile] = useState(null);
  const [showFaceAnalyzer, setShowFaceAnalyzer] = useState(false);
  const [mode, setMode] = useState('carousel');
  const [showAdmin, setShowAdmin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdmin(true);
        return 0;
      }
      return newCount;
    });

    if (window.logoTimer) clearTimeout(window.logoTimer);
    window.logoTimer = setTimeout(() => setLogoClickCount(0), 2000);
  };

  const handlePDPAAccept = () => {
    setPdpaAccepted(true);
  };

  const handleFaceDetected = () => {
    setShowFaceAnalyzer(true);
  };

  const handleAnalysisComplete = (profile) => {
    setUserProfile(profile);
    setShowFaceAnalyzer(false);
    setMode('personalized');
  };

  const handleNoPresence = () => {
    setMode('carousel');
    setUserProfile(null);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'a') {
        setShowAdmin(!showAdmin);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAdmin]);

  if (showAdmin) {
    return (
      <div>
        <button
          onClick={() => setShowAdmin(false)}
          className="fixed top-4 right-4 bg-red-700 text-white px-5 py-2.5 rounded-lg z-50 font-medium hover:bg-red-800 transition-colors shadow-lg"
        >
          ออกจากโหมด Admin
        </button>
        <AdminCMS />
      </div>
    );
  }

  if (!pdpaAccepted) {
    return <PDPAOverlay onAccept={handlePDPAAccept} language={language} />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-400/20 to-blue-400/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Logo - วางไว้นอก component */}
        <div 
          className="fixed top-8 left-8 z-50 cursor-pointer select-none"
          onClick={handleLogoClick}
        >
          <img
            src="/polylogo.png"
            alt="Lanna Poly Logo"
            className="w-20 h-20 object-contain drop-shadow-lg transition-transform duration-75 active:scale-95 hover:scale-105"
          />
        </div>

        {/* Language Selector - Professional Style */}
        <div className="fixed top-8 right-8 z-30 flex gap-2 bg-white/80 backdrop-blur-md p-2.5 rounded-2xl shadow-xl border border-white/50">
          {['th', 'en', 'zh', 'ko'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-200 ${
                language === lang
                  ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'bg-white/60 text-gray-700 hover:bg-white hover:shadow-md'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {mode === 'carousel' ? (
          <FullscreenNewsCarousel 
            language={language}
            onLogoClick={handleLogoClick}
          />
        ) : (
          <PersonalizedNewsView
            userProfile={userProfile}
            language={language}
            onNoPresence={handleNoPresence}
          />
        )}

        {/* Face Analyzer Popup */}
        {showFaceAnalyzer && (
          <FaceAnalyzerPopup
            onClose={() => setShowFaceAnalyzer(false)}
            onAnalysisComplete={handleAnalysisComplete}
            language={language}
          />
        )}

        {/* Tiew Son AI - Always floating */}
        <TiewSonAI language={language} onLanguageChange={setLanguage} />

        {/* Trigger Button for Face Detection - Professional Style */}
        {mode === 'carousel' && (
          <button
            onClick={handleFaceDetected}
            className="fixed bottom-8 left-8 bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105 z-30 flex items-center gap-3 border border-white/30 backdrop-blur-sm"
          >
            <Camera className="w-6 h-6" />
            <span className="font-bold text-lg">
              {language === 'th' ? 'เริ่มวิเคราะห์' : 
               language === 'en' ? 'Start Analysis' :
               language === 'zh' ? '开始分析' : 
               '분석 시작'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

export default App;