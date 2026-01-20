import { getDatabase, ref, set, push, onValue, get, update } from 'firebase/database';

export class AnalyticsLogger {
  constructor() {
    this.db = getDatabase();
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isActive = true;
    
    // เริ่มต้น session
    this.initSession();
    
    // ตั้ง heartbeat เพื่ออัพเดทสถานะ
    this.startHeartbeat();
  }

  async initSession() {
    try {
      const sessionRef = ref(this.db, `analytics/sessions/${this.sessionId}`);
      await set(sessionRef, {
        startTime: this.startTime,
        lastSeen: Date.now(),
        device: this.getDeviceInfo(),
        userAgent: navigator.userAgent,
        active: true
      });
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  // บันทึกข้อมูลผู้ใช้
  async logUserData(userData) {
    try {
      const userRef = ref(this.db, `analytics/users/${this.sessionId}`);
      await set(userRef, {
        gender: userData.gender,
        age: userData.age,
        confidence: userData.confidence,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });

      // อัพเดท realtime stats
      await this.updateRealtimeStats();
      
      return true;
    } catch (error) {
      console.error('Error logging user data:', error);
      return false;
    }
  }

  // ติดตาม heatmap
  async trackHeatmap(x, y, eventType = 'click') {
    try {
      const today = new Date().toISOString().split('T')[0];
      const heatmapRef = ref(this.db, `analytics/heatmap/${today}`);
      
      await push(heatmapRef, {
        x: Math.round(x),
        y: Math.round(y),
        timestamp: Date.now(),
        sessionId: this.sessionId,
        eventType
      });

      return true;
    } catch (error) {
      console.error('Error tracking heatmap:', error);
      return false;
    }
  }

  // อัพเดท realtime stats
  async updateRealtimeStats() {
    try {
      const usersRef = ref(this.db, 'analytics/users');
      const snapshot = await get(usersRef);
      
      if (!snapshot.exists()) return;

      const users = snapshot.val();
      const stats = this.calculateStats(users);

      const statsRef = ref(this.db, 'analytics/dashboard/realtime');
      await set(statsRef, {
        ...stats,
        lastUpdated: Date.now()
      });

      return stats;
    } catch (error) {
      console.error('Error updating realtime stats:', error);
      return null;
    }
  }

  calculateStats(users) {
    const userArray = Object.values(users);
    
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0
    };

    const ageGroups = {
      '0-17': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0
    };

    let totalConfidence = 0;

    userArray.forEach(user => {
      // Gender
      if (user.gender) {
        genderDistribution[user.gender] = (genderDistribution[user.gender] || 0) + 1;
      }

      // Age
      if (user.age) {
        const age = parseInt(user.age);
        if (age < 18) ageGroups['0-17']++;
        else if (age < 25) ageGroups['18-24']++;
        else if (age < 35) ageGroups['25-34']++;
        else if (age < 45) ageGroups['35-44']++;
        else if (age < 55) ageGroups['45-54']++;
        else if (age < 65) ageGroups['55-64']++;
        else ageGroups['65+']++;
      }

      // Confidence
      if (user.confidence) {
        totalConfidence += user.confidence;
      }
    });

    return {
      totalUsers: userArray.length,
      genderDistribution,
      ageGroups,
      confidenceAverage: userArray.length > 0 ? totalConfidence / userArray.length : 0
    };
  }

  // บันทึก event
  async logEvent(eventName, eventData = {}) {
    try {
      const eventsRef = ref(this.db, 'analytics/events');
      await push(eventsRef, {
        name: eventName,
        data: eventData,
        timestamp: Date.now(),
        sessionId: this.sessionId
      });

      return true;
    } catch (error) {
      console.error('Error logging event:', error);
      return false;
    }
  }

  // บันทึกระยะเวลาที่อยู่บนหน้า
  async logPageView(pageName, duration) {
    try {
      const pageViewRef = ref(this.db, `analytics/pageViews/${this.sessionId}`);
      await push(pageViewRef, {
        page: pageName,
        duration,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Error logging page view:', error);
      return false;
    }
  }

  // Heartbeat เพื่อรักษา session ให้ active
  startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      if (this.isActive) {
        try {
          const sessionRef = ref(this.db, `analytics/sessions/${this.sessionId}`);
          await update(sessionRef, {
            lastSeen: Date.now(),
            active: true
          });
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }
    }, 30000); // ทุก 30 วินาที
  }

  // สิ้นสุด session
  async endSession() {
    try {
      this.isActive = false;
      
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      const sessionRef = ref(this.db, `analytics/sessions/${this.sessionId}`);
      await update(sessionRef, {
        endTime: Date.now(),
        duration: Date.now() - this.startTime,
        active: false
      });

      // บันทึก historical data
      await this.saveHistoricalData();

      return true;
    } catch (error) {
      console.error('Error ending session:', error);
      return false;
    }
  }

  // บันทึกข้อมูลประวัติศาสตร์
  async saveHistoricalData() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const historicalRef = ref(this.db, `analytics/historical/${today}`);
      
      const snapshot = await get(historicalRef);
      const currentData = snapshot.val() || {
        totalUsers: 0,
        totalSessions: 0
      };

      await update(historicalRef, {
        totalUsers: currentData.totalUsers + 1,
        totalSessions: currentData.totalSessions + 1,
        lastUpdated: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Error saving historical data:', error);
      return false;
    }
  }

  // Helper methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDeviceInfo() {
    return {
      type: this.getDeviceType(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      orientation: window.screen.orientation?.type || 'unknown',
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: window.screen.colorDepth,
      platform: navigator.platform,
      language: navigator.language,
      onLine: navigator.onLine
    };
  }

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Track mouse movement (sampling)
  trackMouseMovement(x, y) {
    // Sample only 1% of movements to reduce data
    if (Math.random() < 0.01) {
      this.trackHeatmap(x, y, 'move');
    }
  }

  // Track clicks
  trackClick(x, y, target) {
    this.trackHeatmap(x, y, 'click');
    this.logEvent('click', {
      target: target?.tagName || 'unknown',
      className: target?.className || '',
      id: target?.id || ''
    });
  }
}

// Singleton instance
let analyticsInstance = null;

export const getAnalyticsLogger = () => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsLogger();
  }
  return analyticsInstance;
};

export default AnalyticsLogger;