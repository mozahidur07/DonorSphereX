import React from 'react';

const bloodTypeData = [
  {
    type: 'A+',
    percentage: '35.7%',
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    color: 'text-red-500'
  },
  {
    type: 'A-',
    percentage: '6.3%',
    canGiveTo: ['A+', 'A-', 'AB+', 'AB-'],
    canReceiveFrom: ['A-', 'O-'],
    color: 'text-red-500'
  },
  {
    type: 'B+',
    percentage: '8.5%',
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    color: 'text-red-500'
  },
  {
    type: 'B-',
    percentage: '1.5%',
    canGiveTo: ['B+', 'B-', 'AB+', 'AB-'],
    canReceiveFrom: ['B-', 'O-'],
    color: 'text-red-500'
  },
  {
    type: 'AB+',
    percentage: '3.4%',
    canGiveTo: ['AB+'],
    canReceiveFrom: ['All Types'],
    color: 'text-red-500'
  },
  {
    type: 'AB-',
    percentage: '0.6%',
    canGiveTo: ['AB+', 'AB-'],
    canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
    color: 'text-red-500'
  },
  {
    type: 'O+',
    percentage: '37.4%',
    canGiveTo: ['A+', 'B+', 'AB+', 'O+'],
    canReceiveFrom: ['O+', 'O-'],
    color: 'text-red-500'
  },
  {
    type: 'O-',
    percentage: '6.6%',
    canGiveTo: ['All Types'],
    canReceiveFrom: ['O-'],
    color: 'text-red-500'
  }
];

const BloodTypeCard = ({ bloodType }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:-translate-y-2.5">
      <div className="flex items-center mb-4">
        <div className={`${bloodType.color} mr-3`}>
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" className="text-red-600 text-2xl" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M205.22 22.09c-7.94-28.78-49.44-30.12-58.44 0C100.01 179.85 0 222.72 0 333.91 0 432.35 78.72 512 176 512s176-79.65 176-178.09c0-111.75-99.79-153.34-146.78-311.82zM176 448c-61.75 0-112-50.25-112-112 0-8.84 7.16-16 16-16s16 7.16 16 16c0 44.11 35.89 80 80 80 8.84 0 16 7.16 16 16s-7.16 16-16 16z"></path></svg>
        </div>
        <h3 className="text-2xl font-bold">{bloodType.type}</h3>
        <span className="ml-auto text-gray-500">{bloodType.percentage}</span>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">Can Give To:</p>
        <div className="flex flex-wrap gap-2">
          {bloodType.canGiveTo.map((type, index) => (
            <span 
              key={index} 
              className="bg-red-100 text-red-600 px-3 py-1 text-sm rounded-full"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <p className="text-gray-600 mb-2">Can Receive From:</p>
        <div className="flex flex-wrap gap-2">
          {bloodType.canReceiveFrom.map((type, index) => (
            <span 
              key={index} 
              className={`px-3 py-1 text-sm rounded-full ${
                type === 'O+' || type === 'O-' 
                  ? 'bg-green-100 text-green-600' 
                  : type === 'All Types' 
                    ? 'bg-green-100 text-green-600'
                    : type.includes('A') 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-green-100 text-green-600'
              }`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const EmergencySituation = () => {
  return (
    <div className="bg-red-50 rounded-lg border-[1px] border-red-200 p-6 mt-8">
      <div className="flex items-center mb-4">
        <div className="text-red-500 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-red-600">Emergency Situations</h3>
      </div>
      <p className="text-gray-700">
        In emergency situations when the matching blood type is not available: <span className="text-red-600 font-semibold">O-negative blood</span> can be given to patients of all blood types. It's known as the universal donor type.
      </p>
    </div>
  );
};

const Compatibility = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Blood Type Compatibility Guide</h2>
        <p className="text-base text-gray-600 leading-5 max-w-3xl mx-auto">
          Understanding blood type compatibility is crucial for successful transfusions. Find out who you can help and who can help you.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bloodTypeData.map((bloodType, index) => (
          <BloodTypeCard key={index} bloodType={bloodType} />
        ))}
      </div>
      
      <EmergencySituation />
    </div>
  );
};

export default Compatibility;
