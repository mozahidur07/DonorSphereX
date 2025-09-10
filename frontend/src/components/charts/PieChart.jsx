import React, { useState } from 'react';

const PieChart = ({ data, title, colors }) => {
  const [activeSlice, setActiveSlice] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles and segments
  const segments = [];
  let cumulativeAngle = 0;

  data.forEach((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = 3.6 * percentage; // 3.6 = 360 / 100
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;
    
    // Calculate the coordinates for the arc
    const startX = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
    const startY = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
    const endX = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
    const endY = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
    
    const largeArcFlag = percentage > 50 ? 1 : 0;

    // Calculate the midpoint angle for label positioning
    const midAngle = startAngle + (angle / 2);
    const midX = 50 + (activeSlice === index ? 22 : 20) * Math.cos(midAngle * Math.PI / 180);
    const midY = 50 + (activeSlice === index ? 22 : 20) * Math.sin(midAngle * Math.PI / 180);
    
    segments.push({
      index,
      item,
      percentage,
      path: `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`,
      midX,
      midY,
      color: colors[index % colors.length]
    });
  });

  const handleMouseEnter = (index) => {
    setActiveSlice(index);
  };

  const handleMouseLeave = () => {
    setActiveSlice(null);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="relative w-full aspect-square max-w-[16rem]">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {segments.map((segment) => (
            <g key={segment.index} 
              onMouseEnter={() => handleMouseEnter(segment.index)} 
              onMouseLeave={handleMouseLeave}
            >
              <path
                d={segment.path}
                fill={segment.color}
                stroke={activeSlice === segment.index ? "#ffffff" : "none"}
                strokeWidth={activeSlice === segment.index ? "1" : "0"}
                style={{ 
                  transform: activeSlice === segment.index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              />
              {activeSlice === segment.index && (
                <>
                  {/* <circle 
                    cx={segment.midX} 
                    cy={segment.midY}
                    r="4" 
                    fill="rgba(0,0,0,0.8)" 
                  /> */}
                  <text
                    x={segment.midX}
                    y={segment.midY + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="6"
                    fontWeight="bold"
                    fill="white"
                    className="rotate-90"
                  >
                    {segment.percentage.toFixed(1)}%
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 w-full">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between mb-1 p-1 rounded transition-colors"
            onMouseEnter={() => handleMouseEnter(index)} 
            onMouseLeave={handleMouseLeave}
            style={{ backgroundColor: activeSlice === index ? `${colors[index % colors.length]}20` : 'transparent' }}
          >
            <div className="flex items-center">
              <span
                className="w-3 h-3 mr-2 rounded-sm"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></span>
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="text-sm font-medium">
              {((item.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
