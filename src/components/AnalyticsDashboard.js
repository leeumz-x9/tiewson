import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, Area, AreaChart 
} from 'recharts';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [realtimeData, setRealtimeData] = useState({
    totalUsers: 0,
    genderDistribution: { male: 0, female: 0, other: 0 },
    ageGroups: {},
    confidenceAverage: 0
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();

    // Real-time stats
    const statsRef = ref(db, 'analytics/dashboard/realtime');
    const unsubscribeStats = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRealtimeData(data);
      }
      setLoading(false);
    });

    // Historical data (last 7 days)
    const historicalRef = ref(db, 'analytics/historical');
    const unsubscribeHistorical = onValue(historicalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([date, stats]) => ({
          date,
          users: stats.totalUsers || 0,
          sessions: stats.totalSessions || 0
        }));
        setHistoricalData(formatted.slice(-7)); // Last 7 days
      }
    });

    return () => {
      unsubscribeStats();
      unsubscribeHistorical();
    };
  }, []);

  // แปลงข้อมูลสำหรับกราฟ
  const genderData = Object.entries(realtimeData.genderDistribution).map(
    ([name, value]) => ({ 
      name: name === 'male' ? 'ชาย' : name === 'female' ? 'หญิง' : 'อื่นๆ', 
      value,
      percentage: ((value / realtimeData.totalUsers) * 100).toFixed(1)
    })
  );

  const ageData = Object.entries(realtimeData.ageGroups || {}).map(
    ([range, count]) => ({ range, count })
  ).sort((a, b) => {
    const aNum = parseInt(a.range.split('-')[0]);
    const bNum = parseInt(b.range.split('-')[0]);
    return aNum - bNum;
  });

  const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28'];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header className="dashboard-header">
        <h1>📊 Analytics Dashboard</h1>
        <div className="header-actions">
          <button className="refresh-btn" onClick={() => window.location.reload()}>
            🔄 รีเฟรช
          </button>
          <div className="live-indicator">
            <span className="pulse"></span>
            Live
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>ผู้ใช้งานทั้งหมด</h3>
            <div className="stat-value">{realtimeData.totalUsers}</div>
            <div className="stat-label">คนในปัจจุบัน</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>ความมั่นใจเฉลี่ย</h3>
            <div className="stat-value">
              {(realtimeData.confidenceAverage * 100).toFixed(1)}%
            </div>
            <div className="stat-label">จากการตรวจจับ</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">👨</div>
          <div className="stat-info">
            <h3>เพศชาย</h3>
            <div className="stat-value">
              {realtimeData.genderDistribution.male || 0}
            </div>
            <div className="stat-label">
              {((realtimeData.genderDistribution.male / realtimeData.totalUsers) * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👩</div>
          <div className="stat-info">
            <h3>เพศหญิง</h3>
            <div className="stat-value">
              {realtimeData.genderDistribution.female || 0}
            </div>
            <div className="stat-label">
              {((realtimeData.genderDistribution.female / realtimeData.totalUsers) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Gender Distribution */}
        <div className="chart-card">
          <h3 className="chart-title">📊 กระจายตามเพศ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="chart-card">
          <h3 className="chart-title">📈 กระจายตามอายุ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Historical Trend */}
        <div className="chart-card full-width">
          <h3 className="chart-title">📉 แนวโน้ม 7 วันที่ผ่านมา</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorUsers)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Age Groups Table */}
        <div className="chart-card full-width">
          <h3 className="chart-title">📋 รายละเอียดช่วงอายุ</h3>
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>ช่วงอายุ</th>
                  <th>จำนวน</th>
                  <th>เปอร์เซ็นต์</th>
                  <th>แท่งกราฟ</th>
                </tr>
              </thead>
              <tbody>
                {ageData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.range} ปี</td>
                    <td>{item.count}</td>
                    <td>
                      {((item.count / realtimeData.totalUsers) * 100).toFixed(1)}%
                    </td>
                    <td>
                      <div className="progress-bar-cell">
                        <div 
                          className="progress-fill" 
                          style={{
                            width: `${(item.count / realtimeData.totalUsers) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;