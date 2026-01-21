// src/HeatmapTracker.js - Track การคลิกทุกหน้า
import { useEffect } from 'react';
import { trackClick } from './analyticsService';

const HeatmapTracker = ({ children, enabled = true }) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e) => {
      const element = e.target;
      const elementId = element.id || element.className || element.tagName;
      
      const x = e.clientX;
      const y = e.clientY;
      
      // บันทึกการคลิก
      trackClick(elementId, window.location.pathname, { x, y });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [enabled]);

  return <>{children}</>;
};

export default HeatmapTracker;