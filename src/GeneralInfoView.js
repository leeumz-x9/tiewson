import React, { useEffect, useRef, useState } from 'react';
import {
    GraduationCap, BookOpen, FileText, X, CheckCircle2,
    Gamepad2, ChevronRight, Newspaper, Star, Calendar, UserCheck,
    MapPin, Monitor, Car, Zap, Radio, Building2, Palette, Laptop,
    ShoppingCart, Map, UtensilsCrossed,
    Sparkles, Info, Package, Wrench, Book, User, Activity
} from 'lucide-react';
import NewsFeed from './NewsFeed.js';

const GeneralInfoView = ({ language, onReset }) => {
    const scrollRef = useRef(null);
    const [activeTab, setActiveTab] = useState(null);
    const [courseLevel, setCourseLevel] = useState('voc');

    // เพิ่มระบบ inactivity reset 30 วินาที
    const lastInteractionTime = useRef(Date.now());
    const inactivityInterval = useRef(null);

    useEffect(() => {
        inactivityInterval.current = setInterval(() => {
            const timeSinceLast = Date.now() - lastInteractionTime.current;
            if (timeSinceLast > 30000) {
                if (typeof onReset === 'function') {
                    onReset();
                } else {
                    window.location.href = '/fullscreennew';
                }
            }
        }, 1000);
        const resetInteraction = () => { lastInteractionTime.current = Date.now(); };
        window.addEventListener('mousemove', resetInteraction);
        window.addEventListener('keydown', resetInteraction);
        window.addEventListener('touchstart', resetInteraction);
        return () => {
            if (inactivityInterval.current) clearInterval(inactivityInterval.current);
            window.removeEventListener('mousemove', resetInteraction);
            window.removeEventListener('keydown', resetInteraction);
            window.removeEventListener('touchstart', resetInteraction);
        };
    }, [onReset]);

    const t = (th, en, zh, ko) => {
        const lang = String(language || 'th').toLowerCase();
        if ((lang === 'cn' || lang === 'zh') && zh) return zh;
        if ((lang === 'kr' || lang === 'ko') && ko) return ko;
        if (lang === 'en' && en) return en;
        return th;
    };
    

    useEffect(() => {
        if (activeTab) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [activeTab]);

    const handleLevelChange = (level) => {
        setCourseLevel(level);
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sharedCourses = [
        { id: 'auto', icon: <Car />, image: '/images/au.jpeg', name: t('สาขางานยานยนต์', 'Automotive Technology', '汽车技术', '자동차 기술'), sub: '(Auto)', desc: t('เทคโนโลยียานยนต์พัฒนาไปอย่างไม่มีที่สิ้นสุด...', 'Automotive tech develops endlessly...', '汽车技术无限发展...', '자동차 기술은 무한히 발전합니다...'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'ev', icon: <Zap />, image: '/images/ev.jpeg', name: t('สาขายานยนต์ไฟฟ้า', 'Electric Vehicle', '电动汽车', '전기 자동차'), sub: '(EV)', desc: t('เน้นพัฒนาทักษะด้านยานยนต์สมัยใหม่ ระบบ Clean Energy', 'Focus on EV technology.', '专注于电动汽车技术。', '전기차 기술에 집중하세요.'), req: t('ม.3 หรือ ปวช. โดยตรง', 'Voc/Grade 9', '初中或直接中专', '중학교 또는 직업학교') },
        { id: 'elec', icon: <Zap />, image: '/images/el.jpeg', name: t('สาขาช่างไฟฟ้ากำลัง', 'Electrical Power', '电力工程', '전기 공학'), sub: '(Power)', desc: t('เรียนรู้การติดตั้งระบบไฟฟ้าในอาคารและโรงงาน', 'Electricity foundation.', '电气基础。', '전기 기초.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'electronics', icon: <Radio />, image: '/images/ep.jpeg', name: t('สาขาช่างอิเล็กทรอนิกส์', 'Electronics', '电子学', '전자 공학'), sub: '(Electronics)', desc: t('ศึกษาทางด้านเทคโนโลยีระบบภาพ เสียง คมนาคม', 'Study vision & sound.', '学习视觉和声音技术。', '시각 및 음향 기술을 공부하십시오.'), req: t('จบ ม.3 / ปวช.', 'Grade 9/Voc', '初中/中专毕业', '중학교/직업학교 졸업') },
        { id: 'const', icon: <Building2 />, image: '/images/ct.jpg', name: t('สาขาช่างก่อสร้าง', 'Construction', '建筑工程', '건설 공학'), sub: '(Construction)', desc: t('เทคนิคการก่อสร้างและการบริหารจัดการโครงการ', 'Construction techniques.', '建筑施工技术。', '건설 기술.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'arch', icon: <Palette />, image: '/images/ar.jpeg', name: t('สาขาสถาปัตยกรรม', 'Architectural', '建筑学', '건축학'), sub: '(Architecture)', desc: t('การออกแบบ เขียนแบบก่อสร้าง และ 3D', 'Design & 3D modeling.', '设计和3D建模。', '디자인 및 3D 모델링.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'it-prog', icon: <Laptop />, image: '/images/co.jpeg', name: t('สาขาคอมพิวเตอร์โปรแกรมเมอร์', 'Programmer', '计算机程序设计', '컴퓨터 프로그래머'), sub: '(Programmer)', desc: t('คิดเป็น เขียนโค้ดได้ พัฒนาแอปฯ', 'Think, Code, Innovate.', '思考，编码，创新。', '생각하고, 코딩하고, 혁신하십시오.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'acc', icon: <FileText />, image: '/images/ac.jpeg', name: t('สาขาการบัญชี', 'Accounting', '会计学', '회계학'), sub: '(Accounting)', desc: t('ผลิตนักวิชาชีพบัญชีที่มีความแม่นยำ', 'Professional accountants.', '培养专业会计人才。', '전문 회계사 양성.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'mkt', icon: <ShoppingCart />, image: '/images/mk.jpeg', name: t('สาขาการตลาด', 'Marketing', '市场营销', '마케팅'), sub: '(Marketing)', desc: t('กลยุทธ์การตลาดและ E-Commerce', 'Marketing & E-Commerce.', '营销与电子商务。', '마케팅 및 이커머스.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'digital', icon: <Zap />, image: '/images/dt.jpeg', name: t('สาขาธุรกิจดิจิทัล', 'Digital Business', '数字商务', '디지털 비즈니스'), sub: '(Digital Biz)', desc: t('การบริหารธุรกิจผ่านระบบสารสนเทศ', 'Business Information.', '通过信息系统进行业务管理。', '정보 시스템을 통한 비즈니스 관리.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'tourism', icon: <Map />, image: '/images/tg.jpeg', name: t('สาขาการท่องเที่ยว', 'Tourism', '旅游管理', '관광 경영'), sub: '(Tourism)', desc: t('ศาสตร์แห่งการบริการและศิลปะการนำเที่ยว', 'Tour guiding art.', '导游艺术与服务学。', '관광 가이드 및 서비스 학문.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') },
        { id: 'hotel', icon: <UtensilsCrossed />, image: '/images/hm.jpeg', name: t('สาขาการโรงแรม', 'Hotel Management', '酒店管理', '호텔 경영'), sub: '(Hotel)', desc: t('ฝึกฝนทักษะการโรงแรมอย่างครบวงจร', 'Hotel management.', '全面的酒店管理技能培训。', '종합적인 호텔 관리 기술 교육.'), req: t('จบ ม.3 / ปวช. / ม.6', 'Grade 9/12', '初中/中专/高中毕业', '중학교/직업학교/고등학교 졸업') }
    ];

    return (
        <div className="pt-24 md:pt-32 px-4 md:px-10 pb-10 max-w-[1600px] mx-auto min-h-screen flex flex-col w-full overflow-x-hidden font-sans">
            
            {/* Header Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">
                    {t('ก้าวสู่อนาคตที่เหนือกว่า', 'BEYOND YOUR FUTURE', '迈向卓越未来', '미래를 넘어서')}
                </h1>
                <div className="flex items-center justify-center gap-4">
                    <div className="h-[2px] w-12 bg-blue-600 hidden md:block"></div>
                    <p className="text-blue-600 text-lg md:text-2xl font-bold uppercase tracking-[0.3em]">Lanna Polytechnic College</p>
                    <div className="h-[2px] w-12 bg-blue-600 hidden md:block"></div>
                </div>
            </div>

            {/* Main Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                    { id: 'courses', icon: <BookOpen />, label: t('สาขาที่เปิดสอน', 'COURSES', '专业课程', '개설 학과'), color: 'bg-blue-600' },
                    { id: 'fees', icon: <FileText />, label: t('เอกสารสมัครเรียน', 'ADMISSION', '入学申请', '입학 신청'), color: 'bg-emerald-600' },
                    { id: 'scholarship', icon: <GraduationCap />, label: t('ทุนการศึกษา & ค่าเทอม', 'FEES & SCHOLARSHIP', '奖学金与学费', '장학금 및 학비'), color: 'bg-indigo-600' }
                ].map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)} 
                        className="group bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 text-left flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                        <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-current/20`}>
                            {React.cloneElement(item.icon, { size: 32 })}
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight uppercase">{item.label}</h3>
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase mt-auto">
                            {t('ดูเพิ่มเติม', 'Learn More', '查看详情', '자세히 보기')} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}

                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <Gamepad2 className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-white/10 group-hover:scale-110 transition-all duration-500" size={160} />
                    <div className="relative z-10 h-full flex flex-col">
                        <span className="text-white font-black text-2xl uppercase mb-6">{t('มินิเกม', 'MINI GAMES', '小游戏', '미니 게임')}</span>
                        <div className="grid gap-3 mt-auto">
                            <button onClick={() => window.location.href = '/flappy-pig.html'} className="py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all transform active:scale-95">Flappy Pig</button>
                            <button onClick={() => window.location.href = '/RPS.html'} className="py-3 bg-slate-800 text-white rounded-2xl font-black text-sm border border-slate-700 hover:bg-slate-700 transition-all">RPS Battle</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* News Feed Section */}
            <div className="bg-white rounded-[4rem] p-6 md:p-14 shadow-2xl border border-slate-100 mb-10 relative overflow-hidden">
                <Newspaper className="absolute -top-12 -right-12 text-slate-100" size={300} />
                <div className="relative z-10">
                    <NewsFeed language={language} isMinimal={false} />
                </div>
            </div>

            {/* Modal Content */}
            {activeTab && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xl" onClick={() => setActiveTab(null)}></div>
                    <div className="relative bg-slate-50 w-full h-full md:max-w-6xl md:max-h-[90vh] md:rounded-[4rem] overflow-hidden flex flex-col shadow-3xl border border-white/20">
                        
                        <div className="p-8 md:p-12 bg-white flex justify-between items-center border-b shrink-0">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">
                                    {activeTab === 'courses' ? t('สาขาที่เปิดสอน', 'COURSES', '专业课程', '개설 학과') : 
                                     activeTab === 'scholarship' ? t('ทุนการศึกษา & ค่าธรรมเนียม', 'FEES & SCHOLARSHIP', '奖学金与学费', '장학금 및 학비') : 
                                     t('เอกสารสมัครเรียน', 'ADMISSION', '入学申请', '입학 신청')}
                                </h2>
                                <div className="h-1.5 w-20 bg-blue-600 mt-2 rounded-full"></div>
                            </div>
                            <button onClick={() => setActiveTab(null)} className="p-4 bg-slate-100 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 shadow-inner"><X size={28} /></button>
                        </div>

                        <div ref={scrollRef} className="overflow-y-auto flex-1 p-6 md:p-12 custom-scrollbar overscroll-contain">
                            
                            {/* Admission Docs Tab */}
                            {activeTab === 'fees' && (
                                <div className="space-y-16 pb-16">
                                    <div className="space-y-8">
                                        <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                                            <FileText className="text-blue-600" size={36} />
                                            {t('เอกสารหลักฐานที่ต้องใช้', 'Required Documents', '所需申请材料', '필요 서류')}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { title: t('ใบ ปพ.1 (ฉบับจริง)', 'Original Transcript', '成绩单原件', '성적증명서 원본'), detail: t('พร้อมสำเนา 2 ชุด', 'With 2 copies', '及2份复印件', '사본 2부 포함') },
                                                { title: t('สำเนาทะเบียนบ้าน', 'House Registration', '户口本复印件', '주민등록등본 사본'), detail: t('นักเรียน, บิดา, มารดา', 'Student, Father, Mother', '学生、父亲、母亲', '학생, 부친, 모친') },
                                                { title: t('สำเนาบัตรประชาชน', 'ID Card Copy', '身份证复印件', '신분증 사본'), detail: t('นักเรียน, บิดา, มารดา', 'Student, Father, Mother', '学生、父亲、母亲', '학생, 부친, 모친') },
                                                { title: t('สำเนาสูติบัตร', 'Birth Certificate', '出生证明复印件', '출생증명서 사본'), detail: t('ของนักเรียน', "Student's copy", '学生本人', '학생 본인') }
                                            ].map((doc, i) => (
                                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                                                    <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                                        <CheckCircle2 size={32} />
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-800 mb-2">{doc.title}</h4>
                                                    <p className="text-blue-500 font-bold text-sm">{doc.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-2xl">
                                            <p className="text-amber-800 font-bold">
                                                *** {t('กรณีสมัครทางระบบออนไลน์สามารถนำเอกสารหลักฐานมาภายหลังได้', 'Online applicants can submit documents later', '在线申请者可稍后提交材料', '온라인 신청자는 서류를 나중에 제출할 수 있습니다')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6 p-8 bg-blue-50 rounded-[3rem] border border-blue-100">
                                            <div className="bg-blue-600 text-white p-5 rounded-2xl shadow-lg">
                                                <MapPin size={40} />
                                            </div>
                                            <div>
                                                <h4 className="text-3xl font-black text-blue-900 mb-2">1. {t('เดินทางมาสมัครที่วิทยาลัยฯ', 'Apply at College', '到校现场申请', '대학 방문 접수')}</h4>
                                                <p className="text-blue-700 text-xl font-bold">{t('สมัครด้วยตนเอง ณ ห้องประชาสัมพันธ์', 'Apply in person at Information room', '请前往公关部办公室办理', '홍보실에서 직접 방문 신청')}</p>
                                            </div>
                                        </div>
                                        <div className="relative w-full h-[450px] rounded-[3.5rem] overflow-hidden border-[10px] border-white shadow-2xl bg-slate-200">
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3776.2238384234!2d98.989!3d18.818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDQ5JzA0LjgiTiA5OMKwNTknMjAuNCJF!5e0!3m2!1sth!2sth!4v1"
                                                className="w-full h-full border-0"
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                allowFullScreen
                                                title="Lanna Polytechnic College"
                                            />
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex items-start gap-6 p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100">
                                                <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-lg">
                                                    <Monitor size={40} />
                                                </div>
                                                <div>
                                                    <h4 className="text-3xl font-black text-emerald-900 mb-2">2. {t('สมัครผ่านช่องทางระบบออนไลน์', 'Online Application', '通过在线系统申请', '온라인 시스템 접수')}</h4>
                                                    <p className="text-emerald-700 text-xl font-bold">{t('สะดวก รวดเร็ว ตลอด 24 ชั่วโมง', '24/7 Fast & Easy', '24小时便捷申请', '24시간 편리하고 빠른 신청')}</p>
                                                </div>
                                            </div>
                                            <div className="w-full h-[700px] rounded-[4rem] overflow-hidden border-[12px] border-white shadow-2xl bg-white relative">
                                                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-100 rounded-full z-10"></div>
                                                <iframe src="https://www.lannapoly.ac.th/admission/#/?from=website" className="w-full h-full" title="Admission System" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                           {/* Scholarship & Fees Tab */}
{activeTab === 'scholarship' && (
    <div className="space-y-24 pb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* 1. Hero Section: ทุน กสศ. รุ่นที่ 8 - ข้อมูลครบถ้วน 100% */}
        <section className="relative px-2">
            <div className="group relative bg-slate-900 rounded-[3.5rem] p-1 overflow-hidden shadow-2xl">
                {/* Premium Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 opacity-90 group-hover:scale-110 transition-transform duration-[3s]" />
                
                <div className="relative bg-black/20 backdrop-blur-md rounded-[3.4rem] p-8 md:p-16 border border-white/10">
                    <div className="relative z-10 space-y-12">
                        {/* Header ข้อมูลสถาบัน */}
                        <div className="text-center md:text-left space-y-4">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 text-white">
                                <Sparkles size={16} className="text-orange-300 animate-pulse" />
                                <span className="text-xs font-black tracking-[0.2em] uppercase">
                                    {t('เปิดรับสมัครนักศึกษาทุน กสศ. รุ่นที่ 8', 'EQUITY SCHOLARSHIP GEN 8', '助学金 第8代', '장학금 8기')}
                                </span>
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black text-white leading-tight">
                                {t('วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่', 'Lanna Polytechnic Chiang Mai', '清迈兰纳技术学院', '란나 폴리테크닉 치앙마이')}
                            </h3>
                            <p className="text-xl text-orange-200 font-bold uppercase tracking-[0.3em]">
                                {t('ประจำปีการศึกษา 2569', 'Academic Year 2026', '2026学年', '2026학년도')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* สิทธิประโยชน์ */}
                            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group/item hover:bg-white/20 transition-all">
                                <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                    <CheckCircle2 className="text-orange-400" /> {t('สิทธิประโยชน์', 'Benefits', '福利', '혜택')}
                                </h4>
                                <ul className="space-y-4 text-white font-bold text-lg">
                                    <li className="flex items-start gap-2 italic text-orange-200 underline decoration-2 underline-offset-4">⭐ {t('เรียนฟรีตลอดหลักสูตร', 'Free Tuition', '全免学费', '전액 무료 교육')}</li>
                                    <li>• {t('มีเงินเดือนระหว่างเรียน', 'Monthly Allowance', '月度生活补贴', '매월 수당 지급')}</li>
                                    <li>• {t('หลักสูตร ปวส. 2 ปี', '2-Year Associate Degree', '2年制高职', '2년제 고등직업과정')}</li>
                                </ul>
                            </div>

                            {/* สาขาที่เปิดรับ */}
                            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group/item hover:bg-white/20 transition-all">
                                <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                    <BookOpen className="text-orange-400" /> {t('สาขาที่เปิดรับ', 'Available Majors', '开放专业', '모집 학과')}
                                </h4>
                                <ul className="space-y-4 text-white font-bold text-lg">
                                    <li className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full" /> {t('เทคโนโลยีสารสนเทศ', 'Information Technology', '信息技术', '정보기술')}
                                    </li>
                                    <li className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full" /> {t('การท่องเที่ยว', 'Tourism', '旅游', '관광')}
                                    </li>
                                    <li className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full" /> {t('การบัญชี', 'Accounting', '会计', '회계')}
                                    </li>
                                </ul>
                            </div>

                            {/* โอกาสหลังจบการศึกษา */}
                            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group/item hover:bg-white/20 transition-all">
                                <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                    <GraduationCap className="text-orange-400" /> {t('จบแล้วมีอนาคต', 'Future Career', '毕业前景', '졸업 후 진로')}
                                </h4>
                                <ul className="space-y-4 text-white/90 font-bold">
                                    <li className="flex items-center gap-2">✅ {t('จบแล้วมีงานทำแน่นอน', 'Guaranteed Job', '毕业即就业', '취업 확실')}</li>
                                    <li className="flex items-center gap-2">✅ {t('มีสถานประกอบการรองรับ', 'Partner Companies', '签约企业保障', '협력 업체 대기')}</li>
                                    <li className="flex items-center gap-2">✅ {t('มีมหาวิทยาลัยรองรับการต่อยอด', 'University Pathways', '支持深造', '대학 진학 지원')}</li>
                                </ul>
                            </div>
                        </div>

                        {/* คุณสมบัติ & กำหนดการ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                            <div className="space-y-4">
                                <h5 className="text-orange-300 font-black flex items-center gap-2"><UserCheck size={20} /> {t('คุณสมบัติผู้สมัคร', 'Qualifications', '申请资格', '신청 자격')}</h5>
                                <ul className="text-white/80 space-y-2 font-bold text-sm">
                                    <li>- {t('กำลังจะจบ ม.6 / ปวช.3 หรือเทียบเท่า (กศน.)', 'Graduating G12/Voc3/NFE', '高中/中专毕业', '고교/직업교 졸업예정')}</li>
                                    <li>- {t('GPAX 5 เทอม ไม่ต่ำกว่า 3.00', 'GPAX >= 3.00 (5 Semesters)', '成绩3.00+', 'GPAX 3.00 이상')}</li>
                                    <li>- {t('ขาดแคลนทุนทรัพย์หรือด้อยโอกาส', 'Financial Need / Underprivileged', '家庭贫困或机会缺乏', '저소득층 및 취약계층')}</li>
                                </ul>
                            </div>
                            <div className="flex flex-col items-center md:items-end justify-center">
                                <div className="bg-orange-500 text-white px-10 py-6 rounded-[2rem] text-center shadow-2xl transform hover:scale-105 transition-transform">
                                    <p className="text-xs font-black tracking-widest uppercase mb-2">{t('สมัครได้ตั้งแต่วันนี้', 'Apply Now', '立即申请', '지금 신청하세요')}</p>
                                    <p className="text-2xl font-black">{t('ถึง 15 กุมภาพันธ์ 2569', 'Until Feb 15, 2026', '至2026年2月15日', '2026년 2월 15일까지')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 2. Tuition Fees & All-Inclusive Package */}
        <section className="space-y-16 px-4">
            <div className="text-center space-y-4">
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight uppercase">
                    {t('ค่าธรรมเนียมการศึกษา', 'TUITION FEES', '教育学费', '수강료')}
                </h2>
                <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ปวช. Card */}
                <div className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-slate-100 shadow-xl group hover:-translate-y-2 transition-all duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <span className="text-blue-600 font-black text-xs tracking-widest uppercase italic">Vocational Cert.</span>
                            <h3 className="text-5xl font-black text-slate-900 mt-1">{t('ปวช.', 'VOC', '中专', '직업학교')}</h3>
                        </div>
                        <BookOpen size={48} className="text-blue-100 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between p-5 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-slate-600">{t('ช่างอุตสาหกรรม', 'Industrial', '工业', '공업')}</span>
                            <span className="font-black text-2xl text-slate-900">9,000.-</span>
                        </div>
                        <div className="flex justify-between p-5 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-slate-600">{t('บริหารธุรกิจ / การท่องเที่ยว', 'Business & Tourism', '商务与旅游', '경영 및 관광')}</span>
                            <span className="font-black text-2xl text-slate-900">7,000.-</span>
                        </div>
                    </div>
                    <div className="p-6 bg-blue-600 rounded-[2rem] text-white flex justify-between items-center">
                        <span className="font-bold text-sm">{t('ค่าแรกเข้าและอุปกรณ์ทั้งหมด', 'Full Supplies & Entry', '杂费', '입학금 및 교구')}</span>
                        <span className="font-black text-xl">3,100.-</span>
                    </div>
                </div>

                {/* ปวส. Card */}
                <div className="bg-white rounded-[3.5rem] p-10 md:p-14 border border-slate-100 shadow-xl group hover:-translate-y-2 transition-all duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <span className="text-indigo-600 font-black text-xs tracking-widest uppercase italic">Associate Degree</span>
                            <h3 className="text-5xl font-black text-slate-900 mt-1">{t('ปวส.', 'DIPLOMA', '高职', '고등직업')}</h3>
                        </div>
                        <GraduationCap size={48} className="text-indigo-100 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between p-5 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-slate-600">{t('ช่างอุตสาหกรรม', 'Industrial', '工业', '공업')}</span>
                            <span className="font-black text-2xl text-slate-900">18,700.-</span>
                        </div>
                        <div className="flex justify-between p-5 bg-slate-50 rounded-2xl">
                            <span className="font-bold text-slate-600">{t('บริหารธุรกิจ / การท่องเที่ยว', 'Business & Tourism', '商务与旅游', '경영 및 관광')}</span>
                            <span className="font-black text-2xl text-slate-900">16,000.-</span>
                        </div>
                    </div>
                    <div className="p-6 bg-indigo-600 rounded-[2rem] text-white flex justify-between items-center">
                        <span className="font-bold text-sm">{t('ค่าแรกเข้าและอุปกรณ์ทั้งหมด', 'Full Supplies & Entry', '杂费', '입학금 및 교구')}</span>
                        <span className="font-black text-xl">3,000.-</span>
                    </div>
                </div>
            </div>
        </section>

        {/* 3. Package Items & Contact Footer */}
        <section className="px-4">
            <div className="bg-slate-900 rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <h4 className="text-3xl font-black italic">{t('สิ่งที่คุณจะได้รับ', 'WHAT YOU GET', '包含项目', '제공 항목')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { text: t('อุปกรณ์การเรียนตามหลักสูตร', 'Full Equipment', '教材设备', '실습 도구'), icon: <Wrench size={18} /> },
                                { text: t('หนังสือเรียนทุกวิชา', 'All Textbooks', '全部书本', '전과목 교과서'), icon: <Book size={18} /> },
                                { text: t('ชุดนักศึกษา 2 ชุด', '2 Uniforms', '2套校服', '교복 2벌'), icon: <User size={18} /> },
                                { text: t('ชุดพละ 1 ชุด', '1 PE Uniform', '1套运动服', '체육복 1벌'), icon: <Activity size={18} /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-orange-400">{item.icon}</div>
                                    <span className="font-bold">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-8">
                        <div className="p-8 bg-white/10 backdrop-blur-md rounded-[3rem] border border-white/20 space-y-6">
                            <h5 className="text-xl font-black tracking-tighter text-orange-300">{t('สอบถามข้อมูลเพิ่มเติม', 'CONTACT US', '联系我们', '문의하기')}</h5>
                            <div className="space-y-4 font-bold">
                                <a href="tel:0982473666" className="flex items-center gap-4 hover:text-orange-400 transition-colors">
                                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center"><Monitor size={18} /></div>
                                    098-247-3666
                                </a>
                                <a href="https://www.facebook.com/lannapolyCNX/?locale=th_TH" target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:text-blue-400 transition-colors">
                                    <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center"><Radio size={18} /></div>
                                    Facebook: lannapolyCNX
                                </a>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center"><Zap size={18} /></div>
                                    Line: @lannapoly
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Star size={300} />
                </div>
            </div>
        </section>
    </div>
)}
                            {/* Courses Tab */}
                            {activeTab === 'courses' && (
                                <div className="space-y-10">
                                    <div className="flex gap-4 sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md py-4">
                                        <button onClick={() => handleLevelChange('voc')} className={`flex-1 py-6 rounded-3xl font-black text-2xl transition-all duration-300 ${courseLevel === 'voc' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                                            {t('ระดับ ปวช.', 'Voc. Cert', '中专 (Voc. Cert)', '직업학교 과정')}
                                        </button>
                                        <button onClick={() => handleLevelChange('high-voc')} className={`flex-1 py-6 rounded-3xl font-black text-2xl transition-all duration-300 ${courseLevel === 'high-voc' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'bg-white text-slate-400 hover:text-slate-600'}`}>
                                            {t('ระดับ ปวส.', 'High Voc.', '高职 (High Voc.)', '고등직업 과정')}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                                        {(courseLevel === 'voc' ? sharedCourses : [...sharedCourses, { id: 'it', icon: <Laptop />,  image:'/images/it.jpg',name: t('สาขาเทคโนโลยีสารสนเทศ', 'Information Technology', '信息技术', '정보기술'), sub: '(IT)', desc: t('ซ่อมบำรุง และวางระบบเครือข่าย', 'IT solutions & network.', 'IT解决方案与网络建设。', 'IT 솔루션 및 네트워크 구축.'), req: t('รับ ปวช. และ ม.6', 'Voc / Grade 12', '招收中专和高中毕业生', '직업학교 및 고등학교 졸업생 모집') }]).map((course) => (
                                            <div key={course.id} className="bg-white rounded-[3rem] overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-all group">
                                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                                    <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-blue-600 shadow-lg">
                                                        {React.cloneElement(course.icon, { size: 24 })}
                                                    </div>
                                                </div>
                                                <div className="p-8">
                                                    <h4 className="text-xl font-black text-slate-900 mb-1">{course.name}</h4>
                                                    <p className="text-blue-600 font-bold mb-4">{course.sub}</p>
                                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 h-12 line-clamp-2">{course.desc}</p>
                                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{t('คุณสมบัติ', 'Requirement', '申请条件', '신청 요건')}</span>
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{course.req}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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