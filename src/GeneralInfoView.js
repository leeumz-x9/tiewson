import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, BookOpen, FileText, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import NewsFeed from './NewsFeed.js';

const GeneralInfoView = ({ language, onReset }) => {
    const idleTimer = useRef(null);
    const [activeTab, setActiveTab] = useState(null);
    const [courseLevel, setCourseLevel] = useState('voc');

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

    const t = (th, en, zh, ko) => {
        const lang = String(language || 'th').toLowerCase();
        if (lang === 'cn' || lang === 'zh') return zh;
        if (lang === 'kr' || lang === 'ko') return ko;
        if (lang === 'en') return en;
        return th;
    };

    // ปรับ Path รูปภาพให้ตรงกับ Folder public/images ของคุณ
    const baseCourses = [
        { name: 'สาขางานยานยนต์', eng: 'Auto Mechanical Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/au.jpeg', desc: 'เรียนรู้นวัตกรรมยานยนต์และสมรรถนะเครื่องยนต์ระดับโลก' },
        { name: 'สาขายานยนต์ไฟฟ้า', eng: 'Electric Vehicle', req: 'เฉพาะผู้จบ ปวช. ช่างยนต์', img: '/images/ev.jpeg', desc: 'นวัตกรรมพลังงานสะอาดแห่งอนาคต เจาะลึกระบบ EV' },
        { name: 'สาขาช่างไฟฟ้ากำลัง', eng: 'Electrical Power Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ep.jpeg', desc: 'รากฐานแห่งชีวิตและอุตสาหกรรม เรียนรู้การติดตั้งระบบไฟฟ้า' },
        { name: 'สาขาช่างอิเล็กทรอนิกส์', eng: 'Electronics Technology', req: 'จบ ม.3 / ปวช.', img: '/images/el.jpeg', desc: 'เทคโนโลยีระบบภาพ เสียง คมนาคม และหุ่นยนต์อัจฉริยะ' },
        { name: 'สาขาช่างก่อสร้าง', eng: 'Construction Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/co.jpeg', desc: 'วิชาชีพเทคนิคการก่อสร้างและการบริหารจัดการโครงการโยธา' },
        { name: 'สาขาสถาปัตยกรรม', eng: 'Architectural Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ar.jpeg', desc: 'ศิลปะการออกแบบพื้นที่ใช้สอยและการคำนวณโครงสร้าง' },
        { name: 'สาขาคอมพิวเตอร์โปรแกรมเมอร์', eng: 'Computer Programmer', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ct.jpg', desc: 'เขียนโค้ด พัฒนาแแอปพลิเคชัน และระบบ IoT อัจฉริยะ' },
        { name: 'สาขาการบัญชี', eng: 'Accounting', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ac.jpeg', desc: 'เส้นทางสู่นักวิชาชีพบัญชี จัดการข้อมูลทางการเงิน' },
        { name: 'สาขาการตลาด', eng: 'Marketing', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/mk.jpeg', desc: 'ปั้นนักการตลาดมืออาชีพ เรียนรู้กลยุทธ์ E-Commerce' },
        { name: 'สาขาธุรกิจดิจิทัล', eng: 'Digital Business Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/dt.jpeg', desc: 'ผสานคอมพิวเตอร์เข้ากับการบริหารธุรกิจ วิเคราะห์ข้อมูล' },
        { name: 'สาขาการท่องเที่ยว', eng: 'Tourism', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/tg.jpeg', desc: 'เปิดประสบการณ์โลกกว้างผ่านงานบริการและนำเที่ยว' },
        { name: 'สาขาการโรงแรม', eng: 'Hotel Management', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/hm.jpeg', desc: 'มาตรฐานการบริการระดับสากล ฝึกฝนทักษะการจัดการโรงแรม' }
    ];

    const itCourse = { 
        name: 'สาขาเทคโนโลยีสารสนเทศ', 
        eng: 'Information Technology', 
        req: 'จบ ปวช. / ม.6 หรือเทียบเท่า', 
        img: '/images/it.jpg', 
        desc: 'สร้างสรรค์นวัตกรรมด้านซอฟต์แวร์ ฮาร์ดแวร์ และระบบเครือข่ายความปลอดภัย' 
    };

    const diplomaCourses = [itCourse, ...baseCourses];

    return (
        <div className="pt-20 md:pt-32 px-4 md:px-10 pb-10 max-w-7xl mx-auto min-h-screen flex flex-col bg-slate-50/30">
            
            {/* Header Section: Responsive Text Sizes */}
            <div className="text-center mb-8 md:mb-16">
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-4 tracking-tighter">
                    {t('ก้าวสู่อนาคตที่เหนือกว่า', 'Future Starts Here', '迈向更好的未来', '더 나은 미래를 향해')}
                </h1>
                <p className="text-slate-500 text-sm sm:text-xl md:text-2xl font-medium">Lanna Polytechnic College Chiang Mai</p>
            </div>

            {/* Menu Grid: 1 column on mobile, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-12">
                {[
                    { id: 'courses', icon: <BookOpen />, label: t('สาขาที่เปิดสอน', 'Courses', '开设专业', '개설 학과'), color: 'bg-blue-600' },
                    { id: 'fees', icon: <FileText />, label: t('เอกสารการสมัคร', 'Admission', '报名材料', '입학 서류'), color: 'bg-emerald-600' },
                    { id: 'scholarship', icon: <GraduationCap />, label: t('ทุนการศึกษา', 'Scholarship', '奖学金', '장학금'), color: 'bg-indigo-600' }
                ].map((item) => (
                    <div key={item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className="group bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer flex flex-col items-center text-center sm:items-start sm:text-left"
                    >
                        <div className={`${item.color} w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                            {React.cloneElement(item.icon, { size: 32 })}
                        </div>
                        <h3 className="text-xl md:text-3xl font-black text-slate-800 mb-2">{item.label}</h3>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm md:text-lg">
                            <span>{t('คลิกดูข้อมูล', 'Details', '详情', '상세 정보')}</span> <ArrowRight size={16} />
                        </div>
                    </div>
                ))}
            </div>

            <NewsFeed language={language} isMinimal={true} />

            {/* Modal: Fullscreen on Mobile, Floating on Desktop */}
            {activeTab && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setActiveTab(null)}></div>
                    <div className="relative bg-white w-full h-full md:h-auto md:max-w-6xl md:max-h-[90vh] md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
                        
                        {/* Modal Header */}
                        <div className="p-6 md:p-10 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-800">
                                {activeTab === 'courses' ? t('หลักสูตรที่เปิดสอน', 'Courses', '开设专业', '개설 학과') : 
                                 activeTab === 'fees' ? t('เอกสารการสมัคร', 'Admission', '报名材料', '입학 서류') : t('ทุนการศึกษา', 'Scholarship', '奖学金', '장학금')}
                            </h2>
                            <button onClick={() => setActiveTab(null)} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-500"><X size={32} /></button>
                        </div>

                        {/* Modal Content Area */}
                        <div className="overflow-y-auto flex-1 p-6 md:p-10 custom-scrollbar bg-slate-50">
                            {activeTab === 'courses' && (
                                <>
                                    <div className="flex gap-2 mb-8 sticky top-0 bg-slate-50 py-2 z-10">
                                        {['voc', 'high-voc'].map(level => (
                                            <button key={level}
                                                onClick={() => setCourseLevel(level)}
                                                className={`flex-1 py-4 rounded-xl font-black text-lg md:text-2xl transition-all ${courseLevel === level ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-200'}`}
                                            >
                                                {level === 'voc' ? 'ปวช.' : 'ปวส.'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        {(courseLevel === 'voc' ? baseCourses : diplomaCourses).map((item, idx) => (
                                            <div key={idx} className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="md:w-2/3 p-6 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-xl md:text-3xl font-black text-slate-800">{item.name}</h4>
                                                        <p className="text-slate-400 font-bold text-xs md:text-sm mb-3 uppercase italic">{item.eng}</p>
                                                        <p className="text-slate-600 text-sm md:text-lg leading-relaxed mb-4">{item.desc}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-blue-600 font-black text-xs md:text-base bg-blue-50 p-3 rounded-lg">
                                                        <CheckCircle2 size={18} /> {item.req}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {activeTab === 'fees' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { title: 'ใบ ปพ.1', detail: 'ฉบับจริงพร้อมสำเนา 2 ชุด' },
                                        { title: 'รูปถ่าย 1-1.5 นิ้ว', detail: '3 รูป (ชุดนักเรียน)' },
                                        { title: 'สำเนาทะเบียนบ้าน', detail: 'นร./พ่อ/แม่ อย่างละ 1 ชุด' },
                                        { title: 'สำเนาบัตรประชาชน', detail: 'นร./พ่อ/แม่ อย่างละ 1 ชุด' }
                                    ].map((doc, i) => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-4">
                                            <div className="bg-emerald-500 text-white p-3 rounded-xl"><FileText size={24} /></div>
                                            <div>
                                                <h4 className="text-lg md:text-xl font-black text-slate-800">{doc.title}</h4>
                                                <p className="text-slate-500 text-sm md:text-base">{doc.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="sm:col-span-2 bg-slate-900 p-8 rounded-2xl text-center text-white mt-4">
                                        <p className="text-lg md:text-xl font-bold">ติดต่อสมัครเรียนได้ทุกวัน</p>
                                        <p className="opacity-70 text-sm">ณ วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'scholarship' && (
                                <div className="p-20 text-center text-slate-300 italic text-2xl font-black uppercase">
                                    Updating Soon
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