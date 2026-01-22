// src/analyticsService.js (ฉบับแก้ไขใหม่ - ไม่มีปัญหาซ้ำ)
import { getFirestore, collection, addDoc, query, where, onSnapshot, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Get today's date
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// บันทึกการคลิก
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

// ⭐ บันทึก Session (แก้ไขใหม่ - ไม่มีการเช็คซ้ำ)
export const trackUserSession = async (userData) => {
  try {
    // สร้าง userId ใหม่ทุกครั้ง (unique)
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const today = getTodayDate();

    console.log('💾 Saving new session:', { userId, date: today });

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
    
    // บันทึก userId ลง localStorage
    localStorage.setItem('userId', userId);
    localStorage.setItem('userGender', userData.gender || 'unknown');
    localStorage.setItem('userAge', userData.age?.toString() || '0');
    localStorage.setItem('lastSessionDate', today);
    
    console.log('✅ Session tracked:', sessionData);
  } catch (error) {
    console.error('❌ Error tracking session:', error);
  }
};

// ดึงข้อมูล Heatmap
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
    } else {
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

// ⭐ ดึงสถิติ Dashboard (แก้ไขใหม่)
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

      console.log('📊 Dashboard loaded:', sessions.length, 'total sessions');
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

// ⭐ คำนวณสถิติ (แก้ไขใหม่ - นับ Unique Users ถูกต้อง)
const calculateStats = (sessions) => {
  const today = getTodayDate();
  
  console.log('🔢 Calculating stats...');
  console.log('📅 Today:', today);
  console.log('📊 Total sessions:', sessions.length);
  
  // นับ Unique Users ทั้งหมด
  const allUniqueUserIds = new Set();
  const allUniqueUsersMap = new Map();
  
  sessions.forEach(s => {
    if (s.userId) {
      allUniqueUserIds.add(s.userId);
      if (!allUniqueUsersMap.has(s.userId)) {
        allUniqueUsersMap.set(s.userId, s);
      }
    }
  });
  
  // นับ Unique Users วันนี้
  const todayUniqueUserIds = new Set();
  sessions
    .filter(s => s.date === today)
    .forEach(s => {
      if (s.userId) {
        todayUniqueUserIds.add(s.userId);
      }
    });
  
  const totalUsers = allUniqueUserIds.size;
  const todayUsers = todayUniqueUserIds.size;
  
  console.log('👥 Total unique users:', totalUsers);
  console.log('🔥 Today unique users:', todayUsers);
  
  // กระจายเพศ
  const genderCount = {};
  allUniqueUsersMap.forEach(s => {
    const gender = s.gender || 'unknown';
    genderCount[gender] = (genderCount[gender] || 0) + 1;
  });

  // กระจายอายุ
  const ageGroups = {};
  allUniqueUsersMap.forEach(s => {
    if (s.age) {
      const group = `${Math.floor(s.age / 10) * 10}-${Math.floor(s.age / 10) * 10 + 9}`;
      ageGroups[group] = (ageGroups[group] || 0) + 1;
    }
  });

  // ผู้ใช้ตามชั่วโมง (วันนี้)
  const hourlyUsers = {};
  sessions
    .filter(s => s.date === today)
    .forEach(s => {
      if (s.sessionStart) {
        const hour = s.sessionStart.getHours();
        hourlyUsers[hour] = (hourlyUsers[hour] || 0) + 1;
      }
    });

  // ประเภทอุปกรณ์
  const deviceTypes = {};
  allUniqueUsersMap.forEach(s => {
    deviceTypes[s.deviceType] = (deviceTypes[s.deviceType] || 0) + 1;
  });

  return {
    totalUsers,
    todayUsers,
    genderDistribution: genderCount,
    ageDistribution: ageGroups,
    hourlyActivity: hourlyUsers,
    deviceTypes
  };
};

// ลบข้อมูลเก่า
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