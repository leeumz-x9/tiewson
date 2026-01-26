import React, { useEffect, useRef, useState } from 'react';
import { GraduationCap, BookOpen, FileText, ArrowRight, X, CheckCircle2, Gamepad2, ChevronRight, Newspaper, Trophy } from 'lucide-react';
import NewsFeed from './NewsFeed.js';

const GeneralInfoView = ({ language, onReset }) => {
    const idleTimer = useRef(null);
    const scrollRef = useRef(null); 
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

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [courseLevel, activeTab]);

    const t = (th, en, zh, ko) => {
        const lang = String(language || 'th').toLowerCase();
        if (lang === 'cn' || lang === 'zh') return zh;
        if (lang === 'kr' || lang === 'ko') return ko;
        if (lang === 'en') return en;
        return th;
    };

    // --- ข้อมูลวิชา (ใช้ชุดเดิมที่ปรับแต่งแล้ว) ---
    const baseCourses = [
        { name: 'สาขางานยานยนต์', eng: 'Auto Mechanical Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/au.jpeg', desc: 'สัมผัสเทคโนโลยียานยนต์ที่ไม่มีวันหยุดนิ่ง เรียนรู้กับนวัตกรรมใหม่ เติมเต็มความฝันของคนรักรถ' },
        { name: 'สาขายานยนต์ไฟฟ้า', eng: 'Electric Vehicle', req: 'เฉพาะผู้จบ ปวช. ช่างยนต์', img: '/images/ev.jpeg', desc: 'ก้าวเข้าสู่ยุคพลังงานสะอาด เจาะลึกระบบยานยนต์ไฟฟ้า (EV) ที่ตลาดทั่วโลกกำลังต้องการ' },
        { name: 'สาขาช่างไฟฟ้ากำลัง', eng: 'Electrical Power Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ep.jpeg', desc: 'รากฐานของอุตสาหกรรม เรียนรู้ระบบติดตั้งและควบคุมไฟฟ้าที่เกี่ยวข้องกับชีวิตประจำวัน' },
        { name: 'สาขาช่างอิเล็กทรอนิกส์', eng: 'Electronics Technology', req: 'จบ ม.3 / ปวช.', img: '/images/el.jpeg', desc: 'ศึกษาเทคโนโลยีภาพ เสียง คมนาคม และหุ่นยนต์อัจฉริยะ เพื่อเป็นสุดยอดช่างแห่งอนาคต' },
        { name: 'สาขาช่างก่อสร้าง', eng: 'Construction Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/co.jpeg', desc: 'เทคนิคการก่อสร้างและนวัตกรรมใหม่ๆ ที่ประยุกต์ใช้ในงานวิศวกรรมโยธาสมัยใหม่' },
        { name: 'สาขาสถาปัตยกรรม', eng: 'Architectural Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ar.jpeg', desc: 'ออกแบบ เขียนแบบ และสร้างแบบจำลอง เพื่อความเป็นมืออาชีพในโลกแห่งการออกแบบ' },
        { name: 'สาขาคอมพิวเตอร์โปรแกรมเมอร์', eng: 'Computer Programmer', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ct.jpg', desc: 'เขียนโค้ด พัฒนาซอฟต์แวร์ และระบบ IoT เพื่อสร้างนวัตกรรมที่เปลี่ยนโลก' },
        { name: 'สาขาการบัญชี', eng: 'Accounting', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/ac.jpeg', desc: 'จัดทำบัญชีและรายงานทางการเงินที่แม่นยำ เส้นทางสู่สายอาชีพที่มั่นคงในทุกองค์กร' },
        { name: 'สาขาการตลาด', eng: 'Marketing', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/mk.jpeg', desc: 'เป็นนักการตลาดมืออาชีพ เรียนรู้วางแผนกลยุทธ์และการสร้างแบรนด์ในยุคดิจิทัล' },
        { name: 'สาขาธุรกิจดิจิทัล', eng: 'Digital Business Technology', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/dt.jpeg', desc: 'วิเคราะห์ข้อมูลและใช้เทคโนโลยีคอมพิวเตอร์เพื่อขับเคลื่อนธุรกิจในยุคไร้พรมแดน' },
        { name: 'สาขาการท่องเที่ยว', eng: 'Tourism', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/tg.jpeg', desc: 'เรียนรู้ศาสตร์แห่งการบริการและนำเที่ยว ผลักดันเสน่ห์การท่องเที่ยวไทยสู่ระดับสากล' },
        { name: 'สาขาการโรงแรม', eng: 'Hotel Management', req: 'จบ ม.3 / ปวช. / ม.6', img: '/images/hm.jpeg', desc: 'ฝึกฝนทักษะการบริหารจัดการโรงแรมระดับสากล เพื่อหัวใจแห่งการบริการที่แท้จริง' }
    ];

    const itCourse = { 
        name: 'สาขาเทคโนโลยีสารสนเทศ', 
        eng: 'Information Technology', 
        req: 'จบ ปวช. / ม.6 หรือเทียบเท่า', 
        img: '/images/it.jpg', 
        desc: 'เน้นการพัฒนาซอฟต์แวร์ ฮาร์ดแวร์ และเครือข่ายอัจฉริยะ เพื่อเป็นผู้เชี่ยวชาญด้าน IT' 
    };

    const diplomaCourses = [itCourse, ...baseCourses];

    return (
        <div className="pt-24 md:pt-32 px-6 md:px-10 pb-10 max-w-7xl mx-auto min-h-screen flex flex-col">
            
            {/* --- Hero Header --- */}
            <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter">
                    {t('ก้าวสู่อนาคตที่เหนือกว่า', 'Lanna Poly Future', '迈向更好的未来', '더 나은 미래를 향해')}
                </h1>
                <p className="text-slate-500 text-xl font-bold uppercase tracking-widest border-b-4 border-blue-600 inline-block pb-2">Lanna Polytechnic College</p>
            </div>

            {/* --- Main Menu Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {[
                    { id: 'courses', icon: <BookOpen />, label: t('สาขาที่เปิดสอน', 'Courses', '开设专业', '개설 학과'), color: 'from-blue-600 to-blue-700' },
                    { id: 'fees', icon: <FileText />, label: t('เอกสารสมัครเรียน', 'Admission', '报名材料', '입학 서류'), color: 'from-emerald-600 to-emerald-700' },
                    { id: 'scholarship', icon: <GraduationCap />, label: t('ทุนการศึกษา', 'Scholarship', '奖学金', '장학금'), color: 'from-indigo-600 to-indigo-700' }
                ].map((item) => (
                    <div key={item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className="group bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:border-blue-300 transition-all cursor-pointer hover:-translate-y-2 active:scale-95"
                    >
                        <div className={`bg-gradient-to-br ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                            {React.cloneElement(item.icon, { size: 32 })}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{item.label}</h3>
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                            <span>ดูรายละเอียด</span> <ChevronRight size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Layout: News (70%) & Game (30%) --- */}
            <div className="flex flex-col lg:flex-row gap-8 mb-16 h-[550px]">
                {/* News Section (ฝั่งซ้าย - เด่นกว่า) */}
                <div className="lg:w-2/3 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50 flex flex-col overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><Newspaper size={28} /></div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase">ข่าวสารและกิจกรรม</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <NewsFeed language={language} isMinimal={true} />
                    </div>
                </div>

                {/* Game Section (ฝั่งขวา - เป็น sidebar) */}
                <div className="lg:w-1/3 flex flex-col gap-6">
                    <div className="flex-1 bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden group">
                        <Gamepad2 className="absolute -right-8 -bottom-8 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" size={200} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4 text-red-500">
                                <Trophy size={24} />
                                <span className="font-black uppercase tracking-tighter">Poly Arcade</span>
                            </div>
                            <h4 className="text-2xl font-black mb-6">พักสายตาด้วยเกมสนุกๆ</h4>
                            <div className="space-y-3">
                                <button onClick={() => window.location.href = '/flappy-pig.html'} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all flex items-center justify-between px-6 shadow-lg">
                                    <span>FLAPPY PIG</span>
                                    <ChevronRight size={20} />
                                </button>
                                <button onClick={() => window.location.href = '/RPS.html'} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black hover:bg-blue-600 border border-slate-700 transition-all flex items-center justify-between px-6 shadow-lg">
                                    <span>RPS BATTLE</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* ข้อมูลเล็กๆ น้อยๆ ใต้เกม */}
                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white">
                        <p className="font-black text-xl mb-1">สนใจสมัครเรียน?</p>
                        <p className="text-blue-100 opacity-80 text-sm">สอบถามเพิ่มเติมได้ที่ประชาสัมพันธ์วิทยาลัย</p>
                    </div>
                </div>
            </div>

            {/* --- Modal Section --- */}
            {activeTab && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setActiveTab(null)}></div>
                    <div className="relative bg-slate-50 w-full h-full md:max-w-6xl md:max-h-[92vh] md:rounded-[4rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                        
                        {/* Modal Header */}
                        <div className="p-8 md:p-12 bg-white flex justify-between items-center border-b sticky top-0 z-20">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                                {activeTab === 'courses' ? t('สาขาที่เปิดสอน', 'Courses', '开设专业', '개설 학과') : t('ข้อมูลการสมัคร', 'Admission', '报名材料', '입학 서류')}
                            </h2>
                            <button onClick={() => setActiveTab(null)} className="p-4 bg-slate-100 hover:bg-red-500 hover:text-white rounded-full transition-all active:scale-90">
                                <X size={40} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div ref={scrollRef} className="overflow-y-auto flex-1 p-6 md:p-14 custom-scrollbar scroll-smooth">
                            {activeTab === 'courses' ? (
                                <div className="space-y-12">
                                    {/* Sub Navigation (Sticky บนสุดของเนื้อหา) */}
                                    <div className="flex gap-4 sticky top-0 z-30 bg-slate-50/90 backdrop-blur py-4">
                                        <button onClick={() => setCourseLevel('voc')} className={`flex-1 py-6 rounded-[2rem] font-black text-3xl shadow-lg transition-all ${courseLevel === 'voc' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>ระดับ ปวช.</button>
                                        <button onClick={() => setCourseLevel('high-voc')} className={`flex-1 py-6 rounded-[2rem] font-black text-3xl shadow-lg transition-all ${courseLevel === 'high-voc' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>ระดับ ปวส.</button>
                                    </div>

                                    {/* List of Cards */}
                                    <div className="grid grid-cols-1 gap-10">
                                        {(courseLevel === 'voc' ? baseCourses : diplomaCourses).map((item, idx) => (
                                            <div key={`${courseLevel}-${idx}`} className="group flex flex-col md:flex-row bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl border border-slate-100 transition-all duration-500 animate-in slide-in-from-bottom-10">
                                                <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                                <div className="md:w-2/3 p-10 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-4xl font-black text-slate-900 mb-2">{item.name}</h4>
                                                        <p className="text-slate-400 font-bold mb-4 italic uppercase tracking-tighter">{item.eng}</p>
                                                        <p className="text-slate-600 text-xl leading-relaxed mb-10">{item.desc}</p>
                                                    </div>
                                                    <div className="p-5 rounded-2xl font-black text-xl flex items-center gap-4 bg-slate-50 text-blue-600 border border-blue-100">
                                                        <CheckCircle2 size={28} /> {item.req}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { title: 'ใบ ปพ.1 (ระเบียนผลเรียน)', detail: 'ฉบับจริงพร้อมสำเนา 2 ชุด' },
                                        { title: 'รูปถ่ายหน้าตรง 1.5 นิ้ว', detail: '3 รูป (ชุดนักศึกษา)' },
                                        { title: 'สำเนาทะเบียนบ้าน', detail: 'นร./บิดา/มารดา อย่างละ 1 ชุด' },
                                        { title: 'สำเนาบัตรประชาชน', detail: 'นร./บิดา/มารดา อย่างละ 1 ชุด' }
                                    ].map((doc, i) => (
                                        <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 flex items-center gap-8 shadow-sm">
                                            <div className="bg-emerald-100 text-emerald-600 p-6 rounded-2xl"><FileText size={40} /></div>
                                            <div>
                                                <h4 className="text-2xl font-black text-slate-800 mb-1">{doc.title}</h4>
                                                <p className="text-emerald-600 text-xl font-bold">{doc.detail}</p>
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