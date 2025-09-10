import React, { useState } from 'react';

const LineChart = ({ data, title, height = 200, width = "100%" }) => {
  const [activePoint, setActivePoint] = useState(null);
  
  // Find the max value to scale the chart
  const maxValue = Math.max(...data.map(item => item.value));
  
  // Calculate all points for the line
  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - ((item.value / maxValue) * 100),
    value: item.value,
    label: item.label
  }));
  
  // Create the SVG path for the line
  const linePath = points.map((point, index) => {
    return (index === 0 ? 'M' : 'L') + ` ${point.x} ${point.y}`;
  }).join(' ');
  
  // Create the area below the line (for fill)
  const areaPath = linePath + ` L 100 100 L 0 100 Z`;

  const handleMouseEnter = (index) => {
    setActivePoint(index);
  };

  const handleMouseLeave = () => {
    setActivePoint(null);
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="relative w-full" style={{ height }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Area fill */}
          <path
            d={areaPath}
            fill="rgba(59, 130, 246, 0.1)"
          />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
          
          {/* Data points with hover effect */}
          {points.map((point, index) => (
            <g key={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave}>
              <circle
                cx={point.x}
                cy={point.y}
                r={activePoint === index ? "3" : "1.5"}
                fill={activePoint === index ? "#2563eb" : "#3b82f6"}
                stroke="#fff"
                strokeWidth="1"
              />
              
              {/* Value tooltip */}
              {activePoint === index && (
                <>
                  <rect
                    x={point.x - 12}
                    y={point.y - 25}
                    width="24"
                    height="18"
                    rx="3"
                    fill="#1f2937"
                  />
                  <text
                    x={point.x}
                    y={point.y - 12}
                    textAnchor="middle"
                    fontSize="6"
                    fontWeight="bold"
                    fill="white"
                  >
                    {point.value}
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <div key={index} className="text-xs text-gray-500 text-center" style={{ width: `${100 / data.length}%` }}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineChart;
