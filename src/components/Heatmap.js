import React, { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import './Heatmap.css';

const Heatmap = ({ width = 1920, height = 1080 }) => {
  const canvasRef = useRef(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [dateRange, setDateRange] = useState('today');
  const [intensity, setIntensity] = useState(50);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    let heatmapRef;

    if (dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0];
      heatmapRef = ref(db, `analytics/heatmap/${today}`);
    } else if (dateRange === 'week') {
      heatmapRef = ref(db, 'analytics/heatmap');
    }

    const unsubscribe = onValue(heatmapRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (dateRange === 'today') {
          setHeatmapData(Object.values(data));
        } else {
          // รวมข้อมูลทั้งอาทิตย์
          const allPoints = [];
          Object.values(data).forEach(day => {
            if (day && typeof day === 'object') {
              allPoints.push(...Object.values(day));
            }
          });
          setHeatmapData(allPoints);
        }
      }
    });

    return () => unsubscribe();
  }, [dateRange]);

  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // ล้าง canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // วาด background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // วาด grid (ถ้าเปิดใช้งาน)
    if (showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // สร้าง density map
    const densityMap = createDensityMap(heatmapData, canvas.width, canvas.height);

    // วาด heatmap
    drawHeatmap(ctx, densityMap, canvas.width, canvas.height);

    // วาด hotspots
    drawHotspots(ctx, heatmapData, intensity);

  }, [heatmapData, intensity, showGrid]);

  const createDensityMap = (points, width, height) => {
    const cellSize = 20;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const density = Array(rows).fill(0).map(() => Array(cols).fill(0));

    points.forEach(point => {
      const col = Math.floor(point.x / cellSize);
      const row = Math.floor(point.y / cellSize);
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        density[row][col]++;
      }
    });

    return { density, cellSize, cols, rows };
  };

  const drawHeatmap = (ctx, densityMap, width, height) => {
    const { density, cellSize, cols, rows } = densityMap;
    const maxDensity = Math.max(...density.flat());

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = density[row][col];
        if (value > 0) {
          const alpha = (value / maxDensity) * (intensity / 100);
          const color = getHeatmapColor(value / maxDensity);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
  };

  const drawHotspots = (ctx, points, radius) => {
    const processedPoints = aggregateNearbyPoints(points, 30);

    processedPoints.forEach(point => {
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );

      const color = getHeatmapColor(point.count / processedPoints.length);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`);
      gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const aggregateNearbyPoints = (points, threshold) => {
    const clusters = [];
    const processed = new Set();

    points.forEach((point, i) => {
      if (processed.has(i)) return;

      const cluster = { x: point.x, y: point.y, count: 1 };
      processed.add(i);

      points.forEach((other, j) => {
        if (i !== j && !processed.has(j)) {
          const dist = Math.sqrt(
            Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)
          );
          if (dist < threshold) {
            cluster.x = (cluster.x * cluster.count + other.x) / (cluster.count + 1);
            cluster.y = (cluster.y * cluster.count + other.y) / (cluster.count + 1);
            cluster.count++;
            processed.add(j);
          }
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  };

  const getHeatmapColor = (value) => {
    // Blue -> Green -> Yellow -> Red
    if (value < 0.25) {
      return { r: 0, g: Math.floor(value * 4 * 255), b: 255 };
    } else if (value < 0.5) {
      return { r: 0, g: 255, b: Math.floor((1 - (value - 0.25) * 4) * 255) };
    } else if (value < 0.75) {
      return { r: Math.floor((value - 0.5) * 4 * 255), g: 255, b: 0 };
    } else {
      return { r: 255, g: Math.floor((1 - (value - 0.75) * 4) * 255), b: 0 };
    }
  };

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x < width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const downloadHeatmap = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `heatmap-${dateRange}-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2>🔥 Heatmap การใช้งาน</h2>
        <div className="heatmap-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="control-select"
          >
            <option value="today">วันนี้</option>
            <option value="week">7 วันที่ผ่านมา</option>
          </select>

          <label className="control-label">
            ความเข้ม: {intensity}%
            <input
              type="range"
              min="10"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="control-slider"
            />
          </label>

          <label className="control-checkbox">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            แสดง Grid
          </label>

          <button onClick={downloadHeatmap} className="download-btn">
            💾 ดาวน์โหลด
          </button>
        </div>
      </div>

      <div className="heatmap-wrapper">
        <canvas 
          ref={canvasRef} 
          width={width} 
          height={height}
          className="heatmap-canvas"
        />
      </div>

      <div className="heatmap-stats">
        <div className="stat-item">
          <span className="stat-label">จุดที่ติดตาม:</span>
          <span className="stat-value">{heatmapData.length.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">ช่วงเวลา:</span>
          <span className="stat-value">
            {dateRange === 'today' ? 'วันนี้' : '7 วันที่ผ่านมา'}
          </span>
        </div>
      </div>

      <div className="heatmap-legend">
        <div className="legend-title">ระดับความหนาแน่น</div>
        <div className="legend-gradient">
          <span>ต่ำ</span>
          <div className="gradient-bar"></div>
          <span>สูง</span>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;