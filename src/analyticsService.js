// src/analyticsService.js
import { getFirestore, collection, addDoc, query, where, onSnapshot, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// บันทึกการคลิกของผู้ใช้
export const trackClick = async (elementId, pageUrl, coordinates) => {
  try {
    const userId = localStorage.getItem('userId') || 'anonymous_' + Date.now();
    localStorage.setItem('userId', userId);

    await addDoc(collection(db, 'heatmap_clicks'), {
      elementId,
      pageUrl,
      x: coordinates.x,
      y: coordinates.y,
      timestamp: Timestamp.now(),
      userId: userId,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });

    console.log('✅ Click tracked:', { elementId, pageUrl });
  } catch (error) {
    console.error('❌ Error tracking click:', error);
  }
};

// บันทึกข้อมูล Session ของผู้ใช้ (จาก Face Analyzer)
export const trackUserSession = async (userData) => {
  try {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }

    const sessionData = {
      userId: userId,
      gender: userData.gender || null,
      age: userData.age ? parseInt(userData.age) : null,
      sessionStart: Timestamp.now(),
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: navigator.userAgent
    };

    await addDoc(collection(db, 'user_sessions'), sessionData);
    console.log('✅ Session tracked:', sessionData);
  } catch (error) {
    console.error('❌ Error tracking session:', error);
  }
};

// ดึงข้อมูล Heatmap (Real-time)
export const getHeatmapData = (pageUrl, callback) => {
  try {
    const q = query(
      collection(db, 'heatmap_clicks'),
      where('pageUrl', '==', pageUrl)
    );

    return onSnapshot(q, (snapshot) => {
      const clicks = [];
      snapshot.forEach((doc) => {
        clicks.push({ id: doc.id, ...doc.data() });
      });
      console.log('📊 Heatmap loaded:', clicks.length, 'clicks');
      callback(clicks);
    });
  } catch (error) {
    console.error('❌ Error loading heatmap:', error);
    callback([]);
  }
};

// ดึงสถิติผู้ใช้งาน (Real-time)
export const getDashboardStats = (callback) => {
  try {
    const q = query(collection(db, 'user_sessions'));

    return onSnapshot(q, (snapshot) => {
      const sessions = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          sessionStart: data.sessionStart?.toDate()
        });
      });

      console.log('📊 Dashboard loaded:', sessions.length, 'sessions');
      const stats = calculateStats(sessions);
      callback(stats);
    });
  } catch (error) {
    console.error('❌ Error loading dashboard:', error);
    callback({
      totalUsers: 0,
      todayUsers: 0,
      genderDistribution: {},
      ageDistribution: {},
      hourlyActivity: {},
      deviceTypes: {}
    });
  }
};

// คำนวณสถิติ
const calculateStats = (sessions) => {
  const now = new Date();
  const today = sessions.filter(s => {
    if (!s.sessionStart) return false;
    const diff = now - s.sessionStart;
    return diff < 24 * 60 * 60 * 1000;
  });

  const genderCount = sessions.reduce((acc, s) => {
    const gender = s.gender || 'unknown';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  const ageGroups = sessions.reduce((acc, s) => {
    if (!s.age) return acc;
    const group = `${Math.floor(s.age / 10) * 10}-${Math.floor(s.age / 10) * 10 + 9}`;
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const hourlyUsers = sessions.reduce((acc, s) => {
    if (!s.sessionStart) return acc;
    const hour = s.sessionStart.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  return {
    totalUsers: sessions.length,
    todayUsers: today.length,
    genderDistribution: genderCount,
    ageDistribution: ageGroups,
    hourlyActivity: hourlyUsers,
    deviceTypes: sessions.reduce((acc, s) => {
      acc[s.deviceType] = (acc[s.deviceType] || 0) + 1;
      return acc;
    }, {})
  };
};

// ลบข้อมูลเก่า (30 วัน)
export const cleanupOldData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksQuery = query(
      collection(db, 'heatmap_clicks'),
      where('timestamp', '<', Timestamp.fromDate(thirtyDaysAgo))
    );
    const clicksSnapshot = await getDocs(clicksQuery);
    
    let deletedClicks = 0;
    for (const docSnap of clicksSnapshot.docs) {
      await deleteDoc(docSnap.ref);
      deletedClicks++;
    }

    const sessionsQuery = query(
      collection(db, 'user_sessions'),
      where('sessionStart', '<', Timestamp.fromDate(thirtyDaysAgo))
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    let deletedSessions = 0;
    for (const docSnap of sessionsSnapshot.docs) {
      await deleteDoc(docSnap.ref);
      deletedSessions++;
    }

    console.log(`✅ Cleaned: ${deletedClicks} clicks, ${deletedSessions} sessions`);
    return { deletedClicks, deletedSessions };
  } catch (error) {
    console.error('❌ Error cleaning:', error);
    return { deletedClicks: 0, deletedSessions: 0 };
  }
};