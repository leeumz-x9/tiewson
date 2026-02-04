import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import PDPAOverlay from './PDPAOverlay.js';
import FullscreenNewsCarousel from './FullscreenNewsCarousel.js';
import FaceAnalyzerPopup from './FaceAnalyzerPopup.js';
import PersonalizedNewsView from './PersonalizedNewsView.js';
import TiewSonAI from './TiewSonAI.js';
import AdminCMS from './AdminCMS.js';
import HeatmapTracker from './HeatmapTracker.js';
import GeneralInfoView from './GeneralInfoView.js'; 

function App() {
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [language, setLanguage] = useState('th');
  const [userProfile, setUserProfile] = useState(null);
  const [showFaceAnalyzer, setShowFaceAnalyzer] = useState(false);
  const [mode, setMode] = useState('carousel'); // 'carousel', 'personalized', 'general'
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
    setMode('carousel'); 
  };

  const handlePDPADecline = () => {
    setPdpaAccepted(true); 
    setMode('general'); 
  };

  // 🔄 แก้ไขฟังก์ชันรีเซ็ต: ให้กลับไปหน้า Carousel ทันทีโดยไม่เด้งไปหน้า PDPA
  const handleBackToHome = () => {
    console.log("Auto-Reset: Returning directly to Carousel");
    setPdpaAccepted(true);   // ✅ ให้เป็น true ไว้เสมอ เพื่อไม่ให้หน้าขาว PDPA โผล่มา
    setMode('carousel');      // ✅ สั่งให้เปลี่ยนเป็นหน้าโฆษณา
    setUserProfile(null);
    setShowFaceAnalyzer(false);
  };

  const handleFaceDetected = () => setShowFaceAnalyzer(true);

  const handleAnalysisComplete = (profile) => {
    setUserProfile(profile);
    setShowFaceAnalyzer(false);
    setMode('personalized');
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'a') setShowAdmin(!showAdmin);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAdmin]);

  if (showAdmin) {
    return (
      <div>
        <button onClick={() => setShowAdmin(false)} className="fixed top-4 right-4 bg-red-700 text-white px-5 py-2.5 rounded-lg z-[60] font-medium hover:bg-red-800 transition-colors shadow-lg">
          ออกจากโหมด Admin
        </button>
        <AdminCMS />
      </div>
    );
  }

  // แสดงหน้า PDPA ครั้งแรกครั้งเดียวตอนเปิดเครื่อง
  if (!pdpaAccepted) {
    return (
      <PDPAOverlay 
        onAccept={handlePDPAAccept} 
        onDecline={handlePDPADecline} 
        language={language} 
        setLanguage={setLanguage} 
      />
    );
  }

  return (
    <HeatmapTracker enabled={true}>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        
        {/* 🌐 Header Section */}
        <div className="relative z-50">
          <div className="fixed top-8 left-8 cursor-pointer select-none" onClick={handleLogoClick}>
            <img src="/polylogo.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
          </div>

          <div className="fixed top-8 right-8 flex gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50">
            {['th', 'en', 'zh', 'ko'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-4 py-2 rounded-xl font-black transition-all ${
                  language === lang ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 📺 Main Content Section */}
        <div className="relative z-10">
          {mode === 'carousel' ? (
            <FullscreenNewsCarousel language={language} onLogoClick={handleLogoClick} />
          ) : mode === 'personalized' ? (
            <PersonalizedNewsView 
                userProfile={userProfile} 
                language={language} 
                onNoPresence={handleBackToHome} 
            />
          ) : (
            <GeneralInfoView language={language} onReset={handleBackToHome} />
          )}

          {showFaceAnalyzer && (
            <FaceAnalyzerPopup onClose={() => setShowFaceAnalyzer(false)} onAnalysisComplete={handleAnalysisComplete} language={language} />
          )}

          <TiewSonAI language={language} onLanguageChange={setLanguage} />

          {mode === 'carousel' && (
            <button
              onClick={handleFaceDetected}
              className="fixed bottom-8 left-8 bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-30 flex items-center gap-3 animate-bounce shadow-teal-500/20"
            >
              <Camera className="w-6 h-6" />
              <span className="font-bold text-lg">{language === 'th' ? 'เริ่มวิเคราะห์' : 'Start Analysis'}</span>
            </button>
          )}
        </div>
      </div>
    </HeatmapTracker>
  );
}

export default App;