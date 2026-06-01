import React, { useState } from 'react';

export default function PropertyStatusChart({ 
  availableCount = 128, 
  soldCount = 67, 
  rentedCount = 50, 
  reservedCount = 20 
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = availableCount + soldCount + rentedCount + reservedCount;
  
  const getPercentage = (count) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const segments = [
    {
      id: 'available',
      label: 'Available',
      count: availableCount,
      percentage: getPercentage(availableCount),
      color: 'green',
      hex: '#10b981' // Green
    },
    {
      id: 'sold',
      label: 'Sold',
      count: soldCount,
      percentage: getPercentage(soldCount),
      color: 'blue',
      hex: '#3b82f6' // Blue
    },
    {
      id: 'rented',
      label: 'Rented',
      count: rentedCount,
      percentage: getPercentage(rentedCount),
      color: 'orange',
      hex: '#f97316' // Orange
    },
    {
      id: 'reserved',
      label: 'Reserved',
      count: reservedCount,
      percentage: getPercentage(reservedCount),
      color: 'purple',
      hex: '#a855f7' // Purple
    }
  ];

  // SVG Calculations for Donut segment strokes
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~219.91
  
  let accumulatedPercent = 0;

  return (
    <div className="dashboard-card" style={{ height: '100%' }}>
      <div className="card-header">
        <h3>Property Status Overview</h3>
        <select className="card-filter-select" defaultValue="This Year">
          <option value="This Month">This Month</option>
          <option value="This Year">This Year</option>
        </select>
      </div>

      <div className="donut-chart-container">
        {/* Animated SVG Donut Chart */}
        <div className="donut-chart-visual">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            className="donut-chart-svg"
          >
            <circle
              className="donut-hole"
              cx="50"
              cy="50"
              r={radius}
            />
            {segments.map((seg, index) => {
              const strokeLength = (seg.count / total) * circumference;
              const strokeOffset = circumference - ((accumulatedPercent / 100) * circumference);
              
              // Accumulate percentage for the next offset
              accumulatedPercent += (seg.count / total) * 100;
              
              const isHovered = hoveredIndex === index;

              return (
                <circle
                  key={seg.id}
                  className="donut-segment"
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={seg.hex}
                  strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                  strokeDashoffset={strokeOffset}
                  strokeWidth={isHovered ? 13 : 10}
                  style={{
                    transformOrigin: '50px 50px',
                    transition: 'stroke-width 0.25s ease, opacity 0.25s ease, stroke-dashoffset 0.5s ease',
                    opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
          {/* Centered Total Indicator */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase' }}>
              Total
            </span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', marginTop: '-2px' }}>
              {total}
            </div>
          </div>
        </div>

        {/* Legend List */}
        <div className="chart-legend-list">
          {segments.map((seg, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div 
                key={seg.id}
                className="chart-legend-item"
                style={{
                  background: isHovered ? 'var(--bg-main)' : 'transparent',
                  transform: isHovered ? 'translateX(4px)' : 'none'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="legend-left-col">
                  <div className={`legend-dot ${seg.color}`}></div>
                  <span className="legend-label" style={{ fontWeight: isHovered ? '600' : '500' }}>
                    {seg.label}
                  </span>
                </div>
                <div className="legend-stats">
                  <span>{seg.count}</span>
                  <span style={{ color: 'var(--text-light)', marginLeft: '6px', fontSize: '10.5px', fontWeight: '500' }}>
                    ({seg.percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
