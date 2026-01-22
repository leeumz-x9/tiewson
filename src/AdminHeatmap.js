// src/AdminHeatmap.js (เพิ่มหน้าให้ครบ)
import React, { useState, useEffect, useRef } from 'react';
import { getHeatmapData } from './analyticsService';

const AdminHeatmap = () => {
  const [clicks, setClicks] = useState([]);
  const [selectedPage, setSelectedPage] = useState('/');
  const [dateFilter, setDateFilter] = useState('today');
  const [intensity, setIntensity] = useState(50);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log('🔍 Loading heatmap for:', selectedPage, 'Filter:', dateFilter);
    const unsubscribe = getHeatmapData(selectedPage, (data) => {
      console.log('📊 Received', data.length, 'clicks for', selectedPage);
      setClicks(data);
    }, dateFilter);

    return () => unsubscribe();
  }, [selectedPage, dateFilter]);

  useEffect(() => {
    if (!canvasRef.current || clicks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clicks.forEach(click => {
      const gradient = ctx.createRadialGradient(
        click.x, click.y, 0,
        click.x, click.y, intensity
      );

      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  }, [clicks, intensity]);

  // ⭐ เพิ่มหน้าทั้งหมดที่มีในเว็บ
  const pages = [
    { path: '/', name: 'Home / หน้าหลัก' },
    { path: '/news', name: 'News Feed / ฟีดข่าว' },
    { path: '/admin', name: 'Admin Panel / ผู้ดูแลระบบ' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🗺️ Heatmap Analytics</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              เลือกหน้า:
            </label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {pages.map(page => (
                <option key={page.path} value={page.path}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ช่วงเวลา:
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="today">วันนี้</option>
              <option value="all">ทั้งหมด</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ความเข้มของ Heatmap: {intensity}px
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">{clicks.length}</div>
            <div className="text-sm text-gray-600 mt-1">
              {dateFilter === 'today' ? 'คลิกวันนี้' : 'คลิกทั้งหมด'}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">
              {new Set(clicks.map(c => c.userId)).size}
            </div>
            <div className="text-sm text-gray-600 mt-1">Unique Users</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ minHeight: '500px', position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto'
          }}
        />
        {clicks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <div className="text-lg font-semibold mb-2">
                ยังไม่มีข้อมูลการคลิก{dateFilter === 'today' ? 'วันนี้' : ''}
              </div>
              <div className="text-sm">
                หน้า: {pages.find(p => p.path === selectedPage)?.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {clicks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔥 Recent Clicks</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {clicks.slice(-10).reverse().map((click) => (
              <div key={click.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">
                  {click.elementId} ({Math.round(click.x)}, {Math.round(click.y)})
                </span>
                <span className="text-xs text-gray-500">
                  {click.timestamp?.toDate().toLocaleString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeatmap;