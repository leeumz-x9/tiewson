import React, { useEffect, useRef } from 'react';
import { GraduationCap, BookOpen, CircleDollarSign, Gamepad2, Newspaper, ArrowRight, Sparkles } from 'lucide-react';
import NewsFeed from './NewsFeed.js'; 

const GeneralInfoView = ({ language, onReset }) => {
  const idleTimer = useRef(null);

  // 🕒 ระบบ Auto-Reset 30 วินาที
  useEffect(() => {
    const startTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        onReset(); // เรียกใช้ handleBackToHome ใน App.js
      }, 30000); 
    };

    // ดักจับการแตะหน้าจอเพื่อเริ่มนับเวลาใหม่
    const activityEvents = ['mousemove', 'mousedown', 'touchstart', 'keypress', 'scroll', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, startTimer));
    
    startTimer(); // เริ่มนับถอยหลังทันทีที่เปิดหน้านี้

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      activityEvents.forEach(event => window.removeEventListener(event, startTimer));
    };
  }, [onReset]);

  const menuItems = [
    { id: 'courses', icon: <BookOpen />, label: { th: 'สาขาที่เปิดสอน', en: 'Courses', zh: '专业', ko: '학과' }, color: 'bg-blue-600' },
    { id: 'fees', icon: <CircleDollarSign />, label: { th: 'ค่าเทอม/ผ่อนชำระ', en: 'Tuition Fees', zh: '学费', ko: '학비' }, color: 'bg-green-600' },
    { id: 'scholarship', icon: <GraduationCap />, label: { th: 'ทุนการศึกษา', en: 'Scholarships', zh: '奖学金', ko: '장학금' }, color: 'bg-purple-600' },
  ];

  const content = {
    th: { welcome: 'ยินดีต้อนรับสู่โปลิฯ', sub: 'เลือกหัวข้อที่สนใจได้เลยเจ้า', game: 'สนุกกับน้องทิวสน', news: 'ข่าวสารและกิจกรรม', start: 'เริ่มเล่นเกม' },
    en: { welcome: 'Welcome to Poly', sub: 'Please select a topic', game: 'Play with Tiew-Son', news: 'News & Events', start: 'Start Game' },
    zh: { welcome: '欢迎来到理工学院', sub: '请选择一个主题', game: '与 Tiew-Son 一起玩', news: '新闻与活动', start: '开始游戏' },
    ko: { welcome: '폴리테크닉에 오신 것을 환영합니다', sub: '주제를 선택해 주세요', game: '티우손과 놀기', news: '뉴스 및 이벤트', start: '게임 시작' }
  }[language] || { welcome: 'ยินดีต้อนรับสู่โปลิฯ', sub: 'เลือกหัวข้อที่สนใจได้เลยเจ้า', game: 'สนุกกับน้องทิวสน', news: 'ข่าวสารและกิจกรรม', start: 'เริ่มเล่นเกม' };

  return (
    <div className="pt-32 px-6 md:px-10 pb-20 max-w-7xl mx-auto h-screen overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
      
      {/* 🏥 1. ส่วนหัวข้อ */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-4 shadow-sm border border-blue-100">
          Lanna Polytechnic Chiang Mai
        </div>
        <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">{content.welcome}</h1>
        <p className="text-slate-500 text-xl font-medium">{content.sub}</p>
      </div>

      {/* 📋 2. เมนูข้อมูลหลัก (ด้านบน) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-xl border border-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 transition-all duration-300 cursor-pointer group">
            <div className={`${item.color} w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white mb-8 group-hover:rotate-12 transition-transform shadow-lg`}>
              {React.cloneElement(item.icon, { size: 36 })}
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
              {item.label[language] || item.label.th}
            </h3>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>{language === 'th' ? 'คลิกเพื่อดูรายละเอียด' : 'Click for details'}</span> <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* 🎮 3. แบนเนอร์เกม (ตรงกลาง) */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden mb-16 border border-slate-700">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none"><Sparkles size={120} /></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
            <Gamepad2 size={48} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black mb-2">{content.game}</h2>
            <p className="text-slate-300 text-lg">{language === 'th' ? 'ร่วมสนุกตอบคำถาม ลุ้นรับของที่ระลึก' : 'Join our quiz and win souvenirs!'}</p>
          </div>
        </div>

        <button className="relative z-10 mt-8 md:mt-0 bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-2xl hover:bg-orange-400 hover:text-white transition-all shadow-xl flex items-center gap-3">
          {content.start}
        </button>
        <img src="/tiewson.png" className="absolute -right-12 -bottom-12 w-64 opacity-20 rotate-12 pointer-events-none" alt="" />
      </div>

      {/* 📰 4. News Feed (ด้านล่าง) */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
            <Newspaper size={28} />
          </div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">{content.news}</h2>
        </div>
        <div className="bg-white/40 backdrop-blur-md rounded-[3.5rem] p-8 border border-white/60 shadow-xl overflow-hidden">
           <NewsFeed language={language} isMinimal={true} />
        </div>
      </div>
      
      <div className="text-center text-slate-400 font-medium pb-10 uppercase tracking-widest text-sm">
        © Lanna Polytechnic Chiangmai
      </div>
    </div>
  );
};

export default GeneralInfoView;