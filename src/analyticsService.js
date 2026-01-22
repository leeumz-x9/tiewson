// src/analyticsService.js (แก้ไขให้นับผู้ใช้ถูกต้อง)
import { getFirestore, collection, addDoc, query, where, onSnapshot, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Helper: Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // เช่น "2025-01-23"
};

// Helper: Check if session exists today
const hasSessionToday = () => {
  const lastSessionDate = localStorage.getItem('lastSessionDate');
  const today = getTodayDate();
  return lastSessionDate === today;
};

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
      date: getTodayDate(),
      userId: userId,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });

    console.log('✅ Click tracked:', { elementId, pageUrl, date: getTodayDate() });
  } catch (error) {
    console.error('❌ Error tracking click:', error);
  }
};

// บันทึกข้อมูล Session ของผู้ใช้ (จาก Face Analyzer)
export const trackUserSession = async (userData) => {
  try {
    // เช็คว่าวันนี้สร้าง session ไปแล้วหรือยัง
    if (hasSessionToday()) {
      console.log('⏭️ Session already exists today, skipping...');
      return;
    }

    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }

    const today = getTodayDate();

    const sessionData = {
      userId: userId,
      gender: userData.gender || null,
      age: userData.age ? parseInt(userData.age) : null,
      sessionStart: Timestamp.now(),
      date: today,
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: navigator.userAgent
    };

    await addDoc(collection(db, 'user_sessions'), sessionData);
    
    localStorage.setItem('lastSessionDate', today);
    
    console.log('✅ Session tracked:', sessionData);
  } catch (error) {
    console.error('❌ Error tracking session:', error);
  }
};

// ดึงข้อมูล Heatmap (Real-time) - แยกตามวัน
export const getHeatmapData = (pageUrl, callback, dateFilter = 'today') => {
  try {
    let q;
    
    if (dateFilter === 'today') {
      const today = getTodayDate();
      q = query(
        collection(db, 'heatmap_clicks'),
        where('pageUrl', '==', pageUrl),
        where('date', '==', today)
      );
    } else if (dateFilter === 'all') {
      q = query(
        collection(db, 'heatmap_clicks'),
        where('pageUrl', '==', pageUrl)
      );
    }

    return onSnapshot(q, (snapshot) => {
      const clicks = [];
      snapshot.forEach((doc) => {
        clicks.push({ id: doc.id, ...doc.data() });
      });
      console.log(`📊 Heatmap loaded (${dateFilter}):`, clicks.length, 'clicks for', pageUrl);
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

// ⭐ แก้ไขฟังก์ชันนี้ - คำนวณสถิติให้ถูกต้อง
const calculateStats = (sessions) => {
  const today = getTodayDate();
  
  // นับ Unique Users ตามวัน (ไม่นับซ้ำ)
  const todaySessions = sessions.filter(s => s.date === today);
  const uniqueUsersToday = new Set(todaySessions.map(s => s.userId)).size;

  // นับผู้ใช้ทั้งหมด (รวมผู้ใช้ย้อนหลัง)
  const allUniqueSessions = {};
  sessions.forEach(s => {
    if (!allUniqueSessions[s.userId]) {
      allUniqueSessions[s.userId] = s;
    }
  });
  const totalUniqueUsers = Object.keys(allUniqueSessions).length;

  // กระจายเพศ (จากผู้ใช้ทั้งหมด)
  const genderCount = Object.values(allUniqueSessions).reduce((acc, s) => {
    const gender = s.gender || 'unknown';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  // กระจายอายุ (จากผู้ใช้ทั้งหมด)
  const ageGroups = Object.values(allUniqueSessions).reduce((acc, s) => {
    if (!s.age) return acc;
    const group = `${Math.floor(s.age / 10) * 10}-${Math.floor(s.age / 10) * 10 + 9}`;
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  // ผู้ใช้ตามชั่วโมง (เฉพาะวันนี้)
  const hourlyUsers = todaySessions.reduce((acc, s) => {
    if (!s.sessionStart) return acc;
    const hour = s.sessionStart.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // ประเภทอุปกรณ์ (จากผู้ใช้ทั้งหมด)
  const deviceTypes = Object.values(allUniqueSessions).reduce((acc, s) => {
    acc[s.deviceType] = (acc[s.deviceType] || 0) + 1;
    return acc;
  }, {});

  console.log('📊 Stats calculated:', {
    totalUsers: totalUniqueUsers,
    todayUsers: uniqueUsersToday,
    todaySessions: todaySessions.length
  });

  return {
    totalUsers: totalUniqueUsers, // จำนวนผู้ใช้ทั้งหมด (รวมวันนี้)
    todayUsers: uniqueUsersToday, // จำนวนผู้ใช้วันนี้
    genderDistribution: genderCount,
    ageDistribution: ageGroups,
    hourlyActivity: hourlyUsers,
    deviceTypes: deviceTypes
  };
};

// ลบข้อมูลเก่า (30 วัน)
export const cleanupOldData = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    const clicksQuery = query(
      collection(db, 'heatmap_clicks'),
      where('date', '<', cutoffDate)
    );
    const clicksSnapshot = await getDocs(clicksQuery);
    
    let deletedClicks = 0;
    for (const docSnap of clicksSnapshot.docs) {
      await deleteDoc(docSnap.ref);
      deletedClicks++;
    }

    const sessionsQuery = query(
      collection(db, 'user_sessions'),
      where('date', '<', cutoffDate)
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