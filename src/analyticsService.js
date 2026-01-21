// src/analyticsService.js
import { getFirestore, collection, addDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

// บันทึกการคลิกของผู้ใช้
export const trackClick = async (elementId, pageUrl, coordinates) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    await addDoc(collection(db, 'heatmap_clicks'), {
      elementId,
      pageUrl,
      x: coordinates.x,
      y: coordinates.y,
      timestamp: Timestamp.now(),
      userId: user?.uid || 'anonymous',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};

// บันทึกข้อมูล Session ของผู้ใช้
export const trackUserSession = async (userData) => {
  try {
    await addDoc(collection(db, 'user_sessions'), {
      userId: userData.userId,
      gender: userData.gender || null,
      age: userData.age || null,
      sessionStart: Timestamp.now(),
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: navigator.userAgent,
      location: userData.location || null
    });
  } catch (error) {
    console.error('Error tracking session:', error);
  }
};

// ดึงข้อมูล Heatmap (Real-time)
export const getHeatmapData = (pageUrl, callback) => {
  const q = query(
    collection(db, 'heatmap_clicks'),
    where('pageUrl', '==', pageUrl)
  );

  return onSnapshot(q, (snapshot) => {
    const clicks = [];
    snapshot.forEach((doc) => {
      clicks.push({ id: doc.id, ...doc.data() });
    });
    callback(clicks);
  });
};

// ดึงสถิติผู้ใช้งาน (Real-time)
export const getDashboardStats = (callback) => {
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

    const stats = calculateStats(sessions);
    callback(stats);
  });
};

// คำนวณสถิติต่างๆ
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