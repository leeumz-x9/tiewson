import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import './AdvertisementSlider.css';

const AdvertisementSlider = ({ showWhenNoUser = false }) => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    
    // ดึงข้อมูลโฆษณาจาก Firebase
    const adsRef = ref(db, 'advertisements/slides');
    const unsubscribeAds = onValue(adsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const adsArray = Array.isArray(data) ? data : Object.values(data);
        setAds(adsArray.filter(ad => ad && ad.active !== false));
      }
      setLoading(false);
    });

    // ตรวจสอบสถานะผู้ใช้
    const activeUsersRef = ref(db, 'analytics/dashboard/realtime/totalUsers');
    const unsubscribeUsers = onValue(activeUsersRef, (snapshot) => {
      const totalUsers = snapshot.val() || 0;
      setIsVisible(showWhenNoUser && totalUsers === 0);
    });

    return () => {
      unsubscribeAds();
      unsubscribeUsers();
    };
  }, [showWhenNoUser]);

  // Auto-slide
  useEffect(() => {
    if (!isVisible || ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // เปลี่ยนทุก 5 วินาที

    return () => clearInterval(interval);
  }, [isVisible, ads.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  if (loading) {
    return <div className="ad-loading">Loading advertisements...</div>;
  }

  if (!isVisible || ads.length === 0) return null;

  return (
    <div className="advertisement-slider">
      <div className="slider-wrapper">
        {ads.map((ad, index) => (
          <div
            key={ad.id || index}
            className={`slide ${index === currentIndex ? 'active' : ''} ${
              index === currentIndex - 1 || 
              (currentIndex === 0 && index === ads.length - 1) 
                ? 'prev' 
                : ''
            } ${
              index === currentIndex + 1 || 
              (currentIndex === ads.length - 1 && index === 0) 
                ? 'next' 
                : ''
            }`}
          >
            <div className="slide-background">
              {ad.imageUrl && (
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title || 'Advertisement'} 
                  className="slide-image"
                />
              )}
              {ad.videoUrl && (
                <video 
                  src={ad.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  className="slide-video"
                />
              )}
            </div>
            
            <div className="slide-overlay"></div>
            
            <div className="slide-content">
              {ad.title && <h2 className="slide-title">{ad.title}</h2>}
              {ad.description && (
                <p className="slide-description">{ad.description}</p>
              )}
              {ad.ctaText && ad.ctaLink && (
                <a 
                  href={ad.ctaLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cta-button"
                >
                  {ad.ctaText}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {ads.length > 1 && (
        <>
          <button className="slider-arrow prev-arrow" onClick={prevSlide}>
            ‹
          </button>
          <button className="slider-arrow next-arrow" onClick={nextSlide}>
            ›
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {ads.length > 1 && (
        <div className="slider-dots">
          {ads.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="slider-progress">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${((currentIndex + 1) / ads.length) * 100}%` 
          }}
        />
      </div>
    </div>
  );
};

export default AdvertisementSlider;