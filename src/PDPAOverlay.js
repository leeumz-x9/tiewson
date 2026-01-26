import React from 'react';
import { Shield, Camera } from 'lucide-react';

const PDPAOverlay = ({ onAccept, onDecline, language, setLanguage }) => {
  const content = {
    th: {
      title: 'การใช้งานกล้องและข้อมูลส่วนบุคคล',
      description: 'วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนาใช้กล้องเพื่อวิเคราะห์ข้อมูลพื้นฐาน (เพศและอายุโดยประมาณ) เพื่อแสดงเนื้อหาที่เหมาะสมกับคุณ ข้อมูลทั้งหมดจะไม่ถูกบันทึกและจะถูกลบทันทีเมื่อคุณออกจากระบบ',
      consent: 'ข้าพเจ้ายินยอมให้ใช้กล้องสำหรับการวิเคราะห์ข้อมูลพื้นฐาน',
      accept: 'ยอมรับและเริ่มใช้งาน',
      decline: 'ไม่ยอมรับและเริ่มใช้งาน',
      privacy: '🔒 ข้อมูลของคุณจะถูกรักษาความปลอดภัย',
      mascot: 'สวัสดีเจ้า! ดิฉันน้องทิวสน ยินดีต้อนรับสู่วิทยาลัยโปลิเทคนิคลานนาเจ้า'
    },
    en: {
      title: 'Camera & Personal Data Usage',
      description: 'Lanna Polytechnic College uses camera to analyze basic information (gender and approximate age) to display appropriate content. All data will not be recorded and will be deleted immediately when you leave.',
      consent: 'I consent to the use of camera for basic data analysis',
      accept: 'Accept and Start',
      decline: 'Decline and Start',
      privacy: '🔒 Your data will be kept secure',
      mascot: 'Hello! I\'m Tiew Son, welcome to Lanna Polytechnic College!'
    },
    zh: {
      title: '摄像头和个人数据使用',
      description: '兰纳理工学院使用摄像头分析基本信息（性别和大致年龄）以显示适当的内容。所有数据不会被记录，当您离开时将立即删除。',
      consent: '我同意使用摄像头进行基本数据分析',
      accept: '接受并开始',
      decline: '拒绝并开始',
      privacy: '🔒 您的数据将得到安全保护',
      mascot: '你好！我是小松鼠，欢迎来到兰纳理工学院！'
    },
    ko: {
      title: '카메라 및 개인정보 사용',
      description: '란나 폴리테크닉 대학은 적절한 콘텐츠를 표시하기 위해 기본 정보(성별 및 대략적인 나이)를 분석하는 카메라를 사용합니다. 모든 데이터는 기록되지 않으며 종료 시 즉시 삭제됩니다.',
      consent: '기본 데이터 분석을 위한 카메라 사용에 동의합니다',
      accept: '수락 및 시작',
      decline: '거절 및 시작',
      privacy: '🔒 귀하의 데이터는 안전하게 보호됩니다',
      mascot: '안녕하세요! 저는 띠우손입니다. 란나 폴리테크닉 대학에 오신 것을 환영합니다!'
    }
  };

  const t = content[language] || content.th;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center z-[9999] p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative overflow-hidden text-center">
        
        {/* Language Selector */}
        <div className="absolute top-4 right-4 z-20 flex bg-gray-100 rounded-full p-1 border border-gray-200 shadow-sm">
          {['th', 'en', 'zh', 'ko'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                language === lang ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full shadow-inner">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{t.title}</h2>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 mb-6 border-2 border-yellow-200 text-left">
            <div className="flex items-start gap-3">
              <img src="/tiewson.png" alt="Mascot" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md flex-shrink-0" />
              <p className="text-gray-700 leading-relaxed pt-1 text-sm md:text-base font-medium">{t.mascot}</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed text-sm md:text-base">{t.description}</p>

          <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <Camera className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-600 font-bold">{t.consent}</span>
          </div>

          {/* ปุ่มที่มีขนาดและเอฟเฟกต์เท่ากันเป๊ะ */}
          <div className="flex flex-col gap-4">
            {/* ปุ่มยอมรับ */}
            <button
              onClick={onAccept}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              {t.accept}
            </button>

            {/* ปุ่มไม่ยอมรับ - ขนาดเท่ากัน เอฟเฟกต์เหมือนกัน ต่างแค่สี */}
            <button
              onClick={onDecline}
              className="w-full bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-gray-400/30 active:scale-95"
            >
              {t.decline}
            </button>
          </div>

          <div className="mt-8 text-[10px] text-gray-400 border-t border-gray-100 pt-4">
            <p className="font-bold uppercase tracking-widest mb-2">{t.privacy}</p>
            วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่ <br />
            Lanna Polytechnic Chiangmai Technological College
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDPAOverlay;