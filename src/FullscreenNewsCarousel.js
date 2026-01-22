import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

const FullscreenNewsCarousel = ({ language }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      const newsRef = collection(db, 'news');
      const q = query(newsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsItems(items);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  useEffect(() => {
    if (newsItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % newsItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [newsItems.length]);

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

  if (newsItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">
          {language === 'th' ? 'กำลังโหลดข่าวสาร...' : 'Loading News...'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      
      {/* 🏛️ Header Overlay - ต้นฉบับเดิม ห้ามแตะ */}
      <div className="fixed top-0 left-0 right-0 z-30 p-8 flex items-center gap-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent -z-10 h-40"></div>
        
        <div className="text-white ml-32">
          <h2 className="text-4xl font-black drop-shadow-2xl tracking-tight">
            วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่
          </h2>
          <p className="text-xl text-white/80 font-medium drop-shadow-lg uppercase tracking-wider">
            Lanna Polytechnic Chiangmai Technological College
          </p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {newsItems.map((item, index) => (
          <div key={item.id} className="min-w-full h-full relative flex items-center justify-center">
            <div className="absolute inset-0">
              {item.mediaType === 'video' ? (
                <iframe
                  src={convertUrl(item.mediaUrl, 'video')}
                  className="w-full h-full object-cover"
                  allow="autoplay"
                  title={getTitle(item)}
                />
              ) : (
                <img 
                  src={convertUrl(item.mediaUrl, 'image')} 
                  alt={getTitle(item)}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-12 text-white mt-40 text-left w-full">
              <h1 className="text-7xl font-black mb-8 drop-shadow-2xl leading-tight tracking-tighter">
                {getTitle(item)}
              </h1>
              <p className="text-3xl leading-relaxed drop-shadow-lg line-clamp-3 text-white/90 font-light">
                {getDescription(item)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔘 ส่วนที่แก้ไข: Tiewson (ลบวงกลมขาว ลบวงกลมเขียวบน เหลือแค่ไมค์ขวา) */}
      <div className="fixed bottom-16 right-16 z-50">
        <div className="relative w-28 h-28">
          
          {/* รูปตัวน้องทิวสนลอยๆ ไม่มีวงกลมขาวครอบ */}
          <img 
            src="/tiwson-avatar.png" 
            className="w-full h-full object-contain drop-shadow-2xl" 
            alt="Avatar"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }} 
          />

        </div>
      </div>

      {/* Progress Dots - ต้นฉบับเดิม ห้ามแตะ */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
        {newsItems.map((_, i) => (
          <div 
            key={i}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === currentIndex ? 'w-24 bg-blue-500' : 'w-4 bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FullscreenNewsCarousel;