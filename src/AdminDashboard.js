// src/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { getDashboardStats } from './analyticsService';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    genderDistribution: {},
    ageDistribution: {},
    hourlyActivity: {},
    deviceTypes: {}
  });

  useEffect(() => {
    const unsubscribe = getDashboardStats((data) => {
      setStats(data);
    });

    return () => unsubscribe();
  }, []);

  const genderData = Object.entries(stats.genderDistribution).map(([name, value]) => ({
    name: name === 'male' ? 'ชาย' : name === 'female' ? 'หญิง' : 'ไม่ระบุ',
    value
  }));

  const ageData = Object.entries(stats.ageDistribution).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => a.name.localeCompare(b.name));

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    users: stats.hourlyActivity[i] || 0
  }));

  const deviceData = Object.entries(stats.deviceTypes).map(([name, value]) => ({
    name: name === 'mobile' ? 'มือถือ' : 'คอมพิวเตอร์',
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90 mb-2">👥 ผู้ใช้งานทั้งหมด</div>
          <div className="text-4xl font-bold">{stats.totalUsers.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90 mb-2">🔥 ผู้ใช้วันนี้</div>
          <div className="text-4xl font-bold">{stats.todayUsers.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90 mb-2">📱 อุปกรณ์ยอดนิยม</div>
          <div className="text-4xl font-bold">{deviceData[0]?.name || 'N/A'}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">👤 การกระจายตามเพศ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎂 การกระจายตามอายุ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Activity */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⏰ ผู้ใช้งานตามช่วงเวลา (24 ชั่วโมง)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="จำนวนผู้ใช้"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📱 ประเภทอุปกรณ์</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Real-time updates
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;