import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, BookOpen, FileText, ArrowRight, X, CheckCircle2, Gamepad2, ChevronRight, Newspaper, Trophy } from 'lucide-react';
import NewsFeed from './NewsFeed.js';

const GeneralInfoView = ({ language, onReset }) => {
    const idleTimer = useRef(null);
    const scrollRef = useRef(null); 
    const [activeTab, setActiveTab] = useState(null);
    const [courseLevel, setCourseLevel] = useState('voc');

    // ฟังก์ชันช่วยจัดการภาษาที่ครอบคลุมทุกจุด (แก้ไขให้รองรับ fallback ที่ดีขึ้น)
    const t = (th, en, zh, ko) => {
        const lang = String(language || 'th').toLowerCase();
        if ((lang === 'cn' || lang === 'zh') && zh) return zh;
        if ((lang === 'kr' || lang === 'ko') && ko) return ko;
        if (lang === 'en' && en) return en;
        return th;
    };

    useEffect(() => {
        const startTimer = () => {
            if (idleTimer.current) clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => { onReset(); }, 60000); 
        };
        const events = ['mousedown', 'touchstart', 'click', 'scroll'];
        events.forEach(e => window.addEventListener(e, startTimer));
        startTimer();
        return () => {
            if (idleTimer.current) clearTimeout(idleTimer.current);
            events.forEach(e => window.removeEventListener(e, startTimer));
        };
    }, [onReset]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [courseLevel, activeTab]);

    // --- ข้อมูลวิชาแบบ Full Multi-language ---
    const coursesData = [
        {
            id: 'auto',
            img: '/images/au.jpeg',
            tag: 'AUTOMOTIVE',
            name: t('สาขางานยานยนต์', 'Automotive Technology', '汽车技术', '자동차 기술'),
            desc: t('เรียนรู้เทคโนโลยียานยนต์ เครื่องยนต์สมัยใหม่ และระบบหัวฉีดอัจฉริยะ', 'Learn modern engine technology and intelligent injection systems.', '学习现代发动机技術和智能噴射系統。', '현대식 엔진 기술과 지능형 분사 시스템을 배웁니다.'),
            req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9 / Voc / Grade 12', '初中毕业 / 中专 / 高中毕业', '중학교 졸업 / 직업 자격 / 고등학교 졸업')
        },
        {
            id: 'it',
            img: '/images/it.jpg',
            tag: 'IT SOFTWARE',
            name: t('สาขาเทคโนโลยีสารสนเทศ', 'Information Technology', '信息技术', '정보기술'),
            desc: t('เน้นการเขียนโปรแกรม พัฒนาเว็บ แอปพลิเคชัน และระบบเครือข่ายความปลอดภัย', 'Focus on programming, web development, apps, and network security.', '侧重于编程、网站开发、应用和网络安全。', '프로그래밍, 웹 개발, 앱 및 네트워크 보안에 중점을 둡니다.'),
            req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9 / Voc / Grade 12', '初中毕业 / 中专 / 高中毕业', '중학교 졸업 / 직업 자격 / 고등학교 졸업')
        },
        {
            id: 'acc',
            img: '/images/ac.jpeg',
            tag: 'ACCOUNTING',
            name: t('สาขาการบัญชี', 'Accounting', '会计学', '회계학'),
            desc: t('ฝึกฝนทักษะการทำบัญชีดิจิทัล การตรวจสอบภายใน และการจัดการภาษีอากร', 'Master digital accounting, auditing, and tax management skills.', '掌握数字会计、审计和税务管理技能。', '디지털 회계, 감사 및 세무 관리 기술을 습득합니다.'),
            req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9 / Voc / Grade 12', '初中毕业 / 中专 / 高中毕业', '중학교 졸업 / 직업 자격 / 고등학교 졸업')
        }
    ];

    // --- ข้อมูลเอกสารแบบ Full Multi-language ---
    const admissionDocs = [
        { 
            title: t('ใบ ปพ.1 (ฉบับจริง)', 'Original Transcript', '成绩单原件', '성적 증명서 원본'),
            detail: t('พร้อมสำเนา 2 ชุด', 'With 2 copies', '附复印件 2 份', '사본 2부 포함')
        },
        { 
            title: t('รูปถ่าย 1.5 นิ้ว', 'Photo 1.5"', '1.5 英寸照片', '1.5인치 사진'),
            detail: t('3 รูป (ชุดนักเรียนเดิม)', '3 photos in school uniform', '3 张照片（穿校服）', '교복 착용 사진 3장')
        },
        { 
            title: t('ทะเบียนบ้าน', 'House Registration', '户口本', '주적부'),
            detail: t('นักเรียน/บิดา/มารดา', 'Student/Parents', '学生/父母', '학생/부모님')
        }
    ];

    return (
        <div className="pt-24 md:pt-32 px-4 md:px-10 pb-10 max-w-[1600px] mx-auto min-h-screen flex flex-col w-full overflow-x-hidden">
            
            {/* --- Hero Header --- */}
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter transition-all">
                    {t('ก้าวสู่อนาคตที่เหนือกว่า', 'BEYOND YOUR FUTURE', '迈向更好的未来', '더 나은 미래를 향해')}
                </h1>
                <div className="h-2 w-24 bg-blue-600 mx-auto rounded-full mb-4"></div>
                <p className="text-slate-500 text-lg md:text-2xl font-bold uppercase tracking-widest italic">
                    Lanna Polytechnic College
                </p>
            </div>

            {/* --- Menu Grid (Responsive 1-4) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { id: 'courses', icon: <BookOpen />, label: t('สาขาที่เปิดสอน', 'COURSES', '开设专业', '개설 학과'), color: 'bg-blue-600' },
                    { id: 'fees', icon: <FileText />, label: t('เอกสารสมัครเรียน', 'ADMISSION', '报名材料', '입학 서류'), color: 'bg-emerald-600' },
                    { id: 'scholarship', icon: <GraduationCap />, label: t('ทุนการศึกษา', 'SCHOLARSHIP', '奖学金', '장학금'), color: 'bg-indigo-600' }
                ].map((item) => (
                    <button key={item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className="group bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-blue-400 transition-all text-left flex flex-col items-start active:scale-95 w-full"
                    >
                        <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform shadow-lg`}>
                            {React.cloneElement(item.icon, { size: 32 })}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{item.label}</h3>
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                            <span className="text-sm uppercase tracking-wider">{t('ดูเพิ่ม', 'Learn More', '查看更多', '더 보기')}</span> <ChevronRight size={16} />
                        </div>
                    </button>
                ))}

                {/* --- Game Card --- */}
                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                    <Gamepad2 className="absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" size={140} />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 text-red-500 font-black italic text-xs">
                            <Trophy size={16} /> POLY ARCADE
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white mb-6">{t('มินิเกม', 'MINI GAMES', '小游戏', '미니 게임')}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2 relative z-10">
                        <button onClick={() => window.location.href = '/flappy-pig.html'} className="py-3 px-4 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-red-500 hover:text-white transition-all text-center">FLAPPY PIG</button>
                        <button onClick={() => window.location.href = '/RPS.html'} className="py-3 px-4 bg-slate-800 text-white rounded-xl font-black text-sm hover:bg-blue-600 border border-slate-700 transition-all text-center">RPS BATTLE</button>
                    </div>
                </div>
            </div>

            {/* --- News Feed (Full Width) --- */}
            <div className="bg-white rounded-[3rem] p-6 md:p-12 shadow-2xl border border-slate-50 mb-10 overflow-hidden">
                <div className="flex items-center gap-4 mb-8 border-b pb-6">
                    <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><Newspaper size={32} /></div>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter">
                        {t('ข่าวสารประชาสัมพันธ์', 'COLLEGE NEWS', '最新消息', '최신 소식')}
                    </h3>
                </div>
                <div className="min-h-[400px]">
                     <NewsFeed language={language} isMinimal={false} />
                </div>
            </div>

            {/* --- Modal Section --- */}
            {activeTab && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveTab(null)}></div>
                    <div className="relative bg-slate-50 w-full h-full md:max-w-6xl md:max-h-[92vh] md:rounded-[4rem] overflow-hidden flex flex-col shadow-2xl">
                        
                        <div className="p-6 md:p-12 bg-white flex justify-between items-center border-b sticky top-0 z-20">
                            <h2 className="text-2xl md:text-5xl font-black text-slate-900 uppercase">
                                {activeTab === 'courses' ? t('สาขาที่เปิดสอน', 'COURSES', '开设专业', '개설 학과') : t('เอกสารสมัครเรียน', 'ADMISSION', '报名材料', '입학 서류')}
                            </h2>
                            <button onClick={() => setActiveTab(null)} className="p-4 bg-slate-100 hover:bg-red-500 hover:text-white rounded-full transition-all"><X size={32} /></button>
                        </div>

                        <div ref={scrollRef} className="overflow-y-auto flex-1 p-4 md:p-10 custom-scrollbar scroll-smooth">
                            {activeTab === 'courses' ? (
                                <div className="space-y-10">
                                    <div className="flex gap-4 sticky top-0 z-30 bg-slate-50/95 backdrop-blur py-4">
                                        <button onClick={() => setCourseLevel('voc')} className={`flex-1 py-5 rounded-2xl font-black text-xl md:text-3xl shadow-lg transition-all ${courseLevel === 'voc' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>{t('ปวช.', 'Voc. Cert', '中专', '직업 자격')}</button>
                                        <button onClick={() => setCourseLevel('high-voc')} className={`flex-1 py-5 rounded-2xl font-black text-xl md:text-3xl shadow-lg transition-all ${courseLevel === 'high-voc' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>{t('ปวส.', 'High Voc.', '大专', '고급 직업')}</button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8">
                                        {coursesData.map((item, idx) => (
                                            <div key={idx} className="group flex flex-col md:flex-row bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-500">
                                                <div className="md:w-1/3 h-56 md:h-auto overflow-hidden">
                                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight">{item.name}</h4>
                                                        <p className="text-blue-600 font-black mb-4 uppercase text-sm tracking-widest">{item.tag}</p>
                                                        <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-8">{item.desc}</p>
                                                    </div>
                                                    <div className="p-4 rounded-2xl font-black text-base md:text-xl flex items-center gap-3 bg-slate-50 text-slate-700 border border-slate-100">
                                                        <CheckCircle2 className="text-emerald-500" size={24} /> {item.req}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {admissionDocs.map((doc, i) => (
                                        <div key={i} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 shadow-sm">
                                            <div className="bg-emerald-50 text-emerald-600 p-5 rounded-2xl"><FileText size={40} /></div>
                                            <div>
                                                <h4 className="text-2xl font-black text-slate-800 mb-1">{doc.title}</h4>
                                                <p className="text-emerald-600 font-bold text-lg">{doc.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralInfoView;