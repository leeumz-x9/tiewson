// PersonalizedNewsView.js
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User, X, ExternalLink, Calendar } from 'lucide-react';

const PersonalizedNewsView = ({ userProfile, language, onNoPresence }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const lastDetectionTime = useRef(Date.now());
  const presenceCheckInterval = useRef(null);

  useEffect(() => {
    fetchPersonalizedNews();
  }, [userProfile]);

  useEffect(() => {
    presenceCheckInterval.current = setInterval(() => {
      const timeSinceLastDetection = Date.now() - lastDetectionTime.current;
      if (timeSinceLastDetection > 30000) {
        onNoPresence();
      }
    }, 1000);
    return () => { if (presenceCheckInterval.current) clearInterval(presenceCheckInterval.current); };
  }, [onNoPresence]);

  const fetchPersonalizedNews = async () => {
    try {
      const newsRef = collection(db, 'news');
      const q = query(newsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const matchesGender = !data.targetGender || data.targetGender === 'all' || data.targetGender === userProfile.gender;
        const matchesAge = !data.targetAgeMin || (userProfile.age >= data.targetAgeMin && userProfile.age <= (data.targetAgeMax || 100));
        if (matchesGender && matchesAge) items.push({ id: doc.id, ...data });
      });
      setNewsItems(items);
    } catch (error) { console.error('Error:', error); }
  };

  const convertUrl = (url, type) => {
    if (!url || !url.includes('drive.google.com')) return url;
    const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
    if (!fileId) return url;
    if (type === 'video') return `https://drive.google.com/file/d/${fileId}/preview`;
    return `https://drive.google.com/thumbnail?sz=w1000&id=${fileId}`;
  };

  const getTitle = (item) => {
    if (language === 'th') return item.titleTh || item.title;
    if (language === 'en') return item.titleEn || item.title;
    if (language === 'zh') return item.titleZh || item.titleEn || item.title;
    if (language === 'ko') return item.titleKo || item.titleEn || item.title;
    return item.title;
  };

  const getDescription = (item) => {
    if (language === 'th') return item.descriptionTh || item.description;
    if (language === 'en') return item.descriptionEn || item.description;
    if (language === 'zh') return item.descriptionZh || item.descriptionEn || item.description;
    if (language === 'ko') return item.descriptionKo || item.descriptionEn || item.description;
    return item.description;
  };

  const getUIText = (key) => {
    const texts = {
      newsTitle: { th: 'ข่าวสารและกิจกรรมสำหรับคุณ', en: 'News & Activities for You', zh: '为您推荐的新闻与活动', ko: '맞춤 뉴스 및 활동' },
      userProfile: { th: 'ข้อมูลผู้ใช้', en: 'User Profile', zh: '用户信息', ko: '사용자 정보' },
      gender: { th: 'เพศ:', en: 'Gender:', zh: '性别:', ko: '성별:' },
      age: { th: 'อายุ:', en: 'Age:', zh: 'อายุ:', ko: '나이:' },
      confidence: { th: 'ความแม่นยำ:', en: 'Accuracy:', zh: '置信度:', ko: '신뢰โด:' },
      male: { th: 'ชาย', en: 'Male', zh: '男', ko: '남성' },
      female: { th: 'หญิง', en: 'Female', zh: '女', ko: '여성' },
      years: { th: 'ปี', en: 'years', zh: '岁', ko: '세' },
      close: { th: 'ปิด', en: 'Close', zh: '关闭', ko: '닫기' }
    };
    return texts[key][language] || texts[key].th;
  };
  const handleInteraction = () => { lastDetectionTime.current = Date.now(); };
  return (
    <div className="min-h-screen bg-white" onClick={handleInteraction}>
      {/* --- Header: Clean Style Without Live Analysis --- */}
      <header className="bg-white border-b-2 border-slate-50 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            
            {/* ฝั่งซ้าย: ชื่อวิทยาลัยคงเดิมทุกประการ ไม่แตะต้อง */}
            <div className="flex items-center">
              <div className="w-20 md:w-24 shrink-0" aria-hidden="true"></div>
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                  วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา <span className="text-blue-600">เชียงใหม่</span>
                </h1>
                <p className="text-slate-400 text-sm md:text-base font-bold mt-1 tracking-[0.2em] uppercase opacity-70">
                  Lanna Polytechnic Chiangmai Technological College
                </p>
              </div>
            </div>

            {/* ฝั่งขวา: ปล่อยว่างเพื่อรองรับปุ่มเปลี่ยนภาษาของคุณ */}
            <div className="flex items-center">
              <div className="w-64 shrink-0"></div>
            </div>

          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 sticky top-36 border border-slate-50">
              <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                {getUIText('userProfile')}
              </h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{getUIText('gender')}</span>
                  <span className="font-black text-slate-800 text-xl">{userProfile.gender === 'male' ? getUIText('male') : getUIText('female')}</span>
                </div>
                <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{getUIText('age')}</span>
                  <span className="font-black text-slate-800 text-xl">{userProfile.age} {getUIText('years')}</span>
                </div>
                <div className="p-6 bg-[#0f172a] rounded-3xl text-white shadow-2xl shadow-slate-300">
                  <span className="font-bold text-[10px] uppercase tracking-widest opacity-60 block mb-2">{getUIText('confidence')}</span>
                  <span className="font-black text-4xl text-blue-400 tracking-tighter">{Math.round(userProfile.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* News Area */}
          <div className="lg:col-span-3">
            <h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tight flex items-center gap-4">
              {getUIText('newsTitle')}
              <div className="h-1.5 flex-1 bg-slate-100 rounded-full mt-2"></div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {newsItems.map(item => (
                <div key={item.id} onClick={() => { setSelectedItem(item); handleInteraction(); }}
                  className="bg-white rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer border border-slate-100 overflow-hidden group transform hover:-translate-y-3">
                  <div className="h-72 bg-slate-100 overflow-hidden relative">
                    <img src={convertUrl(item.mediaUrl, 'image')} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  <div className="p-10">
                    <h3 className="text-2xl font-black mb-4 text-slate-800 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{getTitle(item)}</h3>
                    <p className="text-slate-500 leading-relaxed line-clamp-2 text-base font-medium opacity-80">{getDescription(item)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Detail */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-8 md:p-16"
          onClick={() => { setSelectedItem(null); handleInteraction(); }}>
          <div className="bg-white w-full max-w-7xl rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh]"
            onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative">
              {selectedItem.mediaType === 'video' ? (
                <iframe src={convertUrl(selectedItem.mediaUrl, 'video')} className="w-full h-full aspect-video" allowFullScreen />
              ) : (
                <img src={convertUrl(selectedItem.mediaUrl, 'image')} className="max-w-full max-h-full object-contain" alt="" />
              )}
            </div>
            <div className="w-full md:w-1/3 p-12 flex flex-col overflow-y-auto bg-white">
              <button onClick={() => setSelectedItem(null)} className="ml-auto p-4 hover:bg-slate-100 rounded-full transition text-slate-400 mb-6"><X size={32} /></button>
              <h2 className="text-3xl font-black mb-8 text-slate-900 leading-tight uppercase">{getTitle(selectedItem)}</h2>
              <div className="flex items-center gap-3 mb-10 text-slate-400 font-bold text-xs uppercase tracking-widest border-b border-slate-100 pb-8">
                <Calendar size={18} className="text-blue-600"/> 
                <span>{selectedItem.createdAt?.seconds ? new Date(selectedItem.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}</span>
              </div>
              <p className="text-slate-600 leading-relaxed mb-12 text-xl font-medium flex-1 whitespace-pre-line">{getDescription(selectedItem)}</p>
              <div className="flex gap-4">
                <button onClick={() => setSelectedItem(null)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs hover:bg-slate-200 transition">{getUIText('close')}</button>
                <a href={selectedItem.mediaUrl} target="_blank" rel="noreferrer" className="p-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition"><ExternalLink size={28} /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedNewsView;