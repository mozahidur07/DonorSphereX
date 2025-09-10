import React from 'react';

const StatsCard = ({ title, value, icon, change, changeType = 'increase', changeLabel, bgColor = 'bg-blue-50', textColor = 'text-blue-600', borderColor }) => {
  // Define border color based on the bgColor but make it deeper
  const getBorderColor = () => {
    if (bgColor.includes('blue')) return 'border-blue-300';
    if (bgColor.includes('green')) return 'border-green-300';
    if (bgColor.includes('purple')) return 'border-purple-300';
    if (bgColor.includes('yellow')) return 'border-yellow-300';
    if (bgColor.includes('orange')) return 'border-orange-300';
    if (bgColor.includes('red')) return 'border-red-300';
    return 'border-gray-300';
  };

  // Make the background color lighter
  const getLighterBg = () => {
    if (bgColor.includes('blue-50')) return 'bg-blue-25';
    if (bgColor.includes('green-50')) return 'bg-green-25';
    if (bgColor.includes('purple-50')) return 'bg-purple-25';
    if (bgColor.includes('yellow-50')) return 'bg-yellow-25';
    if (bgColor.includes('orange-50')) return 'bg-orange-25';
    if (bgColor.includes('red-50')) return 'bg-red-25';
    return 'bg-gray-25';
  };

  const defaultBorderColor = getBorderColor();
  const finalBorderColor = borderColor || defaultBorderColor;
  const lighterBg = `bg-white`;  // Use white background with border

  return (
    <div className={`${lighterBg} rounded-lg p-6 shadow-sm border border-solid ${finalBorderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
          <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
          
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'increase' ? 'text-green-600' : 
              changeType === 'decrease' ? 'text-red-600' : 
              changeType === 'pending' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              <span className="mr-1">
                {changeType === 'increase' ? (
                   <svg className="w-5 h-5 pt-[4px] scale-150" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 13a1 1 0 10-2 0v-5.586l-1.293 1.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L12 7.414V13z" clipRule="evenodd" />
                  </svg>
                ) : changeType === 'decrease' ? (
                 <svg className="w-5 h-5 pt-[0px] scale-[1.15]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 12.586V7z" clipRule="evenodd" />
                  </svg>
                ) : changeType === 'pending' ? (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </span>
              {changeLabel ? `${change} ${changeLabel}` : `${change}% from last month`}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${textColor.replace('text', 'bg').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
