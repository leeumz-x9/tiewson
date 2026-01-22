import React from 'react';
import { GraduationCap, BookOpen, CircleDollarSign, Gamepad2 } from 'lucide-react';

const GeneralInfoView = ({ language }) => {
  // ข้อมูลจำลอง (แนะนำให้เชื่อมกับ AdminCMS ในอนาคต)
  const menuItems = [
    { id: 'courses', icon: <BookOpen />, label: { th: 'สาขาที่เปิดสอน', en: 'Courses' }, color: 'bg-blue-600' },
    { id: 'fees', icon: <CircleDollarSign />, label: { th: 'ค่าธรรมเนียมการศึกษา', en: 'Tuition Fees' }, color: 'bg-green-600' },
    { id: 'scholarship', icon: <GraduationCap />, label: { th: 'ทุนการศึกษา', en: 'Scholarships' }, color: 'bg-purple-600' },
  ];

  return (
    <div className="pt-32 px-10 pb-20 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-800 mb-4">
          {language === 'th' ? 'ยินดีต้อนรับสู่โปลิเทคนิคลานนา' : 'Welcome to Lanna Poly'}
        </h1>
        <p className="text-slate-500 text-lg">
          {language === 'th' ? 'ค้นหาข้อมูลที่คุณต้องการได้ที่นี่เจ้า' : 'Find information you need here.'}
        </p>
      </div>

      {/* Grid เมนูข้อมูลวิทยาลัย */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white hover:scale-105 transition-all cursor-pointer group">
            <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-12 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{item.label[language] || item.label.th}</h3>
          </div>
        ))}
      </div>

      {/* แบนเนอร์ชวนเล่นเกม */}
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-[2rem] p-10 text-white flex items-center justify-between shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Gamepad2 size={36} /> อยากสนุกกับน้องทิวสนไหม?
          </h2>
          <p className="text-orange-50 mb-6 text-lg">เล่นเกมตอบคำถามลุ้นรับของรางวัลพิเศษ!</p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-xl font-bold text-lg hover:shadow-xl transition-all">
            เริ่มเล่นเกมเลย
          </button>
        </div>
        <img src="/tiewson.png" className="absolute -right-10 -bottom-10 w-64 opacity-30 rotate-12" alt="Tiewson Background" />
      </div>
    </div>
  );
};

export default GeneralInfoView;