import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import PDPAOverlay from './PDPAOverlay.js';
import FullscreenNewsCarousel from './FullscreenNewsCarousel.js';
import FaceAnalyzerPopup from './FaceAnalyzerPopup.js';
import PersonalizedNewsView from './PersonalizedNewsView.js';
import TiewSonAI from './TiewSonAI.js';
import AdminCMS from './AdminCMS.js';
import HeatmapTracker from './HeatmapTracker.js';
// ⭐ 1. อย่าลืม Import หน้าใหม่ที่คุณจะสร้าง
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
    setMode('carousel'); // ยอมรับแล้วไปหน้าหลัก
  };

  // ⭐ 2. แก้ฟังก์ชันนี้: เมื่อไม่ยอมรับ ให้เข้าแอปในโหมด "ข้อมูลทั่วไป"
  const handlePDPADecline = () => {
    setPdpaAccepted(true); 
    setMode('general'); 
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

  // ⭐ 3. หน้าแรกสุด (PDPA)
  if (!pdpaAccepted) {
    return (
      <PDPAOverlay 
        onAccept={handlePDPAAccept} 
        onDecline={handlePDPADecline} // ส่งฟังก์ชันไปที่ปุ่ม "ไม่ยอมรับและเริ่มใช้งาน"
        language={language} 
        setLanguage={setLanguage} 
      />
    );
  }

  return (
    <HeatmapTracker enabled={true}>
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Background Decorative Elements... (เหมือนเดิม) */}
        
        <div className="relative z-10">
          {/* Logo & Language Selector... (เหมือนเดิม) */}

          {/* ⭐ 4. Main Content Switcher */}
          {mode === 'carousel' ? (
            <FullscreenNewsCarousel language={language} onLogoClick={handleLogoClick} />
          ) : mode === 'personalized' ? (
            <PersonalizedNewsView userProfile={userProfile} language={language} onNoPresence={handleNoPresence} />
          ) : (
            // ⭐ หน้าสำหรับคนที่กด "ไม่ยอมรับ" - โชว์ค่าเทอม/สาขา/ปุ่มเกม
            <GeneralInfoView language={language} />
          )}

          {/* Face Analyzer Popup */}
          {showFaceAnalyzer && (
            <FaceAnalyzerPopup
              onClose={() => setShowFaceAnalyzer(false)}
              onAnalysisComplete={handleAnalysisComplete}
              language={language}
            />
          )}

          {/* ⭐ 5. TiewSon AI จะแสดงผลในทุกโหมดตามที่คุณต้องการ */}
          <TiewSonAI language={language} onLanguageChange={setLanguage} />

          {/* Trigger Button - โชว์เฉพาะตอนเป็น Carousel */}
          {mode === 'carousel' && (
            <button
              onClick={handleFaceDetected}
              className="fixed bottom-8 left-8 bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-30 flex items-center gap-3"
            >
              <Camera className="w-6 h-6" />
              <span className="font-bold text-lg">
                {language === 'th' ? 'เริ่มวิเคราะห์' : 'Start Analysis'}
              </span>
            </button>
          )}
        </div>
      </div>
    </HeatmapTracker>
  );
}

export default App;