import React, { useState } from 'react';

const BarChart = ({ data, title, height = 200, width = "100%" }) => {
  const [activeBar, setActiveBar] = useState(null);
  
  // Find the max value to scale the chart
  const maxValue = Math.max(...data.map(item => item.value));
  
  const handleMouseEnter = (index) => {
    setActiveBar(index);
  };

  const handleMouseLeave = () => {
    setActiveBar(null);
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div style={{ height }} className="relative w-full">
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
          
          {/* Bars with hover effect */}
          {data.map((item, index) => {
            const barWidth = 100 / (data.length * 2); // Half width for spacing
            const barHeight = (item.value / maxValue) * 100;
            const barX = index * (100 / data.length) + (100 / data.length - barWidth) / 2;
            const barY = 100 - barHeight;
            
            const isActive = activeBar === index;
            
            return (
              <g key={index} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || (isActive ? "#2563eb" : "#3b82f6")}
                  rx="2"
                  ry="2"
                  style={{
                    transition: 'fill 0.2s ease-in-out',
                    filter: isActive ? 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07))' : 'none'
                  }}
                />
                
                {/* Value label on hover */}
                {isActive && (
                  <>
                    <rect
                      x={barX - 2}
                      y={barY - 15}
                      width={barWidth + 4}
                      height="14"
                      rx="3"
                      fill="#1f2937"
                    />
                    <text
                      x={barX + barWidth/2}
                      y={barY - 5}
                      textAnchor="middle"
                      fontSize="6"
                      fontWeight="bold"
                      fill="white"
                    >
                      {item.value}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <div 
            key={index} 
            className={`text-xs ${activeBar === index ? 'text-blue-600 font-medium' : 'text-gray-500'} text-center transition-colors`}
            style={{ width: `${100 / data.length}%` }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
