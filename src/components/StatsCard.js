import React from 'react';
import './StatsCard.css';

const StatsCard = ({ 
  icon, 
  title, 
  value, 
  label, 
  trend, 
  trendValue,
  color = 'primary',
  loading = false,
  onClick
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendClass = () => {
    if (trend === 'up') return 'trend-up';
    if (trend === 'down') return 'trend-down';
    return 'trend-neutral';
  };

  if (loading) {
    return (
      <div className={`stats-card ${color} loading`}>
        <div className="skeleton-icon"></div>
        <div className="skeleton-content">
          <div className="skeleton-line short"></div>
          <div className="skeleton-line long"></div>
          <div className="skeleton-line medium"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`stats-card ${color} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="card-icon">
        {icon}
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <div className="card-value">{value}</div>
        
        <div className="card-footer">
          <span className="card-label">{label}</span>
          
          {trend && trendValue && (
            <span className={`card-trend ${getTrendClass()}`}>
              <span className="trend-icon">{getTrendIcon()}</span>
              {trendValue}
            </span>
          )}
        </div>
      </div>

      <div className="card-decoration"></div>
    </div>
  );
};

export default StatsCard;